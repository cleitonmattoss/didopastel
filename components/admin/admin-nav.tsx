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
  ChevronDown,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos e preparo', icon: ChefHat },
  { href: '/admin/mesas', label: 'Mesas', icon: UtensilsCrossed },
  { href: '/admin/entregas', label: 'Entregas', icon: Bike },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Boxes },
  { href: '/admin/combos', label: 'Combos', icon: ShoppingBasket },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { href: '/admin/movimentacoes', label: 'Movimentações', icon: History },
  { href: '/admin/funcionarios/gerentes', label: 'Gerentes', icon: Users },
  { href: '/admin/funcionarios/atendentes', label: 'Atendentes', icon: Users },
  { href: '/admin/funcionarios/motoboys', label: 'Motoboys', icon: Bike },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const activeHref = ADMIN_NAV.map((i) => i.href)
    .filter((href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)))
    .sort((a, b) => b.length - a.length)[0]
  const [productsOpen, setProductsOpen] = useState(() => pathname.startsWith('/admin/produtos') || pathname.startsWith('/admin/categorias') || pathname.startsWith('/admin/combos') || pathname.startsWith('/admin/estoque') || pathname.startsWith('/admin/movimentacoes'))
  const [staffOpen, setStaffOpen] = useState(() => pathname.startsWith('/admin/funcionarios'))

  function navLink(href: string, label: string, Icon: (typeof ADMIN_NAV)[number]['icon'], nested = false) {
    const active = href === activeHref
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white',
          nested && 'ml-3 h-9 text-[13px]',
          active && 'bg-brand-yellow text-brand-black hover:bg-brand-yellow hover:text-brand-black',
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    )
  }

  return (
    <nav aria-label="Painel">
      <ul className="flex flex-col gap-0.5">
        {ADMIN_NAV.slice(0, 4).map(({ href, label, icon }) => <li key={href}>{navLink(href, label, icon)}</li>)}
        <li>
          <button type="button" aria-expanded={productsOpen} onClick={() => setProductsOpen((open) => !open)} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white">
            <Package className="size-4" aria-hidden="true" /> Produtos
            <ChevronDown className={cn('ml-auto size-4 transition-transform', productsOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {productsOpen && <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-white/15 ml-5 pl-1">{ADMIN_NAV.slice(4, 9).map(({ href, label, icon }) => <li key={href}>{navLink(href, label, icon, true)}</li>)}</ul>}
        </li>
        <li>
          <button type="button" aria-expanded={staffOpen} onClick={() => setStaffOpen((open) => !open)} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white">
            <Users className="size-4" aria-hidden="true" /> Funcionários
            <ChevronDown className={cn('ml-auto size-4 transition-transform', staffOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {staffOpen && <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-white/15 ml-5 pl-1">{ADMIN_NAV.slice(9, 12).map(({ href, label, icon }) => <li key={href}>{navLink(href, label, icon, true)}</li>)}</ul>}
        </li>
        {ADMIN_NAV.slice(12).map(({ href, label, icon }) => <li key={href}>{navLink(href, label, icon)}</li>)}
      </ul>
    </nav>
  )
}
