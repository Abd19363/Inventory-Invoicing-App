import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./provider";
import QueryProvider from "./queryProvider";
import ToastProvider from "./components/ToastProvider";
import AdminThemeProvider from "./components/AdminThemeProvider";

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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var role = localStorage.getItem('userRole');
                if (role === 'ADMIN') {
                  var theme = localStorage.getItem('admin_theme');
                  if (theme && theme !== 'default') {
                    document.documentElement.setAttribute('data-admin-theme', theme);
                  }
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[#051424] text-[#d4e4fa]">
        <QueryProvider>
          <ReduxProvider>
            <AdminThemeProvider>
              {children}
              <ToastProvider />
            </AdminThemeProvider>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
