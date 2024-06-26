import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoute} from "@/constants/routes";

const {auth} = NextAuth(authConfig);
// @ts-ignore
export default auth((req) => {
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoute.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) return null;

    if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

        return null;
    }

    if (!isLoggedIn && !isPublicRoute) return Response.redirect(new URL("/login", nextUrl));

    return null;

});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}