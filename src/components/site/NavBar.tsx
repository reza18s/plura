import { currentUser } from "@clerk/nextjs/server";
import Logo from "./Logo";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../global/mode-toggle";

const pages = [
  { title: "Pricing", link: "#" },
  { title: "About", link: "#" },
  { title: "Documentation", link: "#" },
  { title: "Features", link: "#" },
];
export default async function NavBar() {
  const user = await currentUser();

  return (
    <div className="relative flex h-20 w-full flex-row items-center justify-between p-4">
      <Logo></Logo>
      <nav className="hidden items-center md:flex">
        <ul className="flex flex-row items-center justify-center gap-5">
          {pages.map((el) => (
            <Link
              className="text-xl hover:scale-105 hover:text-primary"
              href={el.link}
              key={el.title}
            >
              {el.title}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        {!user && (
          <>
            <Link
              className="rounded-md border-2 border-primary p-1.5 px-3 font-semibold text-primary hover:border-primary/80 hover:bg-primary/80 hover:text-secondary"
              href={"./agency/sign-up"}
            >
              Sign up
            </Link>
            <Link
              className="rounded-md bg-primary p-2 px-4 font-semibold text-white hover:bg-primary/80"
              href={"./agency/sign-in"}
            >
              Login
            </Link>
          </>
        )}
        <UserButton></UserButton>
        <ModeToggle></ModeToggle>
      </div>
    </div>
  );
}
