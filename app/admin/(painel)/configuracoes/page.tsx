import { AdminModulePage } from '@/components/admin/admin-module-page'
import { Panel } from '@/components/admin/admin-ui'

export const metadata = { title: 'Configurações' }

export default function SettingsPage() {
  return <AdminModulePage title="Configurações" description="Estrutura para dados da empresa, operação e preferências administrativas."><Panel title="Configurações da operação"><div className="grid gap-4 p-4 sm:grid-cols-2"><label className="text-sm">Nome da empresa<input disabled value="Não configurado" className="mt-1 h-10 w-full rounded-lg border bg-zinc-100 px-3 text-muted-foreground" /></label><label className="text-sm">Preferências administrativas<input disabled value="Banco não conectado" className="mt-1 h-10 w-full rounded-lg border bg-zinc-100 px-3 text-muted-foreground" /></label><p className="text-xs text-muted-foreground sm:col-span-2">Campos apenas estruturais. Nenhuma configuração foi salva. Alterações críticas dependerão de autorização no servidor.</p></div></Panel></AdminModulePage>
}
