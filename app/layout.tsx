import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Lilita_One } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const lilita = Lilita_One({ subsets: ['latin'], weight: '400', variable: '--font-lilita' })

export const metadata: Metadata = {
  title: {
    default: 'Di do Pastel — Pastelaria em Santaluz, BA',
    template: '%s | Di do Pastel',
  },
  description:
    'Pastéis, coxinhas, enroladinhos, refrigerantes e combos da Di do Pastel, em Santaluz, Bahia. Monte seu pedido para entrega, retirada ou consumo no local.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#D92727',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lilita.variable}`}>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
