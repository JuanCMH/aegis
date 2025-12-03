import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAutPage = createRouteMatcher(["/auth"]);
const isPublicPage = createRouteMatcher(["/", "/seguros/:path*"]);

const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
	if (isPublicPage(request)) return;
	if (!isAutPage(request) && !(await convexAuth.isAuthenticated())) {
		return nextjsMiddlewareRedirect(request, "/auth");
	}
	if (isAutPage(request) && (await convexAuth.isAuthenticated())) {
		return nextjsMiddlewareRedirect(request, "/workspaces");
	}
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

export default proxy;
