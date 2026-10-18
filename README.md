# Cashing

A polished, offline-first personal budget tracker for iOS and Android. Track income and
expenses, set monthly and category budgets, and understand your spending with calculated
insights. All financial data is stored locally on device in SQLite — nothing leaves your phone.

## Stack

| Area         | Choice                                                           |
| ------------ | ---------------------------------------------------------------- |
| Framework    | Expo SDK 54                                                      |
| Runtime      | React Native 0.81, React 19, Hermes, New Architecture            |
| Language     | TypeScript 5.9 (strict)                                          |
| Navigation   | Expo Router v6 (typed routes)                                    |
| Styling      | NativeWind v4 + Tailwind CSS 3 (design tokens via CSS variables) |
| Client state | Zustand v5 (persisted via MMKV)                                  |
| Async/data   | TanStack Query v5 over a local SQLite repository                 |
| Forms        | React Hook Form + Zod                                            |
| Database     | expo-sqlite (WAL, migrations, indexes)                           |
| Preferences  | react-native-mmkv (with graceful fallback)                       |
| Secrets      | expo-secure-store                                                |
| Icons        | lucide-react-native                                              |

## Getting started

```bash
npm install

# Start the dev server (choose a target in the Expo CLI)
npm run start

# Native targets (requires a development build; see note below)
npm run ios
npm run android
```

> **Development build required.** This app uses libraries with native code
> (expo-sqlite, react-native-mmkv, expo-secure-store, reanimated). Those are not in
> the stock Expo Go sandbox, so run a development build:
>
> ```bash
> npx expo run:ios      # or: npx expo run:android   (local, needs Xcode/Android Studio)
> # or build in the cloud:
> npx eas-cli@latest build --profile development
> ```

## Quality checks

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # expo lint
npm run test        # jest (unit tests)
```

## Project structure

```
src/
  app/                     Expo Router routes (screens + navigators only)
    _layout.tsx            Providers: SafeArea, QueryClient, DB init, theme
    (tabs)/                Bottom-tab navigator
      index.tsx            Dashboard
      transactions.tsx     Activity list (filter + search)
      budgets.tsx          Budgets overview
      analytics.tsx        Insights (donut, trend, category breakdown)
      settings.tsx         Currency, theme, data management
    transactions/
      new.tsx              Add transaction (modal)
      [id].tsx             Detail / edit / delete
    budgets/
      edit.tsx             Create/edit budget (modal)
  components/
    ui/                    Primitives (AppText, Button, Card, TextField, states, ...)
    charts/                DonutChart, TrendBars, CategoryBarList
    transactions/          CategoryBadge, TransactionRow, CategorySelector
    budgets/               BudgetProgressCard
    dashboard/             BalanceCard, QuickActions
  features/
    transactions/          TransactionForm (shared by new + edit)
  db/
    client.ts              Open + migrate SQLite
    migrations/            Versioned schema (user_version)
    repositories/          Typed CRUD for transactions + budgets
  stores/                  Zustand settings store (persisted)
  hooks/                   TanStack Query hooks, money, theme
  lib/                     query client, MMKV storage, secure store
  schemas/                 Zod form schemas
  utils/                   money, date, finance calculations (pure, tested)
  types/                   Domain types
  constants/               Categories, currencies
```

## Data model & persistence

Financial records live in **SQLite** (`cashing.db`), the single source of truth.

- `transactions`: `id, type, amount, description, category_id, date, payment_method, notes, created_at, updated_at`
  - Indexed on `date`, `type`, `category_id`.
- `budgets`: `id, category_id, limit_amount, period, created_at, updated_at`
  - `category_id = NULL` means the overall monthly budget.
  - Unique index on `(period, category)` keeps budgets singular per scope.

Migrations run on first open, keyed by `PRAGMA user_version`. Foreign keys and WAL
journaling are enabled. Multi-write migrations run inside a transaction.

**Money is stored as integer minor units** (e.g. centavos) to avoid floating-point drift;
formatting to a decimal string happens only at the display boundary.

Preferences (theme, currency) persist via MMKV through a Zustand `persist` middleware,
with an in-memory fallback so the app and tests never crash where MMKV's native module
is unavailable. SecureStore is wired for future sensitive values; financial data is never
duplicated across storage systems.

## Financial logic

- Balance = total income − total expenses, derived from the ledger.
- Budget spent = sum of applicable expenses in the period (all expenses for the overall
  budget; one category for category budgets). Remaining = limit − spent.
- Category totals, trends, and analytics are all computed from stored transactions.
- Editing or deleting a transaction invalidates the relevant queries so every dependent
  number recalculates immediately.

## Scope

No bank integrations, automatic sync, or real money movement in this version by design.

## Known limitations / next steps

- Date entry uses quick chips (Today/Yesterday) plus a validated `YYYY-MM-DD` field; a
  native calendar picker (`@react-native-community/datetimepicker`) is a natural follow-up.
- Web export is not supported because `expo-sqlite` requires a WASM asset not bundled by
  `expo export --platform web`. The app targets iOS/Android. Enabling web would require
  wiring the wa-sqlite WASM build into Metro.
- Analytics covers a rolling 6-month window; configurable ranges and CSV export are future work.
- No authentication/app-lock yet; SecureStore is in place to add a PIN later.

```

```
