# Frontend — Barbearia

React + Vite. Consome a API Express do diretório `backend/`.

## Rodando

```bash
# terminal 1 — API (porta 3000)
cd backend && npm run dev

# terminal 2 — frontend (porta 5173)
cd frontend && npm install && npm run dev
```

Abra http://localhost:5173. O Vite redireciona `/api/*` para `http://localhost:3000/*`,
então não precisa configurar CORS em desenvolvimento.

Para apontar para outra API (produção), crie `.env` com `VITE_API_URL=https://sua-api.com`
(nesse caso, habilite o `cors` no backend).
