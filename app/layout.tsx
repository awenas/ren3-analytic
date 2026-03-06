import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReN3 Analytics - AnalyticDB',
  description: 'AI-powered analytics platform with AnalyticDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
