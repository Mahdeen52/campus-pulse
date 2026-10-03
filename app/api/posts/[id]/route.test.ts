import { expect, test, vi } from "vitest";
import { PATCH } from "./route";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findPost: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/src/prisma/db", () => ({
  db: {
    orm: {
      public: {
        Post: {
          first: mocks.findPost,
        },
      },
    },
  },
}));

test("returns 403 when user does not own the post", async () => {
  mocks.getSession.mockResolvedValue({
    user: {
      id: "4",
    },
  });

  mocks.findPost.mockResolvedValue({
    id: 5,
    authorId: 7,
  });

  const request = new Request(
    "http://localhost:3000/api/posts/5",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Trying to edit",
      }),
    }
  );

  const response = await PATCH(request, {
    params: Promise.resolve({
      id: "5",
    }),
  });

  expect(response.status).toBe(403);
});