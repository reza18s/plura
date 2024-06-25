import React from "react";

type Props = {
  children: React.ReactNode;
};

const BlurPage = ({ children }: Props) => {
  return (
    <div
      className="absolute inset-0  z-[11] mx-auto  h-screen overflow-scroll bg-muted/60 p-4 pb-8 pt-24 backdrop-blur-[5px] dark:bg-muted/40 dark:shadow-2xl dark:shadow-black"
      id="blur-page"
    >
      {children}
    </div>
  );
};

export default BlurPage;
