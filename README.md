# 💈 Barbearia

Sistema simples de agendamento para barbearia, com clientes, barbeiros, serviços e agendamentos.

## Tecnologias

- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React, Vite

## Estrutura

```
barbearia/
├── backend/    # API REST
└── frontend/   # Interface web
```

## Como rodar

**Pré-requisitos:** Node.js e um banco PostgreSQL.

### 1. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` em `backend/`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/barbearia"
JWT_SECRET="troque-por-um-segredo-longo-e-aleatorio"
```

Para gerar um `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

(há um modelo em `backend/.env.example`)

Depois, crie as tabelas e inicie a API:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

A API roda em `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. Na primeira vez, clique em **Criar conta** para cadastrar um usuário e entrar.

## Autenticação e segurança

- **Criptografia de senha:** as senhas são guardadas como hash **bcrypt** (com salt, 12 rodadas) na tabela `usuarios`. A senha original nunca é salva.
- **Autenticação:** `POST /auth/login` confere e-mail e senha. Todas as rotas da API, exceto `/`, `/auth/registro`, `/auth/login` e `/auth/logout`, exigem login (resposta `401` caso contrário).
- **Cookies:** ao entrar, a API cria um token JWT e o envia em um cookie `token` com `HttpOnly` (o JavaScript do navegador não lê), `SameSite=Lax` e `Secure` quando `NODE_ENV=production`. A sessão dura 8 horas. `POST /auth/logout` apaga o cookie.

| Rota | Descrição |
| ---- | --------- |
| `POST /auth/registro` | Cria usuário (`nome`, `email`, `senha` com 6+ caracteres) e já inicia a sessão |
| `POST /auth/login` | Entra com `email` e `senha` |
| `POST /auth/logout` | Encerra a sessão |
| `GET /auth/me` | Retorna o usuário logado |

## Rotas da API

| Recurso        | Rotas                                              |
| -------------- | -------------------------------------------------- |
| `/clientes`    | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/barbeiros`   | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/servicos`    | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` (desativa o serviço) |
| `/agendamentos`| `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/status`      | `GET` (lista os status disponíveis) |

O status do agendamento fica em uma tabela própria (`status`), ligada por chave estrangeira (`statusId`). Valores iniciais, criados pela migration: `PENDENTE`, `CONFIRMADO`, `CONCLUIDO` e `CANCELADO`. Para mudar o status de um agendamento, envie `{ "statusId": <id> }` no `PUT /agendamentos/:id`.

## Funcionalidades

- Cadastro e edição de clientes, barbeiros e serviços
- Criação de agendamentos com validação de data futura
- Controle de status dos agendamentos, com filtro por status