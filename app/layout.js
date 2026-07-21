export const metadata = {
  title: 'PakExam AI - BISE Board Solver',
  description: 'Pakistani BISE Board Exam Solver',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
