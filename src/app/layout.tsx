import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "今週のごはん",
  description: "4人家族の週間献立＆買い物リスト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJp.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col bg-[#faf8f5] text-[#333]"
        style={{ fontFamily: "var(--font-noto-sans-jp), 'Hiragino Sans', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
