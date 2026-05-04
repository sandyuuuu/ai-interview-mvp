import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 面试模拟与复盘",
  description: "基于 AI 的面试训练与复盘平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-slate-50/50">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            <main className="flex-1 overflow-auto scrollbar-thin p-6">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
