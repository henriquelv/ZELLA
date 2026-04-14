-- ZELLA — missões globais iniciais
-- Roda no SQL Editor APÓS schema.sql

insert into missions (title, subtitle, category, icon, xp_reward, coins_reward, active) values
  ('Primeiros passos',       'Registre 3 gastos pra Zella analisar seus padrões', 'habit',    '📝', 100, 20, true),
  ('Detetive financeiro',    'Faça o Quiz Relâmpago 5 vezes',                     'quiz',     '🧠',  80, 15, true),
  ('Fogo constante',          'Atinja uma sequência de 7 dias',                    'streak',   '🔥', 150, 30, true),
  ('Semana leve',             'Zere a categoria "Lazer" por 7 dias',               'spending', '🎯', 200, 40, true),
  ('Triatleta',               'Jogue os 3 mini-jogos no mesmo dia',                'games',    '🎮', 120, 25, true),
  ('Leitor de cupons',        'Use o Scanner IA em 3 recibos',                     'scan',     '📸', 100, 20, true),
  ('Caçador de drenos',       'Identifique 10 drenos no jogo Caça ao Dreno',       'games',    '🕵️',  90, 18, true),
  ('Poupador iniciante',      'Acumule R$ 500 de saldo positivo',                  'saving',   '💰', 250, 50, true),
  ('Diversificado',           'Registre transações em 5 categorias diferentes',    'habit',    '🌈', 110, 22, true),
  ('Madrugador',              'Abra o app 10 dias seguidos antes das 9h',          'habit',    '🌅', 130, 25, true)
on conflict do nothing;
