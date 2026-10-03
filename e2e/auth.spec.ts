import { test, expect } from "@playwright/test";

test("unauthenticated user is redirected to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
});

test("user can log in", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_EMAIL and E2E_PASSWORD must be set");
  }

  await page.goto("/login");

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);

  await page
    .getByRole("button", {
      name: "Log in to CampusPulse",
    })
    .click();

  await expect(page).toHaveURL("http://localhost:3000/");
});