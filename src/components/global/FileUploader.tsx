import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing";

type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subaccountLogo";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const type = value?.split(".").pop();

  if (value) {
    return (
      <div className="flex flex-col items-center justify-center">
        {type !== "pdf" ? (
          <div className="relative h-40 w-40">
            <Image
              alt="uploaded image"
              className="object-contain"
              fill
              src={value}
            />
          </div>
        ) : (
          <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
            <FileIcon />
            <a
              className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
              href={value}
              // target="_blank"
              rel="noopener_noreferrer"
            >
              View PDF
            </a>
          </div>
        )}
        <Button onClick={() => onChange("")} type="button" variant="ghost">
          <X className="size-4" />
          Remove Logo
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
    </div>
  );
};

export default FileUpload;
