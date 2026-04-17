import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./api";

describe("getErrorMessage", () => {
  it("returns configuration message for 4xx", () => {
    expect(getErrorMessage(400)).toContain("configuration");
    expect(getErrorMessage(404)).toContain("configuration");
  });

  it("returns internal server error message for 500", () => {
    expect(getErrorMessage(500)).toContain("Internal server error");
  });

  it("returns gateway error message for 502", () => {
    expect(getErrorMessage(502)).toContain("unreachable");
  });

  it("returns generic message for unexpected status", () => {
    expect(getErrorMessage(503)).toContain("unexpected error");
  });
});
