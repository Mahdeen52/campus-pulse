import { db } from "@/src/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { postSchema } from "@/lib/postSchema";

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




export async function PATCH(request: Request, { params }: RouteProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
    if (!session) {
    return Response.json(
        { error: "Unauthorized" },  
        { status: 401 }
    );
  }
  const body = await request.json(); 
  const result = postSchema.safeParse(body);
   if (!result.success) {
  return Response.json(
    { error: result.error },
    { status: 400 }
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
    const post = result.data;

    const updatedPost = await db.orm.public.Post.where({ id: postId }).update({
    content: post.content,
    imageUrl: post.imageUrl || null,
    isAnonymous: post.isAnonymous,
  });

  return Response.json(updatedPost);
 
  
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