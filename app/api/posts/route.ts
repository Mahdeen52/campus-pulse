import { db } from "@/src/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { postSchema } from "@/lib/postSchema";


export async function GET(request: Request) {
  const url = new URL(request.url);
  const authorId = url.searchParams.get("authorId");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const numericAuthorId = authorId
    ? Number(authorId)
    : null;

  if (
    numericAuthorId !== null &&
    (!Number.isInteger(numericAuthorId) || numericAuthorId <= 0)
  ) {
    return Response.json(
      { error: "Invalid authorId" },
      { status: 400 }
    );
  }

  const posts = numericAuthorId
  ? await db.orm.public.Post
      .include("author")
      .where({
        authorId: numericAuthorId,
      })
      .all()
  : await db.orm.public.Post
      .include("author")
      .all();

  const safePosts = posts.map((post) => ({
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
  }));

  return Response.json(safePosts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = postSchema.safeParse(body);
   if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
   if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const post = result.data;

  const createdPost = await db.orm.public.Post.create({
    content: post.content,
    imageUrl: post.imageUrl || null,
    isAnonymous: post.isAnonymous,
    authorId: Number(session.user.id),
  });

  return Response.json(
    createdPost,
    { status: 201 }
  );
}
