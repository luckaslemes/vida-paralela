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

## Supabase conectado
O projeto Supabase VIDA PARALELA já foi criado e o schema inicial foi aplicado. As 11 tabelas estão ativas com RLS habilitado.

1. Copie `.env.example` para `.env.local` no ambiente em que executar o app.
2. A configuração pública do projeto já está preenchida no `.env.example`.
3. Nunca publique `.env.local`, senha do banco ou chave secret/service_role.

Variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou a variável antiga `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `AI_PROVIDER_API_KEY` (reservada para integração no servidor; não configurar no navegador)

## Autenticação
A rota `/login` oferece cadastro por e-mail e senha, entrada e solicitação de redefinição de senha. O cadastro pode exigir confirmação por e-mail conforme a configuração de autenticação do projeto.

## Estado atual
O banco está criado e conectado ao código. O painel ainda contém dados demonstrativos. O fluxo de autenticação foi implementado no frontend, mas precisa ser executado e testado no ambiente de hospedagem com as variáveis configuradas e URLs de redirecionamento autorizadas no Supabase. Metas, decisões, tarefas, transações, simulador com IA, notificações e pagamentos ainda serão implementados.

## Segurança
- Nunca coloque chaves secretas em variáveis `NEXT_PUBLIC_`.
- As tabelas privadas possuem políticas RLS para separar os dados por usuário.
- Premium e teste grátis devem ser controlados por backend seguro e webhooks.

## Próximas etapas
1. Configurar URLs de autenticação e testar cadastro/login.
2. Criar perfil e proteger as páginas internas.
3. Implementar gravação de metas, decisões, tarefas e transações.
4. Criar simulador A/B/C com IA e avisos de incerteza.
5. Assinaturas, teste grátis e limites de uso.
6. PWA e empacotamento Android/iOS com Capacitor.
