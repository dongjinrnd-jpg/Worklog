import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AppLogo } from "@/components/shared/app-logo";
import { Toaster } from "@/components/ui/toaster";

// 폰트 최적화
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "업무일지 웹앱",
  description: "Google Sheets API를 활용한 업무일지 웹앱",
};

// 네비게이션 컴포넌트 분리
const Navigation = () => (
  <nav>
    <ul className="flex space-x-4">
      <li>
        <a href="/" className="hover:underline">홈</a>
      </li>
      <li>
        <a href="/daily-report" className="hover:underline">업무일지 작성</a>
      </li>
      <li>
        <a href="/daily-report/search" className="hover:underline">업무일지 검색</a>
      </li>
      <li>
        <a href="/project" className="hover:underline flex items-center">
          프로젝트 관리
        </a>
      </li>
      <li>
        <a href="#" className="hover:underline flex items-center opacity-60 cursor-not-allowed">
          대시보드
          <span className="ml-1 text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">준비중</span>
        </a>
      </li>
    </ul>
  </nav>
);

/**
 * 루트 레이아웃 컴포넌트
 * 애플리케이션의 기본 레이아웃과 구조를 정의합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-primary text-primary-foreground p-4 shadow-md">
              <div className="container mx-auto flex justify-between items-center">
                <AppLogo />
                <div className="flex items-center">
                  <Navigation />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="container mx-auto my-8 px-4 flex-grow">{children}</main>
            <footer className="bg-secondary text-secondary-foreground p-4">
              <div className="container mx-auto text-center">
                <p>© 2025 업무일지 웹앱. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
