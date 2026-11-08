import { PageHeader } from '@/components/admin/admin-ui'
import { ProductsAdmin } from '@/components/admin/products-admin'
import { DemoNotice } from '@/components/demo-notice'
import { products } from '@/lib/demo-data'

export const metadata = { title: 'Produtos' }

export default function ProductsPage() {
  return <><PageHeader title="Produtos" description="Catálogo único compartilhado com o cardápio e checkout." /><DemoNotice className="mb-5">A lista usa produtos fictícios do catálogo da demonstração. Alterações ainda não são persistidas.</DemoNotice><ProductsAdmin products={products} /></>
}
