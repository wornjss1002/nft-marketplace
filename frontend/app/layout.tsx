import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NFT Marketplace',
  description: 'Web3 NFT Marketplace with Token Drop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
