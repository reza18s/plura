"use client";
import { useModal } from "@/Providers/ModalProvider";
import SubAccountDetails from "@/components/forms/subAccountDetails";
import CustomModal from "@/components/global/CustomModal";
import { Button } from "@/components/ui/button";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[];
              SideBarOption: AgencySidebarOption[];
            })
        )
      | null;
  };
  id: string;
  className: string;
};

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  return (
    <Button
      className={twMerge("flex w-full gap-4", className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch between"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>,
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubaccountButton;
