import Link from "next/link";
import type { ReactNode } from "react";

type SiteHeaderProps = {
  actions?: ReactNode;
  compact?: boolean;
};

export default function SiteHeader({ actions, compact = false }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="CampusPulse home">
          <span className="brand__mark" aria-hidden="true">
            C
          </span>
          <span className="brand__name">CampusPulse</span>
        </Link>

        {!compact ? (
          <nav className="primary-nav" aria-label="Primary navigation">
            <Link href="/" className="primary-nav__item primary-nav__item--active">
              <span aria-hidden="true">⌂</span>
              <span>Home</span>
            </Link>
            <Link href="/posts/new" className="primary-nav__item">
              <span aria-hidden="true">＋</span>
              <span>Create</span>
            </Link>
          </nav>
        ) : null}

        <div className="site-header__actions">{actions}</div>
      </div>
    </header>
  );
}
