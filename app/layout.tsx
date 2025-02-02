import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carnum - 운전 매너 리뷰',
  description: '차량번호로 운전 매너를 리뷰하는 서비스',
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