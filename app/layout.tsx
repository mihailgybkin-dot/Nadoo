// app/layout.tsx
export const metadata = {
  title: 'Nadoo',
  description: 'Аренда вещей и задания рядом с вами',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
