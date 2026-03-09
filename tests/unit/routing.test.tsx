import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import React from "react";
/**
 * Example: Testing TanStack Router with file-based, typesafe routing.
 *
 * Key concepts:
 * - Import `routeTree` from the generated `routeTree.gen.ts` file to get full
 *   type information about every route in the app.
 * - Use `createMemoryHistory` so tests never touch the browser's URL bar.
 * - `router.buildLocation({ to: '...' })` is the primary type-safe API: if
 *   you pass an unknown path TypeScript reports an error at compile time.
 * - `router.navigate({ to: '...' })` updates the in-memory history and triggers
 *   `beforeLoad`/loader hooks, letting you assert on router state after navigation.
 * - `RouterProvider` (with an optional `QueryClientProvider` wrapper) renders
 *   the matched route component so you can make assertions with Testing Library.
 *
 * Ref: https://tanstack.com/router/latest/docs/how-to/test-file-based-routing
 */
import { describe, expect, it, vi } from "vitest";

// Prevent database access triggered by the auth module that is imported
// transitively through the route tree (route beforeLoad hooks call $getUser).
vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ response: null, headers: null }),
    },
  },
}));

// Mock $getUser to avoid the server-runtime requirement ("No StartEvent found
// in AsyncLocalStorage") that fires when the function is invoked outside the
// TanStack Start server context.
vi.mock("@/lib/auth/functions", () => ({
  $getUser: vi.fn().mockResolvedValue(null),
}));

// Import the generated route tree AFTER the mocks are in place.
import { routeTree } from "@/routeTree.gen";

// ---------------------------------------------------------------------------
// Test-router factory
// ---------------------------------------------------------------------------

function createTestRouter(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    // Provide the same context shape the root route expects.
    context: { queryClient, user: null },
  });

  return { router, queryClient };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("typesafe routing", () => {
  it("buildLocation constructs correct paths for known routes", () => {
    const { router } = createTestRouter();

    // TypeScript enforces that `to` is one of the routes registered in
    // routeTree.gen.ts. Passing an unknown path is a compile-time error.
    expect(router.buildLocation({ to: "/" }).pathname).toBe("/");
    expect(router.buildLocation({ to: "/login" }).pathname).toBe("/login");
    expect(router.buildLocation({ to: "/signup" }).pathname).toBe("/signup");
    expect(router.buildLocation({ to: "/app" }).pathname).toBe("/app");
  });

  it("initialises at the path given to createMemoryHistory", async () => {
    const { router } = createTestRouter("/login");
    await router.load();

    expect(router.state.location.pathname).toBe("/login");
  });

  it("navigates to a new route and updates router state", async () => {
    const { router } = createTestRouter("/login");
    await router.load();

    await router.navigate({ to: "/signup" });

    expect(router.state.location.pathname).toBe("/signup");
  });

  it("renders the matched route component via RouterProvider", async () => {
    const { router, queryClient } = createTestRouter("/login");
    await router.load();

    render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(RouterProvider, { router }),
      ),
    );

    // getByLabelText throws if the element is not found, so a successful call
    // already asserts presence. We additionally confirm the element is an input.
    expect(screen.getByLabelText("Email").tagName.toLowerCase()).toBe("input");
  });
});
