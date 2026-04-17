import { describe, it, expect } from "vitest";
import { formatDate, timeAgo } from "./utils";

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    const result = formatDate("2026-04-17T08:00:00.000Z");
    expect(result).not.toBe("Never");
    expect(result).toContain("2026");
  });

  it("returns Never for null", () => {
    expect(formatDate(null)).toBe("Never");
  });
});

describe("timeAgo", () => {
  it("returns seconds ago for very recent times", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toMatch(/0?s ago/);
  });

  it("returns minutes ago for recent times", () => {
    const date = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("2m ago");
  });

  it("returns hours ago for older times", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("3h ago");
  });

  it("returns days ago for old times", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("2d ago");
  });

  it("returns Never for null", () => {
    expect(timeAgo(null)).toBe("Never");
  });
});
