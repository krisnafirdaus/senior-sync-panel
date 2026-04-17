import { describe, it, expect } from "vitest";
import { classifyChanges } from "./sync";
import { Change } from "@/app/types";

describe("classifyChanges", () => {
  it("classifies known conflict fields as conflicts", () => {
    const changes: Change[] = [
      {
        id: "c1",
        field_name: "user.email",
        change_type: "UPDATE",
        current_value: "a@b.com",
        new_value: "c@d.com",
      },
      {
        id: "c2",
        field_name: "user.phone",
        change_type: "UPDATE",
        current_value: "111",
        new_value: "222",
      },
    ];
    const result = classifyChanges(changes);
    expect(result.conflicts).toHaveLength(2);
    expect(result.clean).toHaveLength(0);
  });

  it("classifies non-conflict updates as clean", () => {
    const changes: Change[] = [
      {
        id: "c1",
        field_name: "user.name",
        change_type: "UPDATE",
        current_value: "John",
        new_value: "Jane",
      },
    ];
    const result = classifyChanges(changes);
    expect(result.clean).toHaveLength(1);
    expect(result.conflicts).toHaveLength(0);
  });

  it("treats CREATE and DELETE as clean regardless of field", () => {
    const changes: Change[] = [
      {
        id: "c1",
        field_name: "user.email",
        change_type: "CREATE",
        current_value: null,
        new_value: "a@b.com",
      },
      {
        id: "c2",
        field_name: "user.phone",
        change_type: "DELETE",
        current_value: "111",
        new_value: null,
      },
    ];
    const result = classifyChanges(changes);
    expect(result.clean).toHaveLength(2);
    expect(result.conflicts).toHaveLength(0);
  });
});
