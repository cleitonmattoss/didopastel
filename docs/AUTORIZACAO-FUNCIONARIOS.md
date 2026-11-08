# Funcionários, permissões e auditoria

## Estado desta etapa

As migrations e os testes ficam versionados em `supabase/`, mas não foram executados contra o projeto remoto nem contra um banco local. Não há `supabase/config.toml`, histórico de migrations ou schema de funcionários neste repositório. Portanto, o schema remoto permanece desconhecido e precisa ser revisado antes de qualquer aplicação.

O painel continua bloqueado em `app/admin/(painel)/layout.tsx`. `lib/supabase/authorization.ts` prepara a leitura de `public.has_staff_permission` com o usuário/cookies da sessão, mas mantém `STAFF_AUTHORIZATION_TESTED = false`; `requireAdminAuthorization(permission)` falha fechado enquanto essa etapa não for validada. Não existe operação administrativa de escrita nas Server Actions atuais. Cada futura Server Action administrativa deverá invocar a proteção com uma permissão específica; o Proxy e a validação de identidade não substituem essa checagem.

## Modelo

- `auth.users` continua sendo a única fonte de autenticação e senhas. O perfil não contém senha nem e-mail duplicado.
- `public.staff_profiles` associa cada usuário a um único `role_key`, estado `is_active` e datas `created_at`/`updated_at`. A chave primária é também FK para `auth.users.id`; exclusão da conta Auth é bloqueada enquanto houver perfil (`ON DELETE RESTRICT`). Para desligamento normal, marque o perfil inativo.
- `public.staff_roles`, `public.staff_permissions` e `public.staff_role_permissions` contêm apenas o catálogo controlado de quatro funções e permissões. Não há políticas nem grants de leitura ou escrita para essas tabelas via Data API.
- `public.staff_audit_log` guarda ator Auth, código da ação, entidade, identificador, metadados JSON e data. Um trigger registra criação, mudança de papel/estado e exclusão de perfil. O ator é `NULL` quando a operação ocorre fora de uma sessão Auth, como no bootstrap pelo SQL Editor.
- Tabelas têm RLS habilitado. Perfis podem ser lidos pelo próprio funcionário e por quem tiver `staff.profile.read`; auditoria só por quem tiver `staff.audit.read`. Nenhum usuário autenticado recebe escrita direta. O bootstrap controlado pelo operador do banco é descrito abaixo.
- Grants e exposição do Data API são camadas separadas. A migration revoga grants amplos e concede apenas leitura de perfil/auditoria a `authenticated`; verifique que `public` está exposto para a RPC `public.has_staff_permission` e mantenha `private` fora dos schemas expostos. Nenhum toggle de exposição foi alterado nesta etapa.
- `private.staff_has_permission` verifica `auth.uid()`, perfil ativo e a relação função/permissão. É `SECURITY DEFINER` por precisar ler tabelas sem abrir essas tabelas ou causar recursão de RLS; tem `search_path` vazio, referências qualificadas, schema não exposto e execução restrita a `authenticated`. `public.has_staff_permission` é apenas wrapper `SECURITY INVOKER`, executável por `authenticated`; não consulta `user_metadata` ou `app_metadata`.
- `staff.profile.manage` não concede escrita direta. Uma futura Server Action/RPC de gestão precisará validar essa permissão e também exigir `staff.role.assign` para qualquer mudança de papel. Desativação e mudança de papel devem ser auditadas pelo trigger.
- A autorização de cada entidade de negócio ainda requer políticas próprias quando essas tabelas forem modeladas. Os códigos `operations.*` são apenas catálogo futuro: não conectam nem liberam produtos, pedidos, preparos, mesas, estoque, entregas ou relatórios.

O trigger de auditoria cobre somente mudanças em `staff_profiles` nesta etapa. Cada futura mutação administrativa persistente em outra entidade deverá adicionar trigger ou caminho de escrita transacional que gere evento de auditoria com ator e entidade; a tabela de auditoria não é gravável diretamente por clientes.

## Matriz inicial proposta

`Sim` significa que a permissão entra no catálogo para a função depois que as migrations forem validadas. Isso não libera as telas ou operações hoje. Motoboy não recebe permissões de entrega até existir vínculo de entregas atribuídas e RLS que restrinja cada linha à atribuição correta.

| Permissão | Proprietário | Gerente | Atendente | Motoboy |
|---|:---:|:---:|:---:|:---:|
| `dashboard.access` | Sim | Sim | Sim | — |
| `staff.profile.read` | Sim | Sim | — | — |
| `staff.profile.manage` | Sim | Sim | — | — |
| `staff.role.assign` | Sim | — | — | — |
| `staff.audit.read` | Sim | Sim | — | — |
| `operations.orders.read/manage` | Sim | Sim | Sim | — |
| `operations.preparations.read/manage` | Sim | Sim | Sim | — |
| `operations.tables.read/manage` | Sim | Sim | Sim | — |
| `operations.deliveries.read/manage` | Sim | Sim | Sim | — |
| `operations.deliveries.read_assigned/manage_assigned` | Sim | — | — | **Ainda não atribuída** |

