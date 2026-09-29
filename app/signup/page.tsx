"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await authClient.signUp.email({
      name: name,
      email: email,
      password: password,
      university: university,
      department: department,
    });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    console.log("Signup successful:", data);

    router.push("/");
  }

  return (
    <div className="auth-page">
      <SiteHeader
        compact 
      />
      <main className="auth-page__main">
        <section className="auth-card auth-card--wide" aria-labelledby="signup-heading">
          <div className="auth-card__badge" aria-hidden="true">＋</div>
          <h1 id="signup-heading">Join your campus</h1>
          <p className="auth-card__intro">
            Create your profile and become part of the conversation.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="university">University</label>
                <input
                  id="university"
                  type="text"
                  placeholder="Your university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  placeholder="Your department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="button button--primary button--full">
              Create my account
            </button>
          </form>

          <p className="auth-card__footer">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
