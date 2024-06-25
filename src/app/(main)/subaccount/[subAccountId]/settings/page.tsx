import UserDetails from "@/components/forms/UserDetails";
import SubAccountDetails from "@/components/forms/subAccountDetails";
import BlurPage from "@/components/global/BlurPage";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

type Props = {
  params: { subAccountId: string };
};

const SubaccountSettingPage = async ({ params }: Props) => {
  const authUser = await currentUser();
  if (!authUser) return;
  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  });
  if (!userDetails) return;

  const subAccount = await db.subAccount.findUnique({
    where: { id: params.subAccountId },
  });
  if (!subAccount) return;

  const agencyDetails = await db.agency.findUnique({
    where: { id: subAccount.agencyId },
    include: { SubAccount: true },
  });

  if (!agencyDetails) return;
  const subAccounts = agencyDetails.SubAccount;

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 lg:!flex-row">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccount}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subAccountId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  );
};

export default SubaccountSettingPage;
