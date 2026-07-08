import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/src/providers/store-provider";
import { Toaster } from "@/src/components/ui/toast";
import { Agentation } from "agentation";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WorkOS PM",
  description: "Project management SaaS dashboard for teams, managers, and employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body>
        <StoreProvider>
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
