import type { Metadata } from "next";
import { Inter, Roboto, Open_Sans, Lato, Playfair_Display, Roboto_Mono, Poppins, Montserrat } from "next/font/google";
import "./globals.css";

// Google Fonts for the editor
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const openSans = Open_Sans({ 
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const lato = Lato({ 
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MailCanvas - Email Design Studio",
  description: "Professional email design tool with Figma-like canvas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable} 
          ${roboto.variable} 
          ${openSans.variable} 
          ${lato.variable} 
          ${playfairDisplay.variable} 
          ${robotoMono.variable}
          ${poppins.variable}
          ${montserrat.variable}
          antialiased
        `}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
