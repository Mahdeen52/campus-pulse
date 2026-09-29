import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createPost } from "@/app/actions/posts";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default async function NewPostPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="content-page">
      <SiteHeader compact />
      <main className="content-page__main">
        <Link href="/" className="back-link">
          <span aria-hidden="true">←</span> Back to campus feed
        </Link>

        <div className="page-heading">
          <div className="page-heading__icon" aria-hidden="true">＋</div>
          <div>
            <h1>Create a post</h1>
            <p>Share an update, idea, or question with your campus.</p>
          </div>
        </div>

        <section className="editor-card">
          <form action={createPost} className="editor-form">
            <div className="field">
              <label htmlFor="content">What&apos;s on your mind?</label>
              <textarea
                id="content"
                name="content"
                placeholder="What's happening on campus?"
              />
            </div>

            <div className="field">
              <label htmlFor="imageUrl">Add an image</label>
              <input
                id="imageUrl"
                type="text"
                name="imageUrl"
                placeholder="Paste an image URL (optional)"
              />
              <p className="field__hint">Optional — paste a direct link to an image.</p>
            </div>

            <label className="anonymous-option">
              <input type="checkbox" name="isAnonymous" />
              <span>
                <strong>Post anonymously</strong>
                <span>Your name will be hidden from other students on this post.</span>
              </span>
            </label>

            <div className="form-actions">
              <Link href="/" className="button button--ghost">Cancel</Link>
              <button type="submit" className="button button--primary">Publish post</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
