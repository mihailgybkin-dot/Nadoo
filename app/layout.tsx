// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Nadoo — аренда вещей и задания рядом',
  description:
    'Сервис аренды вещей и выполнения заданий рядом с вами. Безопасные сделки, прозрачные условия, удобная карта.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-neutral-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
