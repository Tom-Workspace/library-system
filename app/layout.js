import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Library ERP System",
  description: "Advanced Library Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} bg-slate-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 mr-64 p-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}