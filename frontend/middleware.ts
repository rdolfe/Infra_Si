import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/agency", "/admin"];

const ROLE_PREFIXES: Record<string, string[]> = {
  admin: ["/admin", "/agency", "/dashboard"],
  agent: ["/agency", "/dashboard"],
  client: ["/dashboard"],
};

function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie) return cookie;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const token = getTokenFromRequest(req);

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role as string | undefined;

  if (role && ROLE_PREFIXES[role]) {
    const allowed = ROLE_PREFIXES[role].some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (!allowed) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/agency/:path*", "/admin/:path*"],
};
