import { notFound } from "next/navigation";
import { db } from "@/src/prisma/db";
import Link from "next/link"
import { createComment } from "@/app/actions/comments";
import SiteHeader from "@/components/SiteHeader";

type PostPageProps = {
    params : Promise<{id : string}>
}

export default async function PostPage({params} : PostPageProps) {
    const { id } = await params;
    const postId = Number(id);
    if (Number.isNaN(postId)) notFound();
    const post = await db.orm.public.Post.include("author").include("comments", (comments) => comments.include("author")).first({id : postId})
    if (!post) notFound();

    const authorName = post.isAnonymous ? "Anonymous student" : post.author.name;
    const authorInitial = post.isAnonymous ? "?" : post.author.name.charAt(0).toUpperCase();

    return (
      <div className="content-page">
        <SiteHeader compact />
        <main className="content-page__main content-page__main--detail">
          <Link href="/" className="back-link">
            <span aria-hidden="true">←</span> Back to campus feed
          </Link>

          <article className="detail-card">
            <header className="post-card__header">
              <span className={`avatar ${post.isAnonymous ? "avatar--anonymous" : ""}`} aria-hidden="true">
                {authorInitial}
              </span>
              <div>
                <h2>{authorName}</h2>
                <p>
                  {post.isAnonymous ? "Campus community" : post.author.university}
                  <span aria-hidden="true"> · </span>
                  Public
                </p>
              </div>
              <span className="post-card__menu" aria-hidden="true">•••</span>
            </header>

            <p className="post-card__content">{post.content}</p>

            {post.imageUrl ? (
              // The stored URL can point to any host, so a native image keeps existing URL support intact.
              // eslint-disable-next-line @next/next/no-img-element
              <img className="post-card__image" src={post.imageUrl} alt="Attached to this post" />
            ) : null}

            <div className="post-card__actions">
              <span className="post-action"><span aria-hidden="true">♡</span> Appreciate</span>
              <a href="#comments" className="post-action"><span aria-hidden="true">◯</span> Comment</a>
              <Link href="/" className="post-action"><span aria-hidden="true">⌂</span> Feed</Link>
            </div>
          </article>

          <section className="comments-card" id="comments">
            <div className="comments-card__header">
              <h2>Conversation</h2>
              <span className="comments-card__count">
                {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            <div className="comment-list">
              {post.comments.length === 0 ? (
                <div className="comment-empty">No comments yet. Start the conversation.</div>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <span className="avatar avatar--small" aria-hidden="true">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="comment__bubble">
                      <strong>{comment.author.name}</strong>
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form action={createComment} className="comment-form">
              <input type="hidden" name="postId" value={post.id} />
              <textarea name="content" placeholder="Write a thoughtful comment..." aria-label="Comment" />
              <button type="submit" className="button button--primary">Comment</button>
            </form>
          </section>
        </main>
      </div>
    );
}
