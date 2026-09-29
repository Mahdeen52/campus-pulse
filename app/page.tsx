import { db } from "@/src/prisma/db";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogoutButton from "@/components/LogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
}
  const posts = await db.orm.public.Post.include("author").all();
  const firstName = session?.user.name?.split(" ")[0] ?? "Student";
  const userInitial = session?.user.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <div className="app-shell">
      <SiteHeader
        actions={
          session ? (
            <div className="header-account">
              <span className="avatar avatar--small" aria-hidden="true">
                {userInitial}
              </span>
              <span className="header-account__name">{firstName}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="auth-actions">
              <Link href="/login" className="button button--ghost button--small">
                Log in
              </Link>
              <Link href="/signup" className="button button--primary button--small">
                Sign up
              </Link>
            </div>
          )
        }
      />

      <main className="feed-layout">
        <aside className="left-rail" aria-label="Profile and navigation">
          <div className="profile-panel">
            <div className="profile-panel__cover" />
            <div className="profile-panel__body">
              <span className="avatar avatar--large" aria-hidden="true">
                {userInitial}
              </span>
              <h2>{session ? session.user.name : "Campus community"}</h2>
              <p>
                {session
                  ? "Stay connected with everything happening around you."
                  : "Join the conversation happening across campus."}
              </p>
            </div>
          </div>

          <nav className="side-nav" aria-label="Feed shortcuts">
            <Link href="/" className="side-nav__item side-nav__item--active">
              <span className="side-nav__icon" aria-hidden="true">⌂</span>
              Campus feed
            </Link>
            <Link href="/posts/new" className="side-nav__item">
              <span className="side-nav__icon" aria-hidden="true">＋</span>
              Create a post
            </Link>
          </nav>
        </aside>

        <section className="feed-column" aria-labelledby="feed-heading">
          <div className="feed-intro">
            <div>
              <p className="eyebrow">Your community</p>
              <h1 id="feed-heading">Campus feed</h1>
            </div>
            <span className="live-pill"><span /> Live</span>
          </div>

          <div className="composer-card">
            <span className="avatar" aria-hidden="true">{userInitial}</span>
            <Link href="/posts/new" className="composer-card__prompt">
              What&apos;s happening on campus, {firstName}?
            </Link>
            <Link href="/posts/new" className="composer-card__action" aria-label="Create a post">
              ＋
            </Link>
          </div>

          <div className="post-list">
            {posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon" aria-hidden="true">✦</div>
                <h2>Start the conversation</h2>
                <p>Be the first to share an update with your campus community.</p>
                <Link href="/posts/new" className="button button--primary">
                  Create the first post
                </Link>
              </div>
            ) : (
              posts.map((post) => {
                const authorName = post.isAnonymous ? "Anonymous student" : post.author.name;
                const authorInitial = post.isAnonymous
                  ? "?"
                  : post.author.name.charAt(0).toUpperCase();

                return (
                  <article key={post.id} className="post-card">
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

                    <div className="post-card__meta">
                      <span><span className="reaction-dot" aria-hidden="true">♥</span> Campus community</span>
                      <Link href={`/posts/${post.id}`}>View conversation</Link>
                    </div>

                    <div className="post-card__actions">
                      <Link href={`/posts/${post.id}`} className="post-action">
                        <span aria-hidden="true">♡</span> Appreciate
                      </Link>
                      <Link href={`/posts/${post.id}`} className="post-action">
                        <span aria-hidden="true">◯</span> Comment
                      </Link>
                      <Link href={`/posts/${post.id}`} className="post-action">
                        <span aria-hidden="true">↗</span> Open
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="right-rail" aria-label="Campus information">
          <section className="info-card">
            <div className="info-card__heading">
              <span className="info-card__icon" aria-hidden="true">✦</span>
              <div>
                <p className="eyebrow">CampusPulse</p>
                <h2>Community space</h2>
              </div>
            </div>
            <p>Share updates, ask questions, and stay close to campus life.</p>
            <ul className="community-list">
              <li><span>1</span> Be respectful and constructive</li>
              <li><span>2</span> Keep posts relevant to campus</li>
              <li><span>3</span> Protect everyone&apos;s privacy</li>
            </ul>
          </section>
          <p className="rail-footer">CampusPulse · Built for students</p>
        </aside>
      </main>
    </div>
  );
}
