import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Proof-of-Work Protocol | Tactile Verification Engine",
  description: "Neumorphic based verification engine for the modern ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-nm-bg text-nm-fg font-sans antialiased selection:bg-nm-accent selection:text-white">
        <AuthProvider>
          <main className="min-h-screen relative z-10 transition-colors duration-500">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
