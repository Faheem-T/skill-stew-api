import { describe, expect, it } from "@jest/globals";
import {
  decodeConnectedUsersCursor,
  encodeConnectedUsersCursor,
} from "../../utils/connectedUsersCursor";

describe("connectedUsersCursor", () => {
  it("encodes and decodes the connection cursor payload", () => {
    const connectedAt = new Date("2026-03-07T10:00:00.000Z");

    const cursor = encodeConnectedUsersCursor(connectedAt, "conn-1");
    const decoded = decodeConnectedUsersCursor(cursor);

    expect(decoded).toEqual({
      connectedAt,
      connectionId: "conn-1",
    });
  });

  it("throws for malformed cursors", () => {
    expect(() => decodeConnectedUsersCursor("invalid")).toThrow();
  });
});
