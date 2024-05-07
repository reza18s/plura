import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex size-full flex-col items-center justify-center pt-36">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <p className="text-center font-semibold">Run your agency, in one place</p>
      <div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent ">
        <h1 className="md:text-10xl text-9xl font-bold">Plura</h1>
      </div>
      <div className="relative flex items-center justify-center ">
        <Image
          alt="banner image"
          className="rounded-t-2xl border-2 border-muted"
          height={1200}
          src={"/assets/preview.png"}
          width={1200}
        ></Image>
        <div className="absolute left-0 z-10 bg-gradient-to-t ring-0 dark:from-background"></div>
      </div>
    </div>
  );
}
