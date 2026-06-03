# 🏗️ Baluarte Obra Segura — Engineering Hub

> Plataforma completa de engenharia: base de conhecimento, **130+ calculadoras** e ecossistema de parcerias B2B (Civil, Elétrica, Hidráulica e Mecânica).

[![React](https://img.shields.io/badge/React-19-22d3ee?style=for-the-badge&logo=react&logoColor=white&labelColor=080f17)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=080f17)](https://www.typescriptlang.org)
[![tRPC](https://img.shields.io/badge/tRPC-11-398ccb?style=for-the-badge&logo=trpc&logoColor=white&labelColor=080f17)](https://trpc.io)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848f?style=for-the-badge&logo=electron&logoColor=white&labelColor=080f17)](https://www.electronjs.org)
[![License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=080f17)](#)

---

## ▌ Visão geral

O **Baluarte Obra Segura / Engineering Hub** reúne calculadoras de engenharia, conversores, análises preditivas com IA e funcionalidades enterprise numa só plataforma — web e desktop. São **130+ funções** organizadas em tiers (calculadoras base, utilitários, recursos avançados e chatbots).

> 📖 Lista completa de funcionalidades em **[README_COMPLETE.md](README_COMPLETE.md)**.

## ▌ Tech stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19 · Tailwind CSS 4 · TypeScript · Radix UI · TanStack Query · Framer Motion · Vite |
| **Backend**  | Express 4 · tRPC 11 · Drizzle ORM · MySQL/TiDB |
| **Desktop**  | Electron · Electron Builder |
| **Infra**    | AWS S3 (uploads) · Vitest · Prettier |

## ▌ Estrutura

```
baluarte-obra-segura/
├── client/            # frontend React
├── server/            # backend Express + tRPC
├── electron/          # aplicativo desktop (Electron)
├── drizzle/           # schema e migrations (Drizzle ORM)
├── shared/            # código compartilhado client/server
├── seed-db.mjs        # popular o banco
├── README_COMPLETE.md # documentação completa (130+ funções)
└── DEPLOYMENT.md      # guia de deploy
```

## ▌ Como rodar

```bash
# 1. instalar dependências
pnpm install

# 2. banco de dados (Drizzle: gera e aplica migrations)
pnpm db:push
node seed-db.mjs        # popula o banco (opcional)

# 3. ambiente de desenvolvimento
pnpm dev                # frontend em http://localhost:5173
```

### Produção

```bash
pnpm build              # build do client (Vite) + server (esbuild)
pnpm start
```

### Outros comandos

```bash
pnpm check              # checagem de tipos (tsc)
pnpm test               # testes (Vitest)
pnpm format             # formatação (Prettier)
```

> Detalhes de publicação em **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

<div align="center">

⚔ Parte do **Ecossistema Baluarte**

[![Perfil](https://img.shields.io/badge/GitHub-Lucas--Belucci--Bellini-22d3ee?style=for-the-badge&logo=github&logoColor=white&labelColor=080f17)](https://github.com/Lucas-Belucci-Bellini)

</div>
