# VIDA PARALELA

Aplicativo para organizar a vida, comparar possibilidades e apoiar decisões com mais clareza.

## Tecnologias
- Next.js 15 + TypeScript
- Supabase (PostgreSQL, autenticação e Row Level Security)
- Preparado para futura integração com IA e Capacitor

## Requisitos
Node.js 20.9 ou superior.

## Instalação
```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## Supabase
1. Crie um projeto em https://supabase.com.
2. Copie a Project URL e a chave anon/public para .env.local.
3. Execute o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase.

Variáveis:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- AI_PROVIDER_API_KEY (reservada para integração no servidor; não configurar no navegador)

## Estado atual
Esta é a primeira estrutura visual e de banco de dados. O painel contém dados demonstrativos. Login, gravação de dados, simulador com IA, notificações e pagamentos ainda precisam ser implementados.

## Segurança
- Nunca publique .env.local ou chaves privadas.
- As tabelas possuem políticas RLS para separar os dados por usuário.
- A ativação de Premium/teste deve ser controlada por backend seguro e webhooks.

## Próximas etapas
1. Autenticação e perfil.
2. CRUD de metas, decisões, tarefas e transações.
3. Simulador A/B/C com IA e avisos de incerteza.
4. Assinaturas, teste grátis e limites de uso.
5. PWA e empacotamento Android/iOS com Capacitor.
