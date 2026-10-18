/**
 * Camada de acesso a dados.
 * PONTO DE INTEGRAÇÃO: hoje lê lib/demo-data.ts. Na próxima etapa, cada função passa a consultar
 * o Supabase (mantendo as mesmas assinaturas), para que as páginas não precisem mudar.
 */
import { categories, products, stock, storeSettings } from './demo-data'
import type { Product, StockItem } from './types'

export function availableQuantity(item: StockItem) {
  return Math.max(0, item.quantity - item.reserved)
}

export function getStockFor(productId: string, flavorId: string | null, source: StockItem[] = stock) {
  return source.find((s) => s.productId === productId && s.flavorId === flavorId)
}

export function isFlavorAvailable(productId: string, flavorId: string | null, source: StockItem[] = stock) {
  const item = getStockFor(productId, flavorId, source)
  return item ? availableQuantity(item) > 0 : false
}

/** Combos não têm estoque próprio: ficam disponíveis apenas se todos os componentes tiverem saldo. */
export function isProductAvailable(product: Product, source: StockItem[] = stock): boolean {
  if (!product.active) return false
  if (product.components?.length) {
    return product.components.every((component) => {
      const componentProduct = products.find((p) => p.id === component.productId)
      return componentProduct ? isProductAvailable(componentProduct, source) : false
    })
  }
  if (product.flavors.length === 0) return isFlavorAvailable(product.id, null, source)
  return product.flavors.some((flavor) => isFlavorAvailable(product.id, flavor.id, source))
}

export async function getCategories() {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getProducts() {
  return products.filter((p) => p.active)
}

export async function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug && p.active) ?? null
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null
}

export async function getStoreSettings() {
  return storeSettings
}
