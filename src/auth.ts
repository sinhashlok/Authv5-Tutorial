import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without verification
      if (account?.provider !== "credentials") {
        return true;
      }

      const existingUser = await getUserById(user.id || "");
      if (!existingUser?.emailVerified) {
        // Prevent sign in without email verification
        return false;
      }

      return true;
    },
    async session({ token, session }) {
      // async function that allows us to control what happens when an action is performed
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token?.sub) return token;

      const user = await getUserById(token?.sub);
      if (!user) return token;

      token.role = user.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
