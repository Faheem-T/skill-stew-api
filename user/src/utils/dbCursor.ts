export function encodeCursor(createdAt: Date, id: string): string {
  const payload = JSON.stringify({ createdAt: createdAt.toISOString(), id });
  return Buffer.from(payload).toString("base64");
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const obj = JSON.parse(decoded);
  return { createdAt: new Date(obj.createdAt), id: obj.id };
}
