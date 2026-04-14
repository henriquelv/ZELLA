# Supabase — setup do ZELLA

Execute estes 3 passos UMA ÚNICA VEZ para fazer o app funcionar em produção.

## 1. Rodar o schema principal

Abra o Supabase Dashboard → **SQL Editor** → **New Query** → cole o conteúdo de [`schema.sql`](./schema.sql) → **Run**.

Isso cria as tabelas `profiles`, `transactions`, `missions`, `user_missions`, a view `leaderboard_view`, as políticas RLS e o trigger que cria o profile quando um novo usuário se cadastra.

## 2. Popular as missões globais

No mesmo SQL Editor → **New Query** → cole o conteúdo de [`seed-missions.sql`](./seed-missions.sql) → **Run**.

Isso insere 10 missões que aparecem na aba Missões do app.

## 3. Habilitar sign-in anônimo

**Passo crítico** — sem isso o app não consegue autenticar sozinho:

1. No Supabase Dashboard → **Authentication** → **Providers**.
2. Encontre **"Anonymous"** na lista.
3. Clique → **Enable** → Save.

Pronto. O app chama `supabase.auth.signInAnonymously()` no splash screen e o usuário ganha um UUID automático. A partir daí, todas as sincronizações funcionam.

---

## Verificar que funcionou

1. Abra o app (`npm run dev`).
2. Abra o DevTools → **Network**.
3. Na primeira carga, você deve ver um `POST` para `.../auth/v1/signup?grant_type=anonymous` retornando 200.
4. No Supabase Dashboard → **Table Editor** → `profiles` — deve aparecer uma nova row com o `id` do auth.
5. Adicione uma transação no app. Volte pro Table Editor → `transactions` — deve estar lá.

## Re-rodar o schema

O `schema.sql` é idempotente (`create table if not exists`, `drop policy if exists`). Pode rodar de novo sem quebrar dados existentes.

## Reset total (dev)

Se quiser zerar tudo em dev:

```sql
drop table if exists user_missions cascade;
drop table if exists transactions cascade;
drop table if exists missions cascade;
drop table if exists profiles cascade;
drop view if exists leaderboard_view cascade;
```

Depois rode `schema.sql` e `seed-missions.sql` de novo.
