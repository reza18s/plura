import NavBar from "@/components/site/NavBar";
import React from "react";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <NavBar user={null}></NavBar>
      {children}
    </div>
  );
}
