"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    console.log("Login successful:", data);

    router.push("/");
  }

  return (
    <div className="auth-page">
      <SiteHeader
        compact
      />
      <main className="auth-page__main">
        <section className="auth-card" aria-labelledby="login-heading">
          <div className="auth-card__badge" aria-hidden="true">↗</div>
          <h1 id="login-heading">Welcome back</h1>
          <p className="auth-card__intro">
            Sign in to catch up with your campus community.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="button button--primary button--full">
              Log in to CampusPulse
            </button>
          </form>

          <p className="auth-card__footer">
            New to CampusPulse? <Link href="/signup">Create an account</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
