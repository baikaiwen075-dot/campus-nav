import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusNav | 大学生效率导航",
  description: "面向中国大学生的学习、AI、开发和小众工具导航站。",
  applicationName: "CampusNav"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#101216" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
