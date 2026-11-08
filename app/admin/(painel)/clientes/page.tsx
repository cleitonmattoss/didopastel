import { AdminModulePage } from '@/components/admin/admin-module-page'
import { NotConnectedState } from '@/components/admin/admin-module-page'

export const metadata = { title: 'Clientes' }

export default function ClientsPage() {
  return <AdminModulePage title="Clientes" description="Pesquisa e consulta de clientes associados a pedidos."><NotConnectedState title="Nenhum cliente persistido" /></AdminModulePage>
}
