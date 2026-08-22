import { notFound } from 'next/navigation';
import { PERFILES_DATA } from '@/app/data/perfiles';
import ProfileView from './ProfileView';

const allProfiles = Object.values(PERFILES_DATA);

export function generateStaticParams() {
  return allProfiles.map((perfil) => ({ slug: perfil.slug }));
}

function buildFaqData(perfil) {
  const faqs = [];

  faqs.push({
    question: `¿Qué es ${perfil.name}?`,
    answer: perfil.shortDescription,
  });

  if (perfil.adaptationsWeSeek?.length) {
    const items = perfil.adaptationsWeSeek.slice(0, 4).join('; ');
    faqs.push({
      question: `¿Qué adaptaciones de examen se recomiendan para ${perfil.name}?`,
      answer: `${items}. En Adapto, estas adaptaciones se aplican automáticamente al subir un examen y seleccionar este perfil.`,
    });
  }

  if (perfil.impactInExams) {
    const firstSentence = perfil.impactInExams.split(/[.!?]+/).filter(Boolean)[0];
    faqs.push({
      question: `¿Cómo afecta ${perfil.name} a la realización de exámenes?`,
      answer: `${firstSentence}. Adapto ajusta formato, tiempo y estructura del examen para minimizar estas barreras.`,
    });
  }

  if (perfil.examRedFlags?.length) {
    const flags = perfil.examRedFlags.slice(0, 3).join('. ');
    faqs.push({
      question: `¿Qué errores debo evitar al diseñar un examen para este perfil?`,
      answer: flags,
    });
  }

  return faqs;
}

function buildJsonLd(perfil, faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Perfil NEAE: ${perfil.name}`,
    description: perfil.shortDescription,
    url: `https://www.adapto.tech/perfil/${perfil.slug}`,
    publisher: { '@type': 'Organization', '@id': 'https://www.adapto.tech/#organization' },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const perfil = PERFILES_DATA[slug];
  if (!perfil) {
    return { title: 'Perfil no encontrado - Adapto' };
  }
  const faqs = buildFaqData(perfil);
  return {
    title: `${perfil.name} - Adapto`,
    description: perfil.shortDescription,
    alternates: { canonical: `/perfil/${perfil.slug}` },
    openGraph: {
      type: 'article',
      title: `${perfil.name} | Adapto`,
      description: perfil.shortDescription,
      url: `https://www.adapto.tech/perfil/${perfil.slug}`,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const perfil = PERFILES_DATA[slug];
  if (!perfil) notFound();

  const faqs = buildFaqData(perfil);
  const jsonLd = buildJsonLd(perfil, faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileView perfil={perfil} faqs={faqs} />
    </>
  );
}
