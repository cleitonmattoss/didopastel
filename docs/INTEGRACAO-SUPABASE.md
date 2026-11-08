# Integração local com Supabase

## Ambiente

Copie `.env.example` para `.env.local` e preencha os valores do projeto no painel do Supabase, em **Connect / API Keys**:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key.

`.env.local` está ignorado pelo Git. Não use `service_role` ou secret key em variáveis `NEXT_PUBLIC_*` ou no navegador. Os clientes desta etapa usam apenas URL e publishable key.

## Clientes, login e cookies

`lib/supabase/client.ts` cria o cliente para Client Components. `lib/supabase/server.ts` cria o cliente para Server Components, Server Actions e Route Handlers e conecta os cookies do Next.js. O `proxy.ts` atualiza tokens expirados quando as variáveis Supabase estão configuradas. Sem configuração, o painel permanece fechado e os fluxos públicos continuam disponíveis.

`/admin/entrar` aceita e-mail e senha via `signInWithPassword`; não há formulário nem ação de cadastro. `signOut` encerra a sessão Supabase e o código remove o cookie legado `admin_demo_session`. O Proxy valida os claims da sessão para impedir que uma sessão ausente ou inválida alcance as rotas do painel. O layout protegido valida novamente a identidade no servidor.

## Autorização administrativa

O modelo persistente, as permissões, o procedimento do primeiro proprietário e o roteiro de aplicação/teste local estão em [`docs/AUTORIZACAO-FUNCIONARIOS.md`](./AUTORIZACAO-FUNCIONARIOS.md). As migrations versionadas estão em `supabase/migrations/`; não foram aplicadas. A camada de consulta `hasStaffPermission()` e `requireAdminAuthorization(permission)` está preparada, mas `STAFF_AUTHORIZATION_TESTED` permanece `false` e o layout administrativo continua sempre bloqueado. Identidade Auth sem vínculo ativo/permissão não concede acesso.

O banco remoto não foi consultado. Revise o schema existente do ambiente de desenvolvimento antes de qualquer aplicação futura; não suponha que esteja vazio. Nenhum produto, pedido, estoque, mesa, entrega ou relatório foi conectado ao banco. O fluxo público de catálogo, checkout e pedidos e os dados demonstrativos de operações continuam fora do painel. O cookie legado de demonstração não concede acesso, inclusive em ambientes públicos ou de produção.
