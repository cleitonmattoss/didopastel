import { Panel, PageHeader } from '@/components/admin/admin-ui'
import { DemoNotice } from '@/components/demo-notice'
import { products } from '@/lib/demo-data'
import { formatBRL } from '@/lib/format'

export const metadata = { title: 'Combos' }

export default function CombosPage() {
  const combos = products.filter((product) => product.components?.length)
  return <><PageHeader title="Combos" description="Composição e preço dos combos do catálogo demo." /><DemoNotice className="mb-5">A composição vem dos produtos do catálogo único. Não são feitas baixas de estoque nesta página.</DemoNotice><Panel title="Combos de demonstração"><div className="divide-y">{combos.map((combo) => <article key={combo.id} className="p-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{combo.name}</h2><span className="font-semibold tabular-nums">{formatBRL(combo.priceCents)}</span></div><p className="mt-1 text-sm text-muted-foreground">{combo.description}</p><ul className="mt-3 flex flex-wrap gap-2">{combo.components?.map((component) => { const product = products.find((item) => item.id === component.productId); return <li key={component.productId} className="rounded-full bg-zinc-100 px-3 py-1 text-xs">{component.quantity}× {product?.name ?? component.productId}</li> })}</ul></article>)}</div></Panel></>
}
