import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";

import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
}

export default {
  providers: [
    Credentials({
      // @ts-ignore
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);

          if (!user || !user.password) {
            // no password - if login with google / github
            return null;
          }

          const passwordMatch = await bcryptjs.compare(password, user.password);
          if (passwordMatch) {
            return user;
          }

          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
