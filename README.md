# Private Couple App

React 19, Vite, CSS Modules, Framer Motion, Recharts, Express, PostgreSQL ve JWT ile hazırlanmış özel responsive couple app.

## Çalıştırma

```bash
pnpm install
pnpm run dev
```

Backend:

```bash
cp .env.example .env
pnpm run server
```

Demo girişleri:

- `admin@couple.local` / `admin123`
- `love@couple.local` / `love123`

PostgreSQL şeması `server/sql/schema.sql` dosyasındadır. `DATABASE_URL` tanımlı değilse backend güvenli local fallback kullanıcılarıyla çalışır; frontend de localStorage destekli demo moduna düşer.
