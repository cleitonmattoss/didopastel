'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bike,
  Boxes,
  ChefHat,
  History,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBasket,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos e preparo', icon: ChefHat },
  { href: '/admin/mesas', label: 'Mesas', icon: UtensilsCrossed },
  { href: '/admin/entregas', label: 'Entregas', icon: Bike },
  { href: '/admin/produtos', label: 'Produtos e categorias', icon: Package },
  { href: '/admin/combos', label: 'Combos', icon: ShoppingBasket },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { href: '/admin/estoque/movimentacoes', label: 'Movimentações', icon: History },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const activeHref = ADMIN_NAV.map((i) => i.href)
    .filter((href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <nav aria-label="Painel">
      <ul className="flex flex-col gap-0.5">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white',
                  active && 'bg-brand-yellow text-brand-black hover:bg-brand-yellow hover:text-brand-black',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
