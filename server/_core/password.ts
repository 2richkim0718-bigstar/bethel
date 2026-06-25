import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * 사내 로그인용 간단한 비밀번호 해싱 (Node 내장 scrypt, 외부 의존성 없음).
 * 저장 형식: `salt:hash` (둘 다 hex).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}
