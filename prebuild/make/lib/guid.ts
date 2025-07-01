import crypto from "crypto";

export function getGuid(filename: string): string {
  return crypto
    .createHash("sha256")
    .update(filename)
    .digest("hex")
    .substring(0, 32)
    .toUpperCase();
}
