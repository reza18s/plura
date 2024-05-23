"use client";
import React from "react";
import { Button } from "../ui/button";
import CustomModal from "../global/CustomModal";
import { useModal } from "@/Providers/ModalProvider";
import UploadMediaForm from "../forms/MediaForm";

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { setOpen, setClose } = useModal();

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subheading="Upload a file to your media bucket"
          >
            <UploadMediaForm
              setClose={setClose}
              subaccountId={subaccountId}
            ></UploadMediaForm>
          </CustomModal>,
        );
      }}
    >
      Upload
    </Button>
  );
};

export default MediaUploadButton;
