import z from "zod";


export const FileFormSchema = z.object({
  file: z.object({
    fileName: z.string(),
    fileKey: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
  }),
});
