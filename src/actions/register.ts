"use server";

import z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = data;

  // Check for existing user
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  await db.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });

  return { success: "Email sent!" };
};
