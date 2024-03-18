import NextAuth from "next-auth"
import {UserRole} from "@prisma/client";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {db} from "@/lib/db";
import authConfig from "@/auth.config";
import {getUserById} from "@/data/user";

export const {
    handlers: {GET, POST},
    auth, signIn, signOut
} = NextAuth({
    pages: {
        signIn: "/login",
    },
    events: {
        async linkAccount({user}) {
            await db.user.update({
                where: {id: user.id as string},
                data: {emailVerified: new Date()}
            })
        }
    },
    callbacks: {
        // check is email verified?
        async signIn({user, account}) {
            if (account?.provider !== "credentials") return true;

            const existingUser = await getUserById(user.id as string);
            if (!existingUser?.emailVerified) return false;

            // TODO: add 2fa check
            return true;
        },
        async session({token, session}) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as UserRole;
            }

            return session;
        },
        async jwt({token}) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if (!existingUser) return token;

            token.role = existingUser.role;
            return token;
        },
    },
    adapter: PrismaAdapter(db),
    session: {strategy: "jwt"},
    ...authConfig
})