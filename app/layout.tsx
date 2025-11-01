import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Nadoo — аренда вещей и задания',
  description: 'Сервис аренды вещей и выполнения заданий рядом с вами. Безопасные сделки, прозрачные условия, удобная карта.',
  icons: { icon: '/logo-nadoo.svg' }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  )
}
