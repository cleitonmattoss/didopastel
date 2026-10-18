import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bike, Store, UtensilsCrossed } from 'lucide-react'
import { DemoBadge } from '@/components/demo-notice'
import { ProductCard } from '@/components/site/product-card'
import { getCategories, getProducts, isProductAvailable } from '@/lib/data'

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const popular = products.filter((p) => p.popular && p.categoryId !== 'combos')
  const combos = products.filter((p) => p.categoryId === 'combos')

  return (
    <>
      <section className="relative overflow-hidden bg-brand-yellow">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="flex flex-col items-start gap-5">
            <p className="rounded-full bg-brand-black px-3 py-1 text-sm font-semibold text-brand-yellow">Santaluz · Bahia</p>
            <h1 className="font-display text-5xl leading-[0.95] text-balance text-brand-black md:text-7xl">
              Pastel crocante, <span className="text-brand-red">quentinho</span> e do jeito que você gosta.
            </h1>
            <p className="max-w-md text-lg text-pretty text-brand-black/80">
              Pastéis, coxinhas, enroladinhos e combos para pedir com entrega, retirar no balcão ou comer aqui.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/cardapio"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-red px-6 text-base font-bold text-white shadow-[3px_3px_0_0_var(--brand-black)] hover:bg-brand-red/90"
              >
                Ver cardápio <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <Link
                href="/cardapio?categoria=combos"
                className="inline-flex h-12 items-center rounded-full border-2 border-brand-black bg-white px-6 text-base font-bold text-brand-black hover:bg-accent"
              >
                Ver combos
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-brand-black shadow-[8px_8px_0_0_var(--brand-black)]">
            <Image
              src="/images/hero-pasteis.png"
              alt="Pastéis dourados recém-fritos servidos em papel"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <ul className="mx-auto grid max-w-6xl gap-3 px-4 pb-10 sm:grid-cols-3">
          {[
            { icon: Bike, title: 'Entrega', text: 'Receba em casa' },
            { icon: Store, title: 'Retirada', text: 'Pegue no balcão' },
            { icon: UtensilsCrossed, title: 'No local', text: 'Peça da sua mesa' },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
              <span className="grid size-11 place-items-center rounded-full bg-brand-black text-brand-yellow">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categorias" className="mx-auto max-w-6xl px-4 pt-14">
        <h2 id="categorias" className="mb-6 font-display text-3xl md:text-4xl">Escolha a categoria</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/cardapio?categoria=${category.id}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-card p-3 text-center hover:border-brand-black"
              >
                <span className="relative size-24 overflow-hidden rounded-full bg-accent ring-4 ring-brand-yellow">
                  <Image src={category.image} alt="" fill sizes="96px" className="object-cover" />
                </span>
                <span className="font-display text-lg group-hover:text-brand-red">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mais-pedidos" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="mais-pedidos" className="font-display text-3xl md:text-4xl">Mais pedidos</h2>
          <DemoBadge className="text-muted-foreground">Preços de demonstração</DemoBadge>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} available={isProductAvailable(product)} />
          ))}
        </div>
      </section>

      <section aria-labelledby="combos" className="mt-14 bg-brand-black py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="combos" className="font-display text-3xl text-brand-yellow md:text-4xl">Combos para dividir</h2>
              <p className="text-white/70">Junte a turma e economize.</p>
            </div>
            <Link href="/cardapio?categoria=combos" className="font-semibold text-brand-yellow hover:underline">
              Ver todos os combos
            </Link>
          </div>
          <div className="grid gap-6 text-foreground sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((product) => (
              <ProductCard key={product.id} product={product} available={isProductAvailable(product)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
