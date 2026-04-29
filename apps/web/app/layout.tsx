import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import  { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "sketchKaro",
  description: "SketchKaro is a real time drawing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased"><ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
          {children}
          <Toaster />
        </ThemeProvider>

      </body>
    </html>
  );
}
