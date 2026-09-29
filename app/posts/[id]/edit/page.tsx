import { auth } from "@/lib/auth";
import { db } from "@/src/prisma/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { updatePost } from "@/app/actions/posts";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const post = await db.orm.public.Post.first({
    id: postId,
  });

  if (!post) {
    notFound();
  }

  if (Number(session.user.id) !== post.authorId) {
    redirect(`/posts/${post.id}`);
  }

  return (
    <div className="content-page">
      <SiteHeader compact />
      <main className="content-page__main">
        <Link href={`/posts/${post.id}`} className="back-link">
          <span aria-hidden="true">←</span> Back to post
        </Link>

        <div className="page-heading">
          <div className="page-heading__icon" aria-hidden="true">✎</div>
          <div>
            <h1>Edit post</h1>
            <p>Update what you shared with the campus community.</p>
          </div>
        </div>

        <section className="editor-card">
          <form action={updatePost} className="editor-form">
            <input type="hidden" name="postId" value={post.id} />

            <div className="field">
              <label htmlFor="content">Post content</label>
              <textarea id="content" name="content" defaultValue={post.content} />
            </div>

            <div className="field">
              <label htmlFor="imageUrl">Image URL</label>
              <input
                id="imageUrl"
                type="text"
                name="imageUrl"
                defaultValue={post.imageUrl ?? ""}
                placeholder="Paste an image URL (optional)"
              />
              <p className="field__hint">Leave this blank if the post does not need an image.</p>
            </div>

            <label className="anonymous-option">
              <input
                type="checkbox"
                name="isAnonymous"
                defaultChecked={post.isAnonymous}
              />
              <span>
                <strong>Post anonymously</strong>
                <span>Your name will be hidden from other students on this post.</span>
              </span>
            </label>

            <div className="form-actions">
              <Link href={`/posts/${post.id}`} className="button button--ghost">Cancel</Link>
              <button type="submit" className="button button--primary">Save changes</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
