import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import clsx from "clsx";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative flex size-full flex-col items-center justify-center pt-36">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <p className="text-center font-semibold">
          Run your agency, in one place
        </p>
        <div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent ">
          <h1 className="text-9xl font-bold md:text-10xl">Plura</h1>
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
      </section>
      <section className="mt-16 flex flex-col items-center justify-start gap-4 md:mt-20">
        <h2 className="text-center text-4xl"> Choose what fits you right</h2>
        <p className="text-center text-muted-foreground">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not <br />
          ready to commit you can get started for free.
        </p>
        <div className="mt-6  flex flex-wrap justify-center gap-4">
          {pricingCards.map((card) => (
            <Card
              className={clsx("flex w-[300px] flex-col justify-between", {
                "border-2 border-primary": card.title === "Unlimited Saas",
              })}
              key={card.title}
            >
              <CardHeader>
                <CardTitle
                  className={clsx("", {
                    "text-muted-foreground": card.title !== "Unlimited Saas",
                  })}
                >
                  {card.title}
                </CardTitle>
                <CardDescription>
                  {
                    pricingCards.find((c) => c.title === card.title)
                      ?.description
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">{card.price}</span>
                <span className="text-muted-foreground">
                  <span>/m</span>
                </span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div>
                  {card.features.map((feature) => (
                    <div className="flex gap-2" key={feature}>
                      <Check />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <Link
                  className={clsx(
                    "w-full rounded-md bg-primary p-2 text-center",
                    {
                      "!bg-muted-foreground": card.title !== "Unlimited Saas",
                    },
                  )}
                  href={`/agency?plan=${card.priceId}`}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
