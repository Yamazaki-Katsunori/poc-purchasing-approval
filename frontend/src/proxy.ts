import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const exclusionPath = pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico');
  pathname.includes('.');

  // debug cookie
  const cookie = request.cookies.get('nextjs');
  console.log(cookie);

  const allCookies = request.cookies.getAll();
  console.log(allCookies);

  request.cookies.has('nextjs');

  // 静的ファイルや next.js 内部パスは除外
  if (exclusionPath) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const token = request.cookies.get('mock_token')?.value;

  // 未ログインで保護ページにアクセスしたら /login へ遷移
  if (!token && !isPublicPath) return NextResponse.redirect(new URL('/login', request.url));

  // ログイン済みで /login へきたら / へ戻す
  if (token && pathname === '/login') return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
