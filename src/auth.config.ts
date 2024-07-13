import { type NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "@auth/core/errors";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";

import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";

class CustomError extends CredentialsSignin {
  code = "custom";
}

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);

          if (!user || !user.password) {
            // no password - if login with google / github
            throw new CustomError();
          }

          const passwordMatch = await bcryptjs.compare(password, user.password);
          if (passwordMatch) {
            return user;
          }

          throw new CustomError();
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
