import { getAuthUserDetails } from "@/lib/queries";
import MenuOption from "./MenuOption";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};
export default async function SideBar({ id, type }: Props) {
  const user = await getAuthUserDetails();

  if (!user) return null;
  if (!user.Agency) return;
  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.SubAccount.find((sub) => sub.id === id);
  if (!details) return;
  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo";
  if (!isWhiteLabeledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }
  const sidebarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];
  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access,
    ),
  );

  return (
    <>
      <MenuOption
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOption
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  );
}
