import { CartProvider } from '@/components/site/cart-provider'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { StoreStatusBar } from '@/components/site/store-status-bar'
import { getStoreSettings } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings()
  return (
    <CartProvider>
      <StoreStatusBar settings={settings} />
      <SiteHeader />
      <main id="conteudo" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
    </CartProvider>
  )
}
