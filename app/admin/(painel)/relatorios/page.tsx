import { AdminModulePage } from '@/components/admin/admin-module-page'
import { EmptyState, Panel } from '@/components/admin/admin-ui'

export const metadata = { title: 'Relatórios' }

const areas = [
  ['Faturamento', 'Diário, mensal e anual; ticket médio; valores pagos, pendentes, cancelados e reembolsados.'],
  ['Pedidos', 'Totais por entrega, retirada e consumo no local, separados por estado.'],
  ['Produtos', 'Produtos mais vendidos, quantidades e valores atribuídos, respeitando cancelamentos.'],
  ['Ranking de funcionários', 'Atendentes por faturamento e pedidos válidos; motoboys por entregas concluídas.'],
  ['Estoque', 'Saldos, estoque baixo e histórico de movimentações quando persistidos.'],
]

export default function ReportsPage() {
  return <AdminModulePage title="Relatórios" description="Indicadores com filtros por período e critérios transparentes."><div className="mb-4 flex flex-wrap items-center gap-2"><label htmlFor="report-period" className="text-sm font-medium">Período</label><select id="report-period" disabled className="h-9 rounded-lg border bg-zinc-100 px-3 text-sm text-zinc-500"><option>Dia</option><option>Mês</option><option>Ano</option><option>Intervalo de datas</option></select><span className="text-xs text-muted-foreground">Filtros serão ativados com a conexão do banco.</span></div><div className="grid gap-4 lg:grid-cols-2">{areas.map(([title, description]) => <Panel key={title} title={title}><div className="px-4 pt-3 text-sm text-muted-foreground">{description}</div><EmptyState title="Aguardando dados persistidos" description="Sem resultados demonstrativos apresentados como reais." /></Panel>)}</div><p className="mt-4 text-xs text-muted-foreground">Rankings não calculam comissão nem bonificação. Pedidos concluídos não são considerados pagos sem registro de pagamento confirmado.</p></AdminModulePage>
}
