'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, ShoppingBag } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useCart } from './cart-provider'

const links = [
  { href: '/', label: 'Início' },
  { href: '/cardapio', label: 'Cardápio' },
  { href: '/pedido', label: 'Acompanhar pedido' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand-yellow bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="Di do Pastel — página inicial">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent',
                    isActive(link.href) && 'bg-brand-black text-white hover:bg-brand-black',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrinho"
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-brand-red px-4 font-semibold text-white transition-colors hover:bg-brand-red/90"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">Carrinho</span>
            <span className="sr-only sm:hidden">Carrinho</span>
            <span className="grid min-w-6 place-items-center rounded-full bg-brand-yellow px-1.5 text-xs font-bold text-brand-black">
              {count}
              <span className="sr-only"> itens</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-full border md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Menu móvel" className="px-4">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-4 py-3 text-base font-semibold hover:bg-accent',
                      isActive(link.href) && 'bg-accent',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
