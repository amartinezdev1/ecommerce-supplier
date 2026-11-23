import type { Metadata } from "next";
export const metadata: Metadata={title:"RPM · Rebajas por Minuto",description:"Catálogo y cotizaciones RPM"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
