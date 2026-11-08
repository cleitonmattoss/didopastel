import { AdminModulePage } from '@/components/admin/admin-module-page'
import { EmptyState, Panel, StatusPill } from '@/components/admin/admin-ui'

const staffInfo = {
  gerentes: {
    title: 'Gerentes',
    description: 'Contas individuais e permissões administrativas explícitas.',
    note: 'Gerentes não poderão elevar as próprias permissões. Configurações críticas e promoção de funções ficam reservadas ao proprietário autorizado.',
    measures: ['Nome', 'Contato operacional', 'Situação da conta', 'Data de cadastro', 'Histórico de atividade'],
  },
  atendentes: {
    title: 'Atendentes',
    description: 'Gestão de atendentes e indicadores vinculados às vendas atribuídas.',
    note: 'Pedidos cancelados ficam fora das vendas válidas. Conclusão de pedido não será tratada como confirmação de pagamento.',
    measures: ['Vendas atribuídas', 'Faturamento válido', 'Pedidos válidos', 'Ticket médio', 'Período selecionado'],
  },
  motoboys: {
    title: 'Motoboys',
    description: 'Gestão de motoboys e histórico das entregas atribuídas.',
    note: 'Atribuição e conclusão precisam de histórico persistido. Entregas canceladas, falhas e em andamento não contam como concluídas.',
    measures: ['Entregas atribuídas', 'Concluídas', 'Canceladas', 'Com falha', 'Em andamento'],
  },
} as const

export function StaffAdminPage({ kind }: { kind: keyof typeof staffInfo }) {
  const info = staffInfo[kind]
  return <AdminModulePage title={info.title} description={info.description}>
    <div className="grid gap-5">
      <Panel title="Funcionários"><div className="flex flex-col gap-3 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><StatusPill tone="warning">Contas individuais ainda não conectadas</StatusPill><button type="button" disabled className="h-9 rounded-lg bg-zinc-200 px-3 text-sm text-zinc-500">Cadastrar indisponível</button></div><EmptyState title="Nenhum funcionário persistido" description="A listagem não usa dados fictícios. Cadastro, edição, ativação e desativação exigem autenticação e autorização no servidor." /></div></Panel>
      <Panel title={kind === 'gerentes' ? 'Permissões previstas' : kind === 'atendentes' ? 'Desempenho previsto' : 'Indicadores previstos'}><div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{info.measures.map((measure) => <div key={measure} className="rounded-lg border bg-zinc-50 p-3"><p className="text-sm font-medium">{measure}</p><p className="mt-1 text-xs text-muted-foreground">Disponível após conexão do banco</p></div>)}</div><p className="px-4 pb-4 text-sm text-muted-foreground">{info.note}</p></Panel>
      {kind !== 'gerentes' && <Panel title="Ranking" actions={<select aria-label="Período do ranking" disabled className="h-9 rounded-lg border bg-zinc-100 px-2 text-xs text-zinc-500"><option>Dia</option><option>Mês</option><option>Ano</option><option>Intervalo de datas</option></select>}><p className="px-4 pt-3 text-xs text-muted-foreground">{kind === 'atendentes' ? 'Atendentes: faturamento atribuído a vendas válidas; pedidos cancelados excluídos. Pedidos concluídos não equivalem a pedidos pagos. Reembolsos, pagamentos parciais e descontos aguardam regra persistida.' : 'Motoboys: classificação por entregas concluídas registradas; atribuições, andamento, cancelamentos e falhas são métricas separadas.'}</p><EmptyState title="Ranking indisponível sem dados persistidos" description="Nenhuma posição ou métrica fictícia é apresentada como resultado real. O filtro ficará disponível quando os dados forem persistidos." /></Panel>}
      <Panel title="Histórico de atividade"><EmptyState title="Auditoria ainda não conectada" description="As ações relevantes serão associadas à identidade autenticada e registradas em histórico protegido contra alterações comuns." /></Panel>
    </div>
  </AdminModulePage>
}
