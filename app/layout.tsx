import './globals.css';
import Header from '@/components/Header';

export const metadata = { title: 'Nadoo' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
