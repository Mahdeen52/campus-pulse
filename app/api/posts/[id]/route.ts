import { db } from "@/src/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { postSchema } from "@/lib/postSchema";
import { patchPostSchema } from "@/lib/postSchema";
type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request : Request, { params }: RouteProps) {
  const session = await auth.api.getSession({
    headers : await headers(),
  })
  if(!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
  return Response.json(
    { error: "Invalid post ID" },
    { status: 400 }
  );
}

  const post = await db.orm.public.Post.include("author").first({
    id: postId,
  });

  if (!post) {
    return Response.json(
        {error: "Post not found"},
        {status: 404}
    )
  }
    const safePost = {
  id: post.id,
  content: post.content,
  imageUrl: post.imageUrl,
  isAnonymous: post.isAnonymous,
  createdAt: post.createdAt,

  author: post.isAnonymous
    ? null
    : {
        id: post.author.id,
        name: post.author.name,
        university: post.author.university,
      },
};

return Response.json(safePost);
}




export async function PATCH(request: Request,{ params }: RouteProps) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const postId = Number(id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return Response.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const existingPost =
      await db.orm.public.Post.first({
        id: postId,
      });

    if (!existingPost) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (
      Number(session.user.id) !==
      existingPost.authorId
    ) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const result =
      patchPostSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const updatedPost =
      await db.orm.public.Post
        .where({ id: postId })
        .update(result.data);

    return Response.json(updatedPost);
  } 
  catch (error) {
    console.error("PATCH /api/posts/[id] failed:",error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request, { params }: RouteProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const postId = Number(id);

    const existingPost = await db.orm.public.Post.first({
        id: postId,
    });

    if (!existingPost) {
        return Response.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    if (Number(session.user.id) !== existingPost.authorId) {
        return Response.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    const deletedPost = await db.orm.public.Post.where({ id: postId }).delete();

    return Response.json(deletedPost);
}