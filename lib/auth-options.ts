import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { userQueries, mealPlanQueries } from "@/lib/database";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!account || !user.email) return false;

        const provider = account.provider as "google" | "github";
        const providerUserId = account.providerAccountId;

        // Check if user exists with this OAuth provider
        let existingUser = userQueries.getUserByOAuth(provider, providerUserId);

        if (existingUser) {
          // Update OAuth tokens if they exist
          if (account.access_token) {
            const expiresAt = account.expires_at 
              ? new Date(account.expires_at * 1000).toISOString()
              : undefined;
            
            userQueries.updateOAuthTokens(
              existingUser.user_id,
              provider,
              account.access_token,
              account.refresh_token,
              expiresAt
            );
          }
          return true;
        }

        // Check if user exists with same email but different provider
        existingUser = userQueries.getUserByEmail(user.email);

        if (existingUser) {
          // Link OAuth account to existing user
          const expiresAt = account.expires_at 
            ? new Date(account.expires_at * 1000).toISOString()
            : undefined;

          userQueries.createOAuth({
            user_id: existingUser.user_id,
            provider,
            provider_user_id: providerUserId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: expiresAt,
          });
          return true;
        }

        // Create new user
        const userData = {
          email: user.email,
          display_name: user.name || undefined,
          registration_method: provider,
        };

        const createResult = userQueries.createUser(userData);
        const userId = createResult.lastInsertRowid as number;

        // Create OAuth record
        const expiresAt = account.expires_at 
          ? new Date(account.expires_at * 1000).toISOString()
          : undefined;

        userQueries.createOAuth({
          user_id: userId,
          provider,
          provider_user_id: providerUserId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: expiresAt,
        });

        // Initialize user's meal plan
        mealPlanQueries.initializeUserMealPlan(userId);

        return true;
      } catch (error) {
        console.error("OAuth sign-in error:", error);
        return false;
      }
    },

    async jwt({ token }) {
      if (token.email) {
        // Get user from database
        const user = userQueries.getUserByEmail(token.email);
        if (user) {
          token.userId = user.user_id;
        }
      }
      return token;
    },

    async session({ session }) {
      if (session.user?.email) {
        const user = userQueries.getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.user_id.toString();
          session.user.username = user.username;
          session.user.displayName = user.display_name;
          session.user.registrationMethod = user.registration_method;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
      displayName?: string | null;
      registrationMethod?: "email" | "google" | "github";
    };
  }
}