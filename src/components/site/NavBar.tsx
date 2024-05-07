import { User } from "@clerk/nextjs/server";
import Logo from "./Logo";

interface props {
  user: null | User;
}
export default function NavBar({ user }: props) {
  return (
    <div className="relative h-20 w-full flex-row items-center justify-between p-4 ">
      <Logo></Logo>
    </div>
  );
}
