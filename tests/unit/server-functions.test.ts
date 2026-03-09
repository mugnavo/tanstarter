/**
 * Example: Testing TanStack Start server functions.
 *
 * TanStack Start compiles `createServerFn` calls into RPC handlers at build
 * time and assigns each handler a content-hashed URL (e.g. `/_server/abc123`).
 * That URL changes with every build, so unit tests MUST NOT call server
 * functions through HTTP — the URL would be stale or simply unknown.
 *
 * Two complementary patterns are shown below:
 *
 * 1. **Extract handler logic** — Move the real work into a plain async
 *    function and have the `createServerFn` handler delegate to it. Tests
 *    then call the plain function directly, with no HTTP involved.
 *
 * 2. **Mock the server function** — When testing code that *calls* a server
 *    function (a component, a route loader, …), replace the module with a
 *    `vi.mock` factory so the HTTP machinery is never reached.
 *
 * Ref: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
 */
import { describe, expect, it, vi } from "vitest";
// ---------------------------------------------------------------------------
// Pattern 1 — Test extracted handler logic as a plain async function
// ---------------------------------------------------------------------------

// Import only the extracted pure function, not the server function wrapper.
// The wrapper (`$add`) would try to make an HTTP call in a compiled build.
import { addNumbers } from "@/lib/server-fn-example";

describe("$add — handler logic (pattern 1: extract & test directly)", () => {
  it("adds two positive numbers", async () => {
    expect(await addNumbers(1, 2)).toBe(3);
  });

  it("adds a negative and a positive number", async () => {
    expect(await addNumbers(-5, 5)).toBe(0);
  });

  it("adds two zeros", async () => {
    expect(await addNumbers(0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Pattern 2 — Mock the server function for consumer tests
// ---------------------------------------------------------------------------

// When testing code that *calls* a server function, mock the entire module so
// `vi.fn()` replaces the compiled fetcher. This avoids any HTTP or runtime
// dependency and lets you control return values per test.
vi.mock("@/lib/auth/functions", () => ({
  $getUser: vi.fn(),
}));

import { $getUser } from "@/lib/auth/functions";

// Imagine this utility lives in a route loader or component:
async function resolveUserEmail(): Promise<string | null> {
  const user = await $getUser();
  return user?.email ?? null;
}

describe("$getUser consumers (pattern 2: mock the server function)", () => {
  it("resolves the email when a user is authenticated", async () => {
    vi.mocked($getUser).mockResolvedValueOnce({
      id: "user_1",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      image: null,
    });

    const email = await resolveUserEmail();

    expect(email).toBe("test@example.com");
  });

  it("returns null when no user is authenticated", async () => {
    vi.mocked($getUser).mockResolvedValueOnce(null);

    const email = await resolveUserEmail();

    expect(email).toBeNull();
  });
});
