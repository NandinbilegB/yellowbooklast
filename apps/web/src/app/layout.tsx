import type { Metadata } from "next";
import { Providers } from "./providers";
import "./global.css";

export const metadata: Metadata = {
  title: "ШАР НОМ - Цахим Системлэг Бүс",
  description: "Монголын үнэлгээтэй байгууллагын сан",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
