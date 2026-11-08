import { DemoNotice } from '@/components/demo-notice'
import { EmptyState, PageHeader, Panel } from '@/components/admin/admin-ui'

export function AdminModulePage({
  title,
  description,
  children,
  emptyTitle = 'Nenhum dado conectado',
  emptyDescription = 'Esta área depende de persistência e autorização no servidor. Nenhuma alteração será apresentada como salva.',
}: {
  title: string
  description: string
  children?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <DemoNotice title="Demonstração local — sem banco conectado" className="mb-5">
        Esta página ainda não grava nem carrega dados persistentes. As ações de gestão ficam indisponíveis até a integração segura.
      </DemoNotice>
      {children ?? (
        <Panel>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </Panel>
      )}
    </>
  )
}

export function NotConnectedState({ title = 'Dados ainda não conectados' }: { title?: string }) {
  return (
    <Panel>
      <EmptyState title={title} description="Sem registros persistidos para exibir. Nenhum dado fictício foi usado como resultado real." />
    </Panel>
  )
}
