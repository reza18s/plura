import NavBar from "@/components/site/NavBar";
import React from "react";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar></NavBar>
      {children}
    </div>
  );
}
