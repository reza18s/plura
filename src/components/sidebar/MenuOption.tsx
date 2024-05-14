"use client";
import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "../ui/command";
import { CommandItem } from "cmdk";
import Link from "next/link";
import useStore from "@/storage/useStorage";
import CustomModal from "../global/CustomModal";
import SubAccountDetails from "../forms/subAccountDetails";
import { currentUser } from "@clerk/nextjs/server";

type Props = {
  defaultOpen?: boolean;
  details: any;
  id: string;
  sidebarLogo: string;
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  subAccounts: SubAccount[];
  user: any;
};
export default function MenuOption({
  defaultOpen,
  details,
  id,
  sidebarLogo,
  sidebarOpt,
  subAccounts,
  user,
}: Props) {
  const [isMounted, setIsMounted] = useState<boolean>();
  const { isOpen, setOpen } = useStore();
  const openState = useMemo(
    () => (!defaultOpen ? { open: true } : {}),
    [defaultOpen],
  );
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Sheet>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100]  md:!hidden "
      >
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={clsx(
          "fixed top-0 border-r bg-background/80 p-6 backdrop-blur-xl",
          {
            "z-0 hidden w-[300px] md:inline-block": defaultOpen,
            "z-[100] inline-block w-full md:hidden": !defaultOpen,
          },
        )}
      >
        <div className="">
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="my-4 flex w-full items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center gap-2 text-left">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[200] mt-4 size-96  sm:size-80">
              <Command className="w-full rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-16">
                  <CommandEmpty> No results found</CommandEmpty>
                  {(user?.role === "AGENCY_OWNER" ||
                    user?.role === "AGENCY_ADMIN") &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="my-2 cursor-pointer rounded-md border border-border !bg-transparent p-2 text-primary transition-all hover:!bg-muted">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex size-full gap-4"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-1 flex-col">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex size-full gap-4"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-1 flex-col">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Accounts">
                    {
                      // eslint-disable-next-line no-extra-boolean-cast
                      !!subAccounts
                        ? subAccounts.map((subaccount) => (
                            <CommandItem key={subaccount.id}>
                              {defaultOpen ? (
                                <Link
                                  href={`/subaccount/${subaccount.id}`}
                                  className="flex h-full w-full gap-4"
                                >
                                  <div className="relative w-16">
                                    <Image
                                      src={subaccount.subAccountLogo}
                                      alt="subaccount Logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-1 flex-col">
                                    {subaccount.name}
                                    <span className="text-muted-foreground">
                                      {subaccount.address}
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <SheetClose asChild>
                                  <Link
                                    href={`/subaccount/${subaccount.id}`}
                                    className="flex h-full w-full gap-4"
                                  >
                                    <div className="relative w-16">
                                      <Image
                                        src={subaccount.subAccountLogo}
                                        alt="subaccount Logo"
                                        fill
                                        className="rounded-md object-contain"
                                      />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                      {subaccount.name}
                                      <span className="text-muted-foreground">
                                        {subaccount.address}
                                      </span>
                                    </div>
                                  </Link>
                                </SheetClose>
                              )}
                            </CommandItem>
                          ))
                        : "No Accounts"
                    }
                  </CommandGroup>
                </CommandList>
                {(user?.role === "AGENCY_OWNER" ||
                  user?.role === "AGENCY_ADMIN") && (
                  <SheetClose>
                    <Button
                      className="flex w-full gap-2"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create A Subaccount"
                            subheading="You can switch between your agency account and the subaccount from the sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>,
                        );
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </SheetContent>
    </Sheet>
  );
}
