type ConnectedUsersCursorPayload = {
  connectedAt: string;
  connectionId: string;
};

export function encodeConnectedUsersCursor(
  connectedAt: Date,
  connectionId: string,
): string {
  const payload: ConnectedUsersCursorPayload = {
    connectedAt: connectedAt.toISOString(),
    connectionId,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeConnectedUsersCursor(cursor: string): {
  connectedAt: Date;
  connectionId: string;
} {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const parsed = JSON.parse(decoded) as Partial<ConnectedUsersCursorPayload>;

  if (
    !parsed.connectedAt ||
    !parsed.connectionId ||
    Number.isNaN(new Date(parsed.connectedAt).getTime())
  ) {
    throw new Error("Invalid connected users cursor");
  }

  return {
    connectedAt: new Date(parsed.connectedAt),
    connectionId: parsed.connectionId,
  };
}
