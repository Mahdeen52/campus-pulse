import { db } from "@/src/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { postSchema } from "@/lib/postSchema";
import { z } from "zod";
import { postCreateLimiter } from "@/lib/ratelimit";


export async function GET(request: Request) {
  try{
  const url = new URL(request.url);
  const authorId = url.searchParams.get("authorId");
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");
  const sortParam = url.searchParams.get("sort");
  const sort = sortParam ?? "newest";
  const anonymousParam = url.searchParams.get("anonymous");


  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const numericAuthorId = authorId ? Number(authorId) : null;

  if (
    numericAuthorId !== null &&
    (!Number.isInteger(numericAuthorId) || numericAuthorId <= 0)
  ) {
    return Response.json(
      { error: "Invalid authorId" },
      { status: 400 }
    );
  }

  const page = pageParam ? Number(pageParam) : 1;
  const limit = limitParam ? Number(limitParam) : 10;

if (
  !Number.isInteger(page) ||
  page <= 0 ||
  !Number.isInteger(limit) ||
  limit <= 0 ||
  limit > 50
) {
  return Response.json(
    { error: "Invalid pagination parameters" },
    { status: 400 }
  );
}

if (sort !== "newest" && sort !== "oldest") {
  return Response.json(
    { error: "Invalid sort option" },
    { status: 400 }
  );
}

let anonymous: boolean | null = null;

if (anonymousParam === "true") {
  anonymous = true;
} else if (anonymousParam === "false") {
  anonymous = false;
} else if (anonymousParam !== null) {
  return Response.json(
    { error: "Invalid anonymous filter" },
    { status: 400 }
  );
}

const offset = (page - 1) * limit;

let query = db.orm.public.Post.include("author");

if (numericAuthorId !== null) {
  query = query.where({
    authorId: numericAuthorId,
  });
}

if (anonymous !== null) {
  query = query.where({
    isAnonymous: anonymous,
  });
}

const posts = await query
  .orderBy((post) =>
    sort === "oldest"
      ? post.createdAt.asc()
      : post.createdAt.desc()
  )
  .offset(offset)
  .limit(limit)
  .all();

  let countQuery = db.orm.public.Post;

if (numericAuthorId !== null) {
  countQuery = countQuery.where({
    authorId: numericAuthorId,
  });
}

if (anonymous !== null) {
  countQuery = countQuery.where({
    isAnonymous: anonymous,
  });
}

const { total } = await countQuery.aggregate((a) => ({
  total: a.count(),
}));

const totalPages = Math.ceil(total / limit);



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

  return Response.json({
  page,
  limit,
  total,
  totalPages,
  sort,
  posts: safePosts,
});
}

catch (error) {
    console.error("GET /api/posts failed:", error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {
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

const identifier = `post-create:user:${session.user.id}`;

const rateLimitResult = await postCreateLimiter.limit(identifier);

if (!rateLimitResult.success) {
  return Response.json(
    {
      error: "Too many requests",
    },
    {
      status: 429,
    }
  );
}

    let body;

    try {
      body = await request.json();
    } 
    catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const result = postSchema.safeParse(body);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return Response.json(
        {
          error: "Validation failed",
          fields: errors.fieldErrors,
        },
        { status: 400 }
      );
    }

    const post = result.data;

    const createdPost =
      await db.orm.public.Post.create({
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
  catch (error) {
    console.error("POST /api/posts failed:",error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}