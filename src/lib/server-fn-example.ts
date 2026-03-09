import { createServerFn } from "@tanstack/react-start";

/**
 * Business logic extracted from the server function for direct testability.
 * By keeping the handler's logic in a plain async function, tests can call it
 * without the HTTP layer that `createServerFn` uses in production.
 */
export async function addNumbers(a: number, b: number): Promise<number> {
  return a + b;
}

/**
 * Example server function that wraps `addNumbers`.
 *
 * In production, TanStack Start compiles this into an RPC handler with a
 * content-hashed URL (e.g. `/_server/abc123`). Because that URL is unstable
 * across builds, tests must NOT call this function directly. Instead, test
 * the extracted `addNumbers` helper above.
 */
export const $add = createServerFn({ method: "POST" })
  .inputValidator((data: { a: number; b: number }) => data)
  .handler(({ data }) => addNumbers(data.a, data.b));
