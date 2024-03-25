import { Toaster } from "sonner";
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { ModalProvider } from "@/components/providers/modal-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Raleway } from 'next/font/google'
import ContextProvider from "@/context/context";

const raleway = Raleway({
  weight: ['400', '700'], // Example: Regular and Bold
  subsets: ['latin'],
})

import './globals.css'

export const metadata: Metadata = {
  title: 'Docto',
  description: 'From conversation to clinical note with artificial intelligence  ',
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log(children)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={raleway.className}>
        <ConvexClientProvider>
          <EdgeStoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="Docto-theme-2"
            >
              <ContextProvider>
                <Toaster position="bottom-right" />
                <ModalProvider />
                {children}
              </ContextProvider>
            </ThemeProvider>
          </EdgeStoreProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
