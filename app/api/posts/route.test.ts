import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  rateLimit: vi.fn(),
  createPost: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock("@/lib/ratelimit", () => ({
  postCreateLimiter: {
    limit: mocks.rateLimit,
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
          create: mocks.createPost,
        },
      },
    },
  },
}));

test("returns 401 when user is not authenticated", async () => {
  mocks.getSession.mockResolvedValue(null);

  const request = new Request(
    "http://localhost:3000/api/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Test post",
        imageUrl: "",
        isAnonymous: false,
      }),
    }
  );

  const response = await POST(request);

  expect(response.status).toBe(401);
});

test("returns 400 when post data is invalid", async () => {
  mocks.getSession.mockResolvedValue({
    user: {
      id: "4",
    },
  });

  mocks.rateLimit.mockResolvedValue({
    success: true,
  });

  const request = new Request(
    "http://localhost:3000/api/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Test post",
        imageUrl: "",
        isAnonymous: "yes",
      }),
    }
  );

  const response = await POST(request);

  expect(response.status).toBe(400);
});

test("returns 429 when rate limit is exceeded", async () => {
  mocks.getSession.mockResolvedValue({
    user: {
      id: "4",
    },
  });

  mocks.rateLimit.mockResolvedValue({
    success: false,
  });

  const request = new Request(
    "http://localhost:3000/api/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Test post",
        imageUrl: "",
        isAnonymous: false,
      }),
    }
  );

  const response = await POST(request);

  expect(response.status).toBe(429);
});

test("creates a post and returns 201", async () => {
  mocks.getSession.mockResolvedValue({
    user: {
      id: "4",
    },
  });

  mocks.rateLimit.mockResolvedValue({
    success: true,
  });

  mocks.createPost.mockResolvedValue({
    id: 10,
    content: "My test post",
    imageUrl: null,
    isAnonymous: false,
    authorId: 4,
  });

  const request = new Request(
    "http://localhost:3000/api/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "My test post",
        imageUrl: "",
        isAnonymous: false,
      }),
    }
  );

const response = await POST(request);

expect(response.status).toBe(201);

expect(mocks.createPost).toHaveBeenCalledWith({
  content: "My test post",
  imageUrl: null,
  isAnonymous: false,
  authorId: 4,
});
});

beforeEach(() => {
  mocks.getSession.mockReset();
  mocks.rateLimit.mockReset();
  mocks.createPost.mockReset();
});