import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./provider";
import QueryProvider from "./queryProvider";
import ToastProvider from "./components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InvPro SaaS",
  description: "Inventory and Invoicing Management System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#051424] text-[#d4e4fa]">
        <QueryProvider>
          <ReduxProvider>
            {children}
            <ToastProvider />
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
