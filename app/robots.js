export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://www.adapto.tech/sitemap.xml',
    host: 'https://www.adapto.tech',
  };
}
