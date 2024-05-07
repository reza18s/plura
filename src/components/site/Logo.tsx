import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex flex-row">
      <Image
        alt="plur logo"
        height={40}
        src={"/assets/plura-logo.svg"}
        width={40}
      ></Image>
      <h1 className="ml-2 text-center text-2xl font-bold ">Plura</h1>
    </div>
  );
}
