"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { postSchema } from "@/lib/postSchema";
import { db } from "@/src/prisma/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData : FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

   if (!session) {
  redirect("/login");
}
    const result = postSchema.safeParse({
        content : formData.get("content"),
        imageUrl : formData.get("imageUrl"),
        isAnonymous : formData.get("isAnonymous") ==="on"  })
    if (!result.success) {
        console.log(result.error);
        return;
    }
    const post = result.data;
    const createdPost = await db.orm.public.Post.create({
    content: post.content,
    imageUrl: post.imageUrl || null,
    isAnonymous: post.isAnonymous,
    authorId: Number(session.user.id),
  });

  console.log(createdPost)
    revalidatePath("/");
    redirect("/");
    
}

export async function deletePost(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const postId = Number(formData.get("postId"));

  const post = await db.orm.public.Post.first({
    id: postId,
  });

  if (!post) {
    return;
  }

  if (Number(session.user.id) !== post.authorId) {
    return;
  }

  await db.orm.public.Post.where({ id: postId }).delete();

  revalidatePath("/");
  redirect("/");
}

export async function updatePost(formData: FormData) {
    const session = await auth.api.getSession({
        headers : await headers()
    })
     if (!session) {
    redirect("/login");
  }

    const result = postSchema.safeParse({
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl"),
    isAnonymous: formData.get("isAnonymous") === "on",
  });

  if(!result.success) {
    return console.log(result.error)
  }
  const postId = Number(formData.get("postId"));
  const existingPost = await db.orm.public.Post.first({
    id : postId
  })

  if (!existingPost) {
    return;
  }

  if (Number(session.user.id) !== existingPost.authorId) {
    return;
  }

  const post = result.data;
  await db.orm.public.Post
    .where({ id: postId })
    .update({
      content: post.content,
      imageUrl: post.imageUrl || null,
      isAnonymous: post.isAnonymous,
    });

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);

  redirect(`/posts/${postId}`);
}
