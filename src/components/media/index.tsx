import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { FolderSearch } from "lucide-react";
import MediaCard from "./MediaCard";
import MediaUploadButton from "./UploadButton";
import { GetMediaFiles } from "@/lib/types";

type Props = {
  data: GetMediaFiles;
  subAccountId: string;
};

const MediaComponent = ({ data, subAccountId }: Props) => {
  return (
    <div className="flex size-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subAccountId} />
      </div>
      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name..." />
        <CommandList className="max-h-full pb-40 ">
          <CommandEmpty>No Media Files</CommandEmpty>
          <CommandGroup heading="Media Files">
            <div className="flex flex-wrap gap-4 pt-4">
              {data?.Media.map((file) => (
                <CommandItem
                  key={file.id}
                  className="w-full max-w-[300px] rounded-lg !bg-transparent p-0 !font-medium !text-white"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}
              {!data?.Media.length && (
                <div className="flex w-full flex-col items-center justify-center">
                  <FolderSearch
                    size={200}
                    className="text-slate-300 dark:text-muted"
                  />
                  <p className="text-muted-foreground ">
                    Empty! no files to show.
                  </p>
                </div>
              )}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default MediaComponent;
