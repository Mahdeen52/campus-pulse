import { z } from "zod";

export const commentSchema = z.object({
    content : z.string().min(1, "Comment cannot be empty").max(300, "Comment is too long"),
    postId : z.coerce.number().int().positive()
});