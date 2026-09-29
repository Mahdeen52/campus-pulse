import { z } from "zod";

export const postSchema = z.object({
  content: z
    .string()
    .min(1, { error: "Post cannot be empty" })
    .max(500, { error: "Post cannot exceed 500 characters" }),

  imageUrl: z
    .httpUrl({ error: "Please enter a valid image URL" })
    .or(z.literal("")),

  isAnonymous: z.boolean(),
});