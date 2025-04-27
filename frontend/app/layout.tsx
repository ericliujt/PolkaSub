import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PolkaSub',
  description: 'A subscription manager on Polkadot Westend. Built by Eric Liu 2025.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