O proprietário recebe o conjunto completo do catálogo; o gerente não pode atribuir papéis; o atendente não pode administrar funcionários nem consultar auditoria. As permissões de operações são propostas para expansão futura e não concedem acesso a tabelas que ainda não existem. A função de motoboy fica sem autorização de painel até ser possível proteger entregas por atribuição.

## Bootstrap controlado do primeiro proprietário

Não existe proprietário fixo, usuário semeado, signup público ou endpoint de promoção. Depois de revisar o schema remoto e aplicar as migrations **somente no ambiente de desenvolvimento**, o primeiro proprietário deve ser associado a uma conta Auth previamente criada por convite controlado:

1. Um operador autorizado do projeto convida/cria a conta pela administração do Supabase Auth. Confirme a identidade do destinatário por canal independente; não habilite cadastro público.
2. Outro revisor confirma que a referência aponta para a conta correta em Auth Users e aprova a promoção. Use somente o UUID da conta, nunca a senha, publishable key ou chave secreta.
3. Um operador com acesso controlado ao SQL Editor executa, em uma transação revisada, o bloco abaixo após substituir os dois marcadores. Esse caminho é deliberadamente fora da aplicação e não deve virar endpoint.
4. O trigger registra a criação do perfil com ator `NULL`; o segundo evento registra explicitamente a operação de bootstrap e sua referência de aprovação. Confirme ambos no log antes de encerrar a mudança.

```sql
begin;

do $bootstrap$
declare
  target_auth_user_id uuid := '<UUID_DA_CONTA_AUTH_CONFERIDA>'::uuid;
  approval_reference text := '<REFERENCIA_DE_APROVACAO_INTERNA>';
begin
  if approval_reference like '<%' then
    raise exception 'Substitua a referência de aprovação antes de executar';
  end if;

  if not exists (select 1 from auth.users where id = target_auth_user_id) then
    raise exception 'A conta Auth indicada não existe';
  end if;

  if exists (select 1 from public.staff_profiles where user_id = target_auth_user_id) then
    raise exception 'A conta já possui perfil de funcionário';
  end if;

  if exists (select 1 from public.staff_profiles where role_key = 'owner') then
    raise exception 'Já existe perfil de proprietário; interrompa e revise antes de qualquer promoção';
  end if;

  insert into public.staff_profiles (user_id, role_key, is_active)
  values (target_auth_user_id, 'owner', true);

  insert into public.staff_audit_log (
    actor_user_id, action_code, entity_type, entity_id, metadata
  ) values (
    null,
    'staff.owner.bootstrap',
    'staff_profile',
    target_auth_user_id::text,
    jsonb_build_object('approval_reference', approval_reference, 'method', 'controlled_sql_editor')
  );
end;
$bootstrap$;

commit;
```

O SQL acima é documentação, não foi executado. Mantenha o UUID e a referência fora de logs públicos. Se o bloco falhar, faça rollback e investigue; não contorne as verificações nem remova a condição de proprietário existente.

## Aplicar e testar em desenvolvimento

1. Instale uma versão atual do Supabase CLI e Docker, se necessário. O CLI não está instalado neste workspace. As migrations foram nomeadas no formato versionado padrão, mas não foram geradas pelo comando CLI.
2. Antes de qualquer aplicação, um operador deve comparar o schema e o histórico **do projeto de desenvolvimento** com os objetos/nomes usados nestes arquivos. Não use reset em banco remoto nem assuma que ele está vazio. Se existirem objetos homônimos ou grants legados, pare e revise uma migration de adaptação.
3. Inicialize/configure apenas o ambiente Supabase local sem vincular o projeto remoto, inicie a stack local e aplique as migrations locais em ordem. Use `supabase migration up --local` quando o histórico local estiver pronto; `supabase db reset` apaga o banco local e só deve ser usado se essa consequência for aceitável.
4. Habilite pgTAP somente no banco local, se ainda não estiver disponível, e rode `supabase test db` contra a stack local. `supabase/tests/database/staff_authorization_test.sql` verifica chamada anônima, funcionário inativo, atendente sem permissão, metadados forjados, permissão explícita do proprietário e ausência de grants de escrita.
5. Revise o resultado e execute os advisors/lint de segurança disponíveis na versão do CLI instalada. Inspecione grants, policies, funções `SECURITY DEFINER`, triggers e o API schema exposed. A API deve expor `public` para a RPC, mas não deve expor `private`.
6. Só depois de testar a função com os papéis reais no banco local e revisar as permissões por rota/Server Action, planeje uma etapa separada para remover o bloqueio do painel. A aplicação de qualquer migration em Supabase remoto exige uma decisão posterior explícita e revisão do schema desse ambiente.

Não afirme que RLS ou migrations passaram em banco real: nesta etapa não foram aplicadas nem testadas em banco algum.

O arquivo pgTAP cria apenas identidades artificiais dentro da transação de teste e termina com `ROLLBACK`; esses fixtures nunca são seed de aplicação ou bootstrap de proprietário.
