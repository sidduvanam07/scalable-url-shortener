
import { randomBytes } from "node:crypto";

const BASE62 =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateShortCode(length = 7) {
  const bytes = randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i++) {
    code += BASE62[bytes[i] % 62];
  }

  return code;
}
