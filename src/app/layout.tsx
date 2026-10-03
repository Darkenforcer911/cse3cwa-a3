import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import PageTracker from "@/components/PageTracker";

import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description:
    "Wordle and Word Search activity builder for Speech Pathology education",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const savedTheme = cookieStore.get("theme")?.value;

  const theme = savedTheme === "dark" ? "dark" : "light";

  return (
    <html lang="en" data-theme={theme}>
      <body>
          <PageTracker />
        <SiteHeader />

        <main className="page-container">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}