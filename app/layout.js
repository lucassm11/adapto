import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import CookieBanner from "@/app/components/CookieBanner";
import LocaleSwitcher from "@/app/components/LocaleSwitcher";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL('https://www.adapto.tech'),
  title: {
    default: 'Adapto - Adaptar exámenes con IA para alumnos con TDAH, dislexia y NEAE',
    template: '%s | Adapto',
  },
  description:
    'Adapta exámenes para alumnos con necesidades educativas especiales en segundos. Adaptaciones reales conforme al marco DUA, NEAE y LOMLOE: TDAH, dislexia, discalculia, TEA y 16 perfiles con dictamen psicopedagógico e informe PDF.',
  keywords: [
    'adaptar examenes con ia',
    'adaptaciones curriculares',
    'adaptar examen alumno TDAH',
    'adaptaciones examen dislexia',
    'necesidades educativas especiales',
    'perfiles NEAE',
    'DUA diseño universal para el aprendizaje',
    'LOMLOE adaptaciones',
    'dictamen psicopedagogico',
    'diagnosticador NEAE ia',
    'adaptaciones examen discalculia',
    'herramienta orientadores',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Adapto',
    url: 'https://www.adapto.tech',
    title: 'Adapto - El examen se adapta al alumno',
    description:
      'Subes un examen, seleccionas el perfil del alumno (TDAH, dislexia, TEA...) y la IA lo reescribe con adaptaciones reales DUA/NEAE/LOMLOE en segundos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adapto - Adaptación de exámenes con IA',
    description: 'Adaptaciones educativas reales conforme a DUA, NEAE y LOMLOE en segundos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.adapto.tech/#organization',
      name: 'Adapto',
      url: 'https://www.adapto.tech',
      email: 'hola@adapto.app',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.adapto.tech/#website',
      url: 'https://www.adapto.tech',
      name: 'Adapto',
      inLanguage: 'es',
      publisher: { '@id': 'https://www.adapto.tech/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Adapto',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'es',
      url: 'https://www.adapto.tech',
      description:
        'Herramienta de IA que adapta exámenes para alumnos con TDAH, dislexia, discalculia, TEA y otros perfiles NEAE conforme a DUA y LOMLOE.',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Gratuito' },
        { '@type': 'Offer', price: '35', priceCurrency: 'EUR', name: 'Pro' },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} antialiased`}
      >
        <AuthProvider>
          <LocaleProvider>
            {children}
            <LocaleSwitcher />
            <CookieBanner />
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
