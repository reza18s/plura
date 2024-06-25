/* eslint-disable no-console */
"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Agency,
  Lane,
  Plan,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import { v4 } from "uuid";
import {
  CreateFunnelFormSchema,
  CreateMediaType,
  UpsertFunnelPage,
} from "./types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const getAuthUserDetails = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return;
    }
    const userData = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      include: {
        Agency: {
          include: {
            SidebarOption: true,
            SubAccount: {
              include: {
                SidebarOption: true,
              },
            },
          },
        },
        Permissions: true,
      },
    });
    return userData;
  } catch (error) {
    console.log(error);
  }
};
export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  try {
    const authUser = await currentUser();
    let userData;
    if (!authUser) {
      const response = await db.user.findFirst({
        where: {
          Agency: {
            SubAccount: {
              some: { id: subaccountId },
            },
          },
        },
      });
      if (response) {
        userData = response;
      }
    } else {
      userData = await db.user.findUnique({
        where: { email: authUser?.emailAddresses[0].emailAddress },
      });
    }
    if (!userData) {
      // eslint-disable-next-line no-console
      console.log("Could not find a user");
      return;
    }

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
      if (!subaccountId) {
        throw new Error(
          "You need to provide atleast an agency Id or subaccount Id",
        );
      }
      const response = await db.subAccount.findUnique({
        where: { id: subaccountId },
      });
      if (response) foundAgencyId = response.agencyId;
    }
    if (subaccountId) {
      await db.notification.create({
        data: {
          notification: `${userData.name} | ${description}`,
          User: {
            connect: {
              id: userData.id,
            },
          },
          Agency: {
            connect: {
              id: foundAgencyId,
            },
          },
          SubAccount: {
            connect: { id: subaccountId },
          },
        },
      });
    } else {
      await db.notification.create({
        data: {
          notification: `${userData.name} | ${description}`,
          User: {
            connect: {
              id: userData.id,
            },
          },
          Agency: {
            connect: {
              id: foundAgencyId,
            },
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const CreateTeamUser = async (agencyId: string, user: User) => {
  try {
    if (user.role === "AGENCY_OWNER") return null;
    const response = await db.user.create({ data: { ...user } });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const verifyAndAcceptInvitation = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return redirect("/sign-in");
    }
    const invitationExists = await db.invitation.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        status: "PENDING",
      },
    });
    if (invitationExists) {
      const userDetails = await CreateTeamUser(invitationExists.agencyId, {
        id: user.id,
        email: invitationExists.email,
        agencyId: invitationExists.agencyId,
        name: `${user.firstName} ${user.lastName}`,
        role: invitationExists.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatarUrl: user.imageUrl,
      });
      await saveActivityLogsNotification({
        agencyId: invitationExists?.agencyId,
        description: "joined",
        subaccountId: undefined,
      });
      if (userDetails) {
        await clerkClient.users.updateUserMetadata(user.id, {
          privateMetadata: {
            role: userDetails.role || "SUBACCOUNT_USER",
          },
        });
        await db.invitation.delete({
          where: { email: userDetails.email },
        });
      } else return null;
    } else {
      const agency = await db.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
      });
      return agency ? agency.agencyId : null;
    }
  } catch (error) {
    console.log(error);
  }
};
export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>,
) => {
  try {
    const response = await db.agency.update({
      where: { id: agencyId },
      data: { ...agencyDetails },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const delAgency = async (agencyId: string) => {
  try {
    const response = await db.agency.delete({ where: { id: agencyId } });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const initUser = async (newUser: Partial<User>) => {
  try {
    const user = await currentUser();
    if (!user) return;

    const userData = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        id: user.id,
        avatarUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });

    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });

    return userData;
  } catch (error) {
    console.log(error);
  }
};
export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const notification = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: { createdAt: "desc" },
    });
    return notification;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });
  if (!agencyOwner) return console.log("🔴Erorr could not create subaccount");
  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: { name: "Lead Cycle" },
      },
      SidebarOption: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });
  return response;
};
export const getUserPermissions = async (userId: string) => {
  try {
    const response = await db.user.findUnique({
      where: { id: userId },
      select: { Permissions: { include: { SubAccount: true } } },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const updateUser = async (user: Partial<User>) => {
  try {
    const response = await db.user.update({
      where: { email: user.email },
      data: { ...user },
    });

    await clerkClient.users.updateUserMetadata(response.id, {
      privateMetadata: {
        role: user.role || "SUBACCOUNT_USER",
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};
export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean,
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });
    return response;
  } catch (error) {
    console.log("🔴Could not change permission", error);
  }
};
export const getSubaccountDetails = async (subAccountId: string) => {
  try {
    const userData = await db.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
    });
    return userData;
  } catch (error) {
    console.log(error);
  }
};
export const deleteSubAccount = async (subAccountId: string) => {
  try {
    const userData = await db.subAccount.delete({
      where: {
        id: subAccountId,
      },
    });
    return userData;
  } catch (error) {
    console.log(error);
  }
};
export const getAgencyUsers = async (agencyId: string) => {
  try {
    const response = db.user.findMany({
      where: {
        Agency: {
          id: agencyId,
        },
      },
      include: {
        Agency: { include: { SubAccount: true } },
        Permissions: { include: { SubAccount: true } },
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const getUser = async (userId: string) => {
  try {
    const response = db.user.findUnique({
      where: { id: userId },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const deleteUser = async (userId: string) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: undefined,
      },
    });
    const deletedUser = await db.user.delete({ where: { id: userId } });

    return deletedUser;
  } catch (error) {
    console.log(error);
  }
};
export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string,
) => {
  try {
    const response = await db.invitation.create({
      data: { email, agencyId, role },
    });
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const getMedia = async (subaccountId: string) => {
  try {
    const mediaFiles = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
      include: { Media: true },
    });
    return mediaFiles;
  } catch (error) {
    console.log(error);
  }
};
export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType,
) => {
  try {
    const response = await db.media.create({
      data: {
        link: mediaFile.link,
        name: mediaFile.name,
        subAccountId: subaccountId,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteMedia = async (mediaId: string) => {
  try {
    const response = await db.media.delete({
      where: {
        id: mediaId,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  });
  return response;
};

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: "asc" },
    include: {
      Tickets: {
        orderBy: {
          order: "asc",
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  });
  return response;
};

export const upsertFunnel = async (
  subaccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string,
) => {
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput,
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  });

  return response;
};

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  });
  return response;
};
export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      }),
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "ERROR UPDATE LANES ORDER");
  }
};

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      }),
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "🔴 ERROR UPDATE TICKET ORDER");
  }
};

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  });

  return response;
};
export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({ where: { id: laneId } });
  return response;
};
export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  });
  return response;
};
export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  });
  return response;
};

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: "SUBACCOUNT_USER",
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  });
  return subaccountUsersWithAccess;
};

export const searchContacts = async (searchTerms: string | undefined) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  });
  return response;
};

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[],
) => {
  let order: number;
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    });
    order = tickets.length;
  } else {
    order = ticket.order;
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  });

  return response;
};

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  return response;
};
export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput,
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  });

  return response;
};

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  });
  return response;
};

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } });
  return response;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput,
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  });
  return response;
};

export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  });

  return funnels;
};

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return funnel;
};

export const updateFunnelProducts = async (
  products: string,
  funnelId: string,
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  });
  return data;
};

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string,
) => {
  if (!subaccountId || !funnelId) return;
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || "" },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
            {
              content: [],
              id: "__body",
              name: "Body",
              styles: { backgroundColor: "white" },
              type: "__body",
            },
          ]),
      funnelId,
    },
  });

  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, "page");
  return response;
};

export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } });

  return response;
};

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  });

  return response;
};

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  });
  return response;
};

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  });
  return response;
};
