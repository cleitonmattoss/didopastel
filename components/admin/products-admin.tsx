'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DemoNotice } from '@/components/demo-notice'
import { Panel, StatusPill, inputClass } from '@/components/admin/admin-ui'
import { formatBRL } from '@/lib/format'
import type { Product } from '@/lib/types'
import { categories } from '@/lib/demo-data'

export function ProductsAdmin({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase())), [products, query])

  return (
    <>
      <DemoNotice className="mb-4">O catálogo abaixo é o mesmo conjunto de produtos usado pelo cardápio e checkout da demonstração.</DemoNotice>
      <Panel title="Catálogo de demonstração" actions={<span className="text-xs text-muted-foreground">{products.length} produtos</span>}>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Pesquisar produtos</span>
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden="true" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome ou descrição" />
          </label>
          <button type="button" disabled className="h-9 rounded-lg bg-zinc-200 px-3 text-sm font-medium text-zinc-500">Novo produto · banco não conectado</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Preço</th><th className="px-4 py-3">Salada opcional</th><th className="px-4 py-3">Disponibilidade</th><th className="px-4 py-3">Edição</th></tr></thead>
            <tbody className="divide-y">
              {filtered.map((product) => <tr key={product.id}>
                <td className="px-4 py-3"><span className="block font-medium">{product.name}</span><span className="text-xs text-muted-foreground">{product.description}</span></td>
                <td className="px-4 py-3">{categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId}</td>
                <td className="px-4 py-3 tabular-nums">{formatBRL(product.priceCents)}</td>
                <td className="px-4 py-3">{product.saladOptionEnabled ? 'Configurada · Não/Sim' : 'Desativada'}</td>
                <td className="px-4 py-3"><StatusPill tone={product.active ? 'success' : 'neutral'}>{product.active ? 'Ativo' : 'Inativo'}</StatusPill></td>
                <td className="px-4 py-3"><button type="button" disabled className="text-xs text-zinc-400" aria-label={`Editar ${product.name}`}>Editar indisponível</button></td>
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum produto encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-3 text-xs text-muted-foreground">A variante “Quer Salada?” está habilitada nos produtos configurados no catálogo demo. A edição não é salva enquanto não houver persistência conectada.</p>
    </>
  )
}
