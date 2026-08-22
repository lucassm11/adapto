import { NextResponse } from 'next/server';

const LOCALE_MAP = {
  ES: 'es',
  MX: 'es',
  CO: 'es',
  AR: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  BO: 'es',
  DO: 'es',
  HN: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',
  GQ: 'es',
  PR: 'es',
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  ZA: 'en',
  SG: 'en',
  IN: 'en',
  PH: 'en',
  BR: 'pt',
  PT: 'pt',
  FR: 'fr',
  BE: 'fr',
  LU: 'fr',
  CH: 'fr',
  DE: 'de',
  AT: 'de',
  IT: 'it',
  JP: 'en',
  CN: 'en',
  KR: 'en',
  RU: 'en',
  TR: 'en',
  NL: 'en',
  SE: 'en',
  NO: 'en',
  DK: 'en',
  FI: 'en',
  PL: 'en',
  CZ: 'en',
};

const DEFAULT_LOCALE = 'es';

function getLocale(countryCode) {
  if (!countryCode) return DEFAULT_LOCALE;
  return LOCALE_MAP[countryCode.toUpperCase()] || DEFAULT_LOCALE;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const existingLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (existingLocale) {
    return NextResponse.next();
  }

  const country = request.headers.get('x-vercel-ip-country');
  const locale = getLocale(country);

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|.*\\..*).*)'],
};
