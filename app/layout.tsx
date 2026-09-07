import "./globals.css";

export const metadata = {
  title: "aloo Marketing Feedback",
  description: "aloo filiallari uchun marketing va SMM feedback tizimi"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
