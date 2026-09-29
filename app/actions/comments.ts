"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/src/prisma/db";
import { commentSchema } from "@/lib/commentSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createComment(formData : FormData) {
    const session = await auth.api.getSession({
        headers : await headers()
    })
    if (!session) {
        redirect("/signup");
    }
    const result = commentSchema.safeParse({
        content : formData.get("content"),
        postId : formData.get("postId")
    });
    if (!result.success) {
        console.log(result.error);
        return;
}
    const comment = result.data
    const createdComment = await db.orm.public.Comment.create({
        content : comment.content,
        postId : comment.postId,
        authorId : Number(session.user.id)
})
    console.log(createdComment)
    revalidatePath(`/posts/${comment.postId}`);
    redirect(`/posts/${comment.postId}`);
}
