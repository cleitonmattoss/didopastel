import { Panel, PageHeader, StatusPill } from '@/components/admin/admin-ui'
import { DemoNotice } from '@/components/demo-notice'
import { productLabel, stockLevel } from '@/lib/admin'
import { stock } from '@/lib/demo-data'

export const metadata = { title: 'Estoque' }

export default function StockPage() {
  return <><PageHeader title="Estoque" description="Consulta de saldo e indicador de estoque baixo." /><DemoNotice title="Saldos fictícios de demonstração" className="mb-5">Estes números não representam estoque real. Esta tela não registra saídas nem altera disponibilidade.</DemoNotice><Panel title="Saldo de demonstração"><div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left text-sm"><thead className="bg-zinc-50 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Produto / sabor</th><th className="px-4 py-3">Saldo</th><th className="px-4 py-3">Reservado</th><th className="px-4 py-3">Disponível</th><th className="px-4 py-3">Nível</th></tr></thead><tbody className="divide-y">{stock.map((item) => { const level = stockLevel(item); const name = productLabel(item.productId, item.flavorId); return <tr key={`${item.productId}-${item.flavorId}`}><td className="px-4 py-3">{name.productName}{name.flavorName ? ` · ${name.flavorName}` : ''}</td><td className="px-4 py-3 tabular-nums">{item.quantity}</td><td className="px-4 py-3 tabular-nums">{item.reserved}</td><td className="px-4 py-3 tabular-nums">{Math.max(0, item.quantity - item.reserved)}</td><td className="px-4 py-3"><StatusPill tone={level.tone}>{level.label}</StatusPill></td></tr>})}</tbody></table></div></Panel></>
}
