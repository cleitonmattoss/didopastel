import { Panel, PageHeader } from '@/components/admin/admin-ui'
import { DemoNotice } from '@/components/demo-notice'
import { productLabel } from '@/lib/admin'
import { stockMovements } from '@/lib/demo-data'
import { formatDateTime } from '@/lib/format'
import { STOCK_MOVEMENT_LABEL } from '@/lib/labels'

export const metadata = { title: 'Movimentações' }

export default function MovementsPage() {
  return <><PageHeader title="Movimentações" description="Histórico demonstrativo de entradas, saídas, reservas e ajustes." /><DemoNotice title="Histórico fictício" className="mb-5">Não é possível criar movimentações sem persistência. A idempotência e o responsável autenticado precisarão ser validados no servidor.</DemoNotice><Panel title="Movimentações de demonstração"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-zinc-50 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Quantidade</th><th className="px-4 py-3">Motivo</th><th className="px-4 py-3">Responsável</th></tr></thead><tbody className="divide-y">{[...stockMovements].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((movement) => { const item = productLabel(movement.productId, movement.flavorId); return <tr key={movement.id}><td className="px-4 py-3 whitespace-nowrap">{formatDateTime(movement.createdAt)}</td><td className="px-4 py-3">{item.productName}{item.flavorName ? ` · ${item.flavorName}` : ''}</td><td className="px-4 py-3">{STOCK_MOVEMENT_LABEL[movement.type]}</td><td className="px-4 py-3 tabular-nums">{movement.quantity}</td><td className="px-4 py-3">{movement.reason}</td><td className="px-4 py-3">{movement.user}</td></tr>})}</tbody></table></div></Panel></>
}
