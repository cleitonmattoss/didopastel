import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Leaf } from 'lucide-react'
import { DemoBadge } from '@/components/demo-notice'
import { ProductConfigurator, type ComboSlot, type FlavorOption } from '@/components/site/product-configurator'
import { getProductById, getProductBySlug, isFlavorAvailable, isProductAvailable } from '@/lib/data'
import { formatBRL } from '@/lib/format'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return product ? { title: product.name, description: product.description } : { title: 'Produto não encontrado' }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const available = isProductAvailable(product)
  const flavors: FlavorOption[] = product.flavors.map((f) => ({
    id: f.id,
    name: f.name,
    available: isFlavorAvailable(product.id, f.id),
  }))

  const comboSlots: ComboSlot[] = (product.components ?? []).flatMap((component) => {
    const componentProduct = getProductById(component.productId)
    if (!componentProduct) return []
    return Array.from({ length: component.quantity }, (_, index) => ({
      key: `${component.productId}-${index}`,
      label: component.quantity > 1 ? `${componentProduct.name} ${index + 1}` : componentProduct.name,
      productName: componentProduct.name,
      flavors: componentProduct.flavors.map((f) => ({
        id: f.id,
        name: f.name,
        available: isFlavorAvailable(componentProduct.id, f.id),
      })),
    }))
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/cardapio" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ChevronLeft className="size-4" aria-hidden="true" /> Voltar ao cardápio
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-brand-black bg-accent shadow-[8px_8px_0_0_var(--brand-black)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className={available ? 'object-cover' : 'object-cover grayscale'}
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl text-balance md:text-5xl">{product.name}</h1>
            <p className="text-lg text-pretty text-muted-foreground">{product.description}</p>
            {product.includesSalad && (
              <p className="inline-flex items-center gap-1.5 font-semibold text-success">
                <Leaf className="size-4" aria-hidden="true" /> Acompanha salada sem custo adicional
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-brand-red">{formatBRL(product.priceCents)}</p>
              <DemoBadge className="text-muted-foreground">preço de demonstração</DemoBadge>
            </div>
          </div>
          {available ? (
            <ProductConfigurator
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                priceCents: product.priceCents,
              }}
              flavors={flavors}
              comboSlots={comboSlots}
            />
          ) : (
            <div className="rounded-2xl border-2 border-dashed p-6 text-center">
              <p className="font-display text-2xl">Esgotado no momento</p>
              <p className="text-muted-foreground">Este item volta assim que o estoque for reposto.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
