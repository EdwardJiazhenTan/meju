import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Tekindar Restaurant",
  description:
    "Experience the finest culinary journey with our carefully curated dishes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-body">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
