import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });
});
