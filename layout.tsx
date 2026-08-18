import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import CursorFX from "@/components/CursorFX";
import ScrollProgress from "@/components/ScrollProgress";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const siteUrl = "https://hashcreates.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "your friendly neighbourhood editor",
  description:
    "Harshita is a Delhi-based video editor, cinematographer and creative head. Specializing in YouTube long-form edits, Instagram Reels, podcasts, talking-head videos, game shows, and 3D brand ads. Available for freelance & full-time video editing work in Delhi NCR.",
  keywords:
    "best video editor in delhi, video editor delhi, video editing services delhi, freelance video editor delhi, video editor near me, creative head delhi, cinematographer delhi, youtube video editor delhi, reels editor delhi, podcast video editor, professional video editing",
  authors: [{ name: "Harshita" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    siteName: "Harshita — Video Editor",
    title: "Harshita | Best Video Editor in Delhi",
    description:
      "Delhi-based video editor, cinematographer & creative head. YouTube long-form, Instagram Reels, podcasts, and 3D brand ads. Available for freelance & full-time work.",
    images: [`${siteUrl}/stack/c1.jpg`],
    url: siteUrl,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harshita | Best Video Editor in Delhi",
    description:
      "Delhi-based video editor, cinematographer & creative head — YouTube, Instagram Reels, podcasts, and 3D brand ads.",
    images: [`${siteUrl}/stack/c1.jpg`],
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "Delhi, India",
    "geo.position": "28.6139;77.2090",
    ICBM: "28.6139, 77.2090",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05071c" },
    { media: "(prefers-color-scheme: light)", color: "#f4f3fc" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Harshita",
      jobTitle: ["Video Editor", "Cinematographer", "Creative Head", "Storyteller"],
      description:
        "Delhi-based video editor, cinematographer and creative head specializing in YouTube long-form content, Instagram Reels, podcasts, talking-head videos, game shows, and 3D brand ads.",
      url: `${siteUrl}/`,
      email: "mailto:harrsheeta@gmail.com",
      telephone: "+91-9958710599",
      address: { "@type": "PostalAddress", addressLocality: "Delhi", addressRegion: "Delhi", addressCountry: "IN" },
      sameAs: ["https://www.instagram.com/harrshheta/"],
      knowsAbout: ["Video Editing", "Cinematography", "Motion Graphics", "3D Animation", "Color Grading", "Sound Design"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#service`,
      name: "Harshita — Video Editing Services",
      image: `${siteUrl}/stack/c1.jpg`,
      description:
        "Professional video editing services in Delhi — YouTube long-form edits, Instagram Reels, podcasts, game shows, talking-head videos, and 3D brand ads/animation.",
      priceRange: "$$",
      areaServed: { "@type": "City", name: "Delhi" },
      address: { "@type": "PostalAddress", addressLocality: "Delhi", addressRegion: "Delhi", addressCountry: "IN" },
      geo: { "@type": "GeoCoordinates", latitude: 28.6139, longitude: 77.209 },
      telephone: "+91-9958710599",
      email: "harrsheeta@gmail.com",
      url: `${siteUrl}/`,
      sameAs: ["https://www.instagram.com/harrshheta/"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Harshita | Best Video Editor in Delhi",
      publisher: { "@id": `${siteUrl}/#person` },
    },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem("hash-theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}>
        <AmbientBackdrop />
        <ScrollProgress />
        <CursorFX />
        {children}
      </body>
    </html>
  );
}
