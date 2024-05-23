import BlurPage from "@/components/global/BlurPage";
import InfoBar from "@/components/global/InfoBar";
import NoConnection from "@/components/global/NoConnection";
import SideBar from "@/components/sidebar/SideBar";
import Unauthorized from "@/components/unauthorized";
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { agencyId: string };
}) {
  try {
    const agencyId = await verifyAndAcceptInvitation();

    const user = await currentUser();
    if (!agencyId) return redirect("/agency");
    if (
      user?.privateMetadata.role !== "AGENCY_OWNER" &&
      user?.privateMetadata.role !== "AGENCY_ADMIN"
    ) {
      return <Unauthorized />;
    }

    let allNoti: any = [];
    const notifications = await getNotificationAndUser(agencyId);
    if (notifications) allNoti = notifications;
    return (
      <div className="h-screen w-screen">
        <SideBar id={params.agencyId} type="agency" />
        <div className="md:pl-[300px]">
          <InfoBar notifications={allNoti} role={allNoti.User?.role} />
          <div className="relative">
            <BlurPage>{children}</BlurPage>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.log(error);
    return <NoConnection></NoConnection>;
  }
}
