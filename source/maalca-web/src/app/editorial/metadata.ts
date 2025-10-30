import type { Metadata } from 'next';

export const editorialMetadata: Metadata = {
  title: 'Editorial MaalCa | Filosofía y Cultura desde el Caribe',
  description: 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea. Pensamientos profundos con la autenticidad del Caribe y perspectiva global.',
  keywords: [
    'filosofía',
    'cultura',
    'editorial',
    'caribe',
    'república dominicana',
    'pensamiento contemporáneo',
    'reflexiones',
    'artículos filosóficos',
    'cultura caribeña',
    'pensamiento crítico'
  ],
  authors: [{ name: 'MaalCa Editorial' }],
  creator: 'MaalCa Editorial',
  publisher: 'MaalCa',

  openGraph: {
    title: 'Editorial MaalCa | Filosofía y Cultura desde el Caribe',
    description: 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea con la autenticidad del Caribe.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://maalca.com/editorial',
    siteName: 'MaalCa',
    images: [
      {
        url: '/og-editorial.jpg', // TODO: Create this image
        width: 1200,
        height: 630,
        alt: 'Editorial MaalCa - Filosofía y Cultura desde el Caribe',
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Editorial MaalCa | Filosofía y Cultura',
    description: 'Pensamientos profundos con la autenticidad del Caribe y perspectiva global.',
    images: ['/og-editorial.jpg'], // TODO: Create this image
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://maalca.com/editorial',
  },
};

export function generateArticleMetadata(article: {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
}): Metadata {
  return {
    title: `${article.title} | Editorial MaalCa`,
    description: article.excerpt,
    keywords: [...article.tags, 'editorial', 'maalca', article.category.toLowerCase()],
    authors: [{ name: article.author }],
    creator: article.author,
    publisher: 'MaalCa Editorial',

    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      locale: 'es_ES',
      url: `https://maalca.com/editorial/articulos/${article.id}`,
      siteName: 'MaalCa Editorial',
      publishedTime: article.publishDate,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: `/og-articles/${article.id}.jpg`, // TODO: Generate per-article OG images
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [`/og-articles/${article.id}.jpg`],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: `https://maalca.com/editorial/articulos/${article.id}`,
    },
  };
}
