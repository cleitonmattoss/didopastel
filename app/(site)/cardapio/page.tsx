import type { Metadata } from 'next'
import Link from 'next/link'
import { DemoBadge } from '@/components/demo-notice'
import { ProductCard } from '@/components/site/product-card'
import { getCategories, getProducts, isProductAvailable } from '@/lib/data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Cardápio',
  description: 'Pastéis, coxinhas, enroladinhos, refrigerantes e combos da Di do Pastel.',
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const selected = categories.find((c) => c.id === categoria)
  const visibleCategories = selected ? [selected] : categories

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Cardápio</h1>
          <p className="text-muted-foreground">Escolha seus itens e finalize sem precisar criar conta.</p>
        </div>
        <DemoBadge className="text-muted-foreground">Preços e estoque de demonstração</DemoBadge>
      </div>

      <nav aria-label="Categorias" className="sticky top-[76px] z-30 -mx-4 mb-8 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur">
        <ul className="flex gap-2">
          <li>
            <Link
              href="/cardapio"
              aria-current={!selected ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 items-center rounded-full border-2 border-brand-black px-4 text-sm font-semibold whitespace-nowrap',
                !selected ? 'bg-brand-black text-white' : 'bg-white hover:bg-accent',
              )}
            >
              Tudo
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/cardapio?categoria=${category.id}`}
                aria-current={selected?.id === category.id ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 items-center rounded-full border-2 border-brand-black px-4 text-sm font-semibold whitespace-nowrap',
                  selected?.id === category.id ? 'bg-brand-black text-white' : 'bg-white hover:bg-accent',
                )}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-12">
        {visibleCategories.map((category) => {
          const items = products.filter((p) => p.categoryId === category.id)
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h2 id={`cat-${category.id}`} className="font-display text-3xl">
                {category.name}
              </h2>
              <p className="mb-5 text-muted-foreground">{category.description}</p>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                  Nenhum item nesta categoria no momento.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} available={isProductAvailable(product)} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
