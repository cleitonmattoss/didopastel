import Image from 'next/image'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ProductCard({ product, available }: { product: Product; available: boolean }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand-black bg-card shadow-[4px_4px_0_0_var(--brand-black)] transition-transform',
        available ? 'hover:-translate-y-0.5' : 'opacity-75',
      )}
    >
      <div className="relative aspect-[4/3] bg-accent">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn('object-cover', !available && 'grayscale')}
        />
        {!available && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-black px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
            Esgotado
          </span>
        )}
        {available && product.popular && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-black">
            Mais pedido
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl leading-tight">
          <Link href={`/produto/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        {product.includesSalad && (
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-success">
            <Leaf className="size-3.5" aria-hidden="true" /> Salada inclusa sem custo
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-brand-red">{formatBRL(product.priceCents)}</span>
          <span
            aria-hidden="true"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-semibold',
              available ? 'bg-brand-red text-white group-hover:bg-brand-red/90' : 'bg-muted text-muted-foreground',
            )}
          >
            {available ? 'Escolher' : 'Indisponível'}
          </span>
        </div>
      </div>
    </article>
  )
}
