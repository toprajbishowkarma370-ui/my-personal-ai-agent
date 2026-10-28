import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const ownerEmail = process.env.OWNER_EMAIL || "toprajbk81@gmail.com";
      if (!ownerEmail) return true;
      if (process.env.NODE_ENV === "development" || !process.env.GOOGLE_CLIENT_ID) {
        return true;
      }
      return user.email === ownerEmail;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "render-nextauth-secret-fallback",
};
