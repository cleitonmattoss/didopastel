import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-black text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo className="block h-auto w-[200px] max-w-full" tone="dark" />
          <p className="text-sm text-white/70">Pastelaria em Santaluz, Bahia.</p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="mb-3 font-display text-lg text-brand-yellow">Navegação</h2>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li><Link className="hover:text-white hover:underline" href="/cardapio">Cardápio</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/carrinho">Carrinho</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/pedido">Acompanhar pedido</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/admin">Área da equipe</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 font-display text-lg text-brand-yellow">Contato</h2>
          <p className="text-sm text-white/70">
            Endereço, telefone e horários oficiais serão publicados pela pastelaria em breve.
          </p>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        Versão de demonstração — preços, estoques e horários exibidos são fictícios.
      </p>
    </footer>
  )
}
