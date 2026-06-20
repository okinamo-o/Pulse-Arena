import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Only protect the /admin route
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const basicAuth = req.headers.get("authorization");

    // Replace with desired username and password
    const USER = "okinamo";
    const PWD = "frivE789456123";

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (user === USER && pwd === PWD) {
        return NextResponse.next();
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
