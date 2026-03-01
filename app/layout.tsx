import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  // CAMBIAR TÍTULO, DESCRIPCIÓN Y SEO AQUÍ:
  title: 'APS Pereira - Sistema de Gestión',
  description: 'Plataforma web corporativa para el control de metas y seguimiento de atenciones institucionales de la ESE Salud Pereira.',
  keywords: ['ESE Salud Pereira', 'salud', 'gestión', 'atenciones', 'pacientes', 'Pereira', 'sistema'],
  authors: [{ name: 'Juan Taguado' }],
  
  // CAMBIAR ICONO DE LA PESTAÑA DEL NAVEGADOR AQUÍ (Favicon):
  // Asegúrate de tener la imagen dentro de la carpeta "public" y enlazarla aquí.
  icons: {
    icon: '/icono-ese-salud-pereira.png',
    apple: '/icono-ese-salud-pereira.png', // Para dispositivos móviles de Apple
  },
  
  openGraph: {
    title: 'ESE Salud Pereira - Sistema de Gestión',
    description: 'Plataforma web corporativa para el control de metas y seguimiento de atenciones.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'ESE Salud Pereira',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_poppins.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
