import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "Electric Resume - Supercharge Your Career",
  description: "Ditch the boring black-and-white CVs. Our intelligent analyzer injects life into your experience.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface-container-lowest text-on-background">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}

