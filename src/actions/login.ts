"use server";

import z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmial } from "@/lib/mail";

export const login = async (data: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    // password - if logged in with oAuth
    return { error: " " };
  }

  if (!existingUser.emailVerified) {
    const verficationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmial(verficationToken.email, verficationToken.token);

    return { success: "Confirmation email sent" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }
};
