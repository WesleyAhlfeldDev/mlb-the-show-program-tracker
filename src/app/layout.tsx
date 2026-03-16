import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-condensed',
})

export const metadata: Metadata = {
  title: 'MLB The Show 26 · Program Tracker',
  description: 'Diamond Dynasty program tracker — All 30 teams, WBC, #1 Fan, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      style={{ background: '#080c14' }}
    >
      <body
        className="font-body antialiased"
        style={{ background: '#080c14', color: '#e8edf8', minHeight: '100vh' }}
      >
        {children}
      </body>
    </html>
  )
}
