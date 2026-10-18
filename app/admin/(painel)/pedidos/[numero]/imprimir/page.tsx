import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from '@/components/admin/print-button'
import { orders } from '@/lib/demo-data'
import { formatBRL, formatDateTime } from '@/lib/format'
import { ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/labels'

export const metadata = { title: 'Imprimir pedido' }

export default async function PrintOrderPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const order = orders.find((o) => o.number === numero)
  if (!order) notFound()

  return (
    <>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar aos pedidos
        </Link>
        <PrintButton />
      </div>
      <article className="mx-auto w-full max-w-[80mm] bg-white p-4 font-mono text-[13px] leading-snug text-black shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <header className="mb-2 border-b border-dashed border-black pb-2 text-center">
          <p className="text-base font-bold">DI DO PASTEL</p>
          <p>Santaluz - BA</p>
          <p className="mt-1 text-xs">*** DEMONSTRAÇÃO - SEM VALOR FISCAL ***</p>
        </header>
        <p className="text-lg font-bold">PEDIDO #{order.number}</p>
        <p>{formatDateTime(order.createdAt)}</p>
        <p className="font-bold uppercase">{ORDER_TYPE_LABEL[order.type]}{order.tableNumber && ` - MESA ${order.tableNumber}`}</p>
        <p>Cliente: {order.customerName}</p>
        {order.type === 'entrega' && (
          <>
            <p>Tel.: {order.customerPhone}</p>
            <p>End.: {order.address}</p>
          </>
        )}
        <div className="my-2 border-t border-dashed border-black" />
        <ul className="flex flex-col gap-1">
          {order.items.map((i, idx) => (
            <li key={idx}>
              <div className="flex justify-between gap-2">
                <span className="font-bold">{i.quantity}x {i.productName}</span>
                <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
              </div>
              {i.flavorName && <p className="pl-3">Sabor: {i.flavorName}</p>}
              {i.comboSelections?.map((s) => <p key={s} className="pl-3">{s}</p>)}
              {i.notes && <p className="pl-3 font-bold">OBS: {i.notes}</p>}
            </li>
          ))}
        </ul>
        {order.notes && <p className="mt-2 font-bold">OBS. PEDIDO: {order.notes}</p>}
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(order.subtotalCents)}</span></div>
        {order.deliveryFeeCents > 0 && <div className="flex justify-between"><span>Entrega</span><span>{formatBRL(order.deliveryFeeCents)}</span></div>}
        <div className="flex justify-between text-base font-bold"><span>TOTAL</span><span>{formatBRL(order.totalCents)}</span></div>
        <p className="mt-2">Pgto: {PAYMENT_METHOD_LABEL[order.paymentMethod]} ({PAYMENT_STATUS_LABEL[order.paymentStatus]})</p>
      </article>
    </>
  )
}
