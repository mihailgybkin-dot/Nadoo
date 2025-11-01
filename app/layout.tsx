export const dynamic = "force-static";
import "./globals.css";

export const metadata = {
  title: "Nadoo — аренда и задания рядом",
  description:
    "Сервис аренды вещей и выполнения заданий: ищите рядом, бронируйте безопасно, получайте оплату.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
