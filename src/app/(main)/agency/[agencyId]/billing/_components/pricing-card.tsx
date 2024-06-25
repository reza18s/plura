"use client";
import { useModal } from "@/Providers/ModalProvider";
import SubscriptionFormWrapper from "@/components/forms/subscription-form/subscription-form-wrapper";
import CustomModal from "@/components/global/CustomModal";
import { PricesList } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  prices: PricesList;
  customerId: string;
  planExists: boolean;
};

const SubscriptionHelper = ({ customerId, planExists, prices }: Props) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (plan) {
      setOpen(
        <CustomModal
          title="Upgrade Plan!"
          subheading="Get started today to get access to premium features"
        >
          <SubscriptionFormWrapper
            planExists={planExists}
            customerId={customerId}
          />
        </CustomModal>,
        async () => ({
          plans: {
            // eslint-disable-next-line no-extra-boolean-cast
            defaultPriceId: !!plan ? plan : "",
            plans: prices,
          },
        }),
      );
    }
  }, [plan]);

  return <div>SubscriptionHelper</div>;
};

export default SubscriptionHelper;
