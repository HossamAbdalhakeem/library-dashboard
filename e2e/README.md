# Playwright E2E — commerce + role flows

Automated coverage for commerce stories and **ADMIN** / **CUSTOMER_SERVICE** / **BRANCH_EMPLOYEE** role journeys.

## Prerequisites

1. NestJS API running (`NUXT_ENV_BASE_URL`, default `http://localhost:3000`)
2. Nuxt app on port **8000** (Playwright starts `npm run dev` unless `E2E_SKIP_WEBSERVER=1`)
3. Seeded role users + passwords in `.env` / `.env.local` (see root `.env.example`)

```bash
E2E_ADMIN_EMAIL=admin@library.local
E2E_ADMIN_PASSWORD=Password123!
E2E_EMPLOYEE_EMAIL=employee1@library.local
E2E_EMPLOYEE_PASSWORD=Password123!
E2E_EMPLOYEE2_EMAIL=employee2@library.local   # optional — EMP-E2E-03 cross-branch
E2E_EMPLOYEE2_PASSWORD=Password123!
E2E_CS_EMAIL=cs@library.local
E2E_CS_PASSWORD=Password123!
E2E_STUDENT_SEARCH=01020000009
E2E_PRODUCT_SEARCH=كتاب الدراسات
E2E_SKIP_WEBSERVER=1
```

## Commands

```bash
npm run test:e2e                              # all (headless)
npm run test:e2e:headed                       # visible browser
npm run test:e2e:watch                        # visible + slowMo 1000ms
npm run test:e2e:ui                           # Playwright UI mode
npm run test:e2e -- e2e/stories               # L-section stories only
npm run test:e2e -- e2e/commerce             # H/I/J/K returns · exchanges · inventory · payments
npm run test:e2e -- e2e/admin-ops.spec.ts
npm run test:e2e -- e2e/admin-reports.spec.ts
npm run test:e2e:watch -- e2e/admin-ops.spec.ts e2e/admin-reports.spec.ts
npm run test:e2e -- e2e/customer-service.spec.ts
npm run test:e2e -- e2e/branch-employee.spec.ts
```

CI (`.github/workflows/playwright.yml`) runs auth + stories + commerce + **admin** + CS + branch-employee when secrets are configured.
## Checklist → specs

| ID | Spec |
|---|---|
| Login / homes | `e2e/auth/login.spec.ts` |
| **ADMIN ops** (ADM0–ADM11, ADM-E2E-01…05, 07) | `e2e/admin-ops.spec.ts` |
| **ADMIN reports** (RPT0–RPT7, ADM-E2E-06) | `e2e/admin-reports.spec.ts` |
| **CUSTOMER_SERVICE** (A0–A7) | `e2e/customer-service.spec.ts` |
| **BRANCH_EMPLOYEE** (B0–B10) | `e2e/branch-employee.spec.ts` |
| **E2E-01** Happy reservation | `e2e/stories/e2e-01-happy-reservation.spec.ts` |
| **E2E-02** Waitlist | `e2e/stories/e2e-02-waitlist.spec.ts` |
| **E2E-03** Cancel path | `e2e/stories/e2e-03-cancel-path.spec.ts` |
| **E2E-04** Change product | `e2e/stories/e2e-04-change-product.spec.ts` |
| **E2E-05** Price change | `e2e/stories/e2e-05-price-change.spec.ts` |
| **E2E-06** Direct sale returns | `e2e/stories/e2e-06-direct-sale-returns.spec.ts` |
| **E2E-07** Exchange chain | `e2e/stories/e2e-07-exchange-chain.spec.ts` |
| **E2E-08** Reserved vs walk-in | `e2e/stories/e2e-08-reserved-vs-walkin.spec.ts` |
| **E2E-09** Role matrix | `e2e/stories/e2e-09-role-matrix.spec.ts` |
| A/G smoke (R-01/05/06, S-01/03/04/09, R-09/10) | `e2e/commerce/create-and-sales.spec.ts` |
| **H** Returns (T-02/03/04/05/12) | `e2e/commerce/returns.spec.ts` |
| **I** Exchanges (X-01/02/06/10/11) | `e2e/commerce/exchanges.spec.ts` |
| **J** Inventory (I-01/02/04/05) | `e2e/commerce/inventory.spec.ts` |
| **K** Payments & reports (P-01…P-05) | `e2e/commerce/payments-reports.spec.ts` |

## Role access (frontend allowlist)

| Route | Admin | CS | Employee |
|---|---|---|---|
| `/home` | ✅ | ❌ | ❌ |
| `/students` | ✅ | ✅ | ✅ |
| `/users` `/expenses` `/branches` `/products` | ✅ | ❌ | ❌ |
| `/reservations/manage` | ✅ | ❌ | ❌ |
| `/sales/exchange` | ✅ | ❌ | ✅ |
| `/reports` (admin analytics) | ✅ | ❌ | ❌ |
| `/reports/daily` → `/reports/branch` (Admin) | ✅† | → CS | → branch |
| `/books/reserve` | nav-hidden† | ✅ | ❌ |
| `/reservations` | nav-hidden† | ❌ | ✅ |
| `/reservations/deliver` | nav-hidden† | ❌ | ✅ |
| `/sales/direct` | nav-hidden† | ❌ | ✅ |
| `/reports/customer-service` | nav-hidden† | ✅ | ❌ |
| `/reports/branch` | deep-link / daily† | ❌ | ✅ |

† Admin `canAccessPath` currently returns `true` for all paths; commerce create / branch+CS report items are **omitted from Admin nav**. Middleware does not redirect Admin away from deep-links (see `e2e-09`). Cancel / change-product / stock mutate remain Admin-only on the API.

## Admin suite notes

- Prerequisites for manage/returns/reports often use **Employee/CS API fixtures**, then switch to Admin UI.
- `/reports` stacks admin sections (`/reports/admin/*`). General KPIs / recent ops live on `/home` (`/reports/general/*`).
- `/reports/daily` for Admin **redirects** to `/reports/branch` (ops + timelines).
- Timeline parity (RPT6): entity `GET /reservations|sales/:id/timeline` vs branch student-ops timeline when available.
- WALLET/INSTAPAY proof fixture: `e2e/fixtures/payment-proof.png`.
- Session tokens are **cached per role** to avoid API login rate limits.
