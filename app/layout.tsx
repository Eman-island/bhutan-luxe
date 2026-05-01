import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhutan-Luxe — The Bhutan Few Will Ever See",
  description:
    "Bespoke luxury group journeys to Bhutan. By private inquiry. Three tiers of access, eight guests per departure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
