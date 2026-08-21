import jwt from "jsonwebtoken";

const jwtExpiresIn = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    expiresIn: jwtExpiresIn,
  });
}

export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    return typeof payload === "object" && typeof payload.sub === "string"
      ? payload.sub
      : null;
  } catch {
    return null;
  }
}
