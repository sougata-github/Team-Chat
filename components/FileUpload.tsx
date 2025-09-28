"use client";

import { UploadDropzone } from "@/lib/uploadthing";

import { FileIcon, X } from "lucide-react";

import Image from "next/image";

type FileType = {
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileType: string;
};

interface FileUploadProps {
  onChange: (file: FileType) => void;
  value: FileType;
  endpoint: "messageFile" | "serverImage";
}

const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  if (value && value.fileUrl !== "" && value.fileType !== "application/pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image
          fill
          src={value.fileUrl}
          alt={`Uploaded image: ${value.fileName}`}
          className="rounded-full"
          unoptimized
        />
        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
          onClick={() =>
            onChange({
              fileKey: "",
              fileName: "",
              fileType: "",
              fileUrl: "",
            })
          }
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && value.fileUrl !== "" && value.fileType === "application/pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value.fileName}
        </a>
        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
          onClick={() =>
            onChange({
              fileKey: "",
              fileName: "",
              fileType: "",
              fileUrl: "",
            })
          }
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      className="border-muted-foreground/20 p-5 ut-button:bg-indigo-500 ut-button:px-4 ut-button:text-white ut-button:text-sm ut-button:font-medium w-[280px] ut-button:w-[115px] ut-uploading:ut-button:hover:bg-black ut-uploading:ut-button:hover:text-black"
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange({
          fileKey: res?.[0].key,
          fileName: res?.[0].name,
          fileType: res?.[0].type,
          fileUrl: res?.[0].ufsUrl,
        });
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};

export default FileUpload;
