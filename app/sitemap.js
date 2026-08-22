import { PERFILES_DATA } from '@/app/data/perfiles';

export const dynamic = 'force-static';

export default function sitemap() {
  const base = 'https://www.adapto.tech';
  const now = new Date();

  const paginasFijas = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/precios`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/diagnosticador`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/auditor-dua`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/aviso-legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politica-privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politica-cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terminos-condiciones`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const paginasPerfiles = Object.values(PERFILES_DATA).map((p) => ({
    url: `${base}/perfil/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...paginasFijas, ...paginasPerfiles];
}
