import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";

const passwordSaltRounds = 12;

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AuthServiceError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, passwordSaltRounds);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: safeUserSelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AuthServiceError("Email is already registered", 409);
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getSafeUserById(userId: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });
}
