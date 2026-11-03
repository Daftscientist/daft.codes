import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Daft.",
    template: "%s | Daft.",
  },
  description: "Leo Johnston Mesia — software engineer from England. Building domOXML, document tooling and systems software.",
  metadataBase: new URL("https://daft.codes"),
  openGraph: {
    title: "Leo Johnston Mesia — Software Engineer",
    description: "Software engineer from England. Building domOXML, document tooling and systems software.",
    url: "https://daft.codes",
    siteName: "daft.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 627, alt: "daft.codes — Leo Johnston Mesia, software engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leo Johnston Mesia — Software Engineer",
    description: "Software engineer from England. Building domOXML, document tooling and systems software.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.css"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
