import { Panel, PageHeader, StatusPill } from '@/components/admin/admin-ui'
import { DemoNotice } from '@/components/demo-notice'
import { categories, products } from '@/lib/demo-data'

export const metadata = { title: 'Categorias' }

export default function CategoriesPage() {
  return <><PageHeader title="Categorias" description="Categorias ordenadas do mesmo catálogo usado pelo cardápio." /><DemoNotice className="mb-5">Dados de demonstração. Criar, editar, reordenar ou desativar categorias requer banco conectado.</DemoNotice><Panel title="Categorias demo"><div className="divide-y">{[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((category) => <div key={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3"><span className="min-w-0 flex-1 font-medium">{category.name}<span className="ml-2 text-xs text-muted-foreground">{products.filter((product) => product.categoryId === category.id).length} produtos vinculados</span></span><StatusPill tone="success">Ativa (demo)</StatusPill><span className="text-xs text-muted-foreground">Ordem {category.sortOrder}</span></div>)}</div></Panel></>
}
