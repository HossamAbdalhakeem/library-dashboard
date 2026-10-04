---
name: test-dashboard
description: >-
  Sign in as each library-dashboard role and verify business rules in the
  browser: stock, sales, reservations, delivery, refunds, and exchanges.
  Also check responsive layout and light mode on the screens under test.
  Use when the user asks to test the app, a role, a business flow, responsive
  layout, or light mode.
---

# Test the library dashboard

Dev server: `npm run dev` → http://localhost:8000
Arabic RTL. Reuse a server that is already on port 8000.
Log out before switching roles so the token in localStorage is replaced.
These flows change real stock and money. Record the numbers before and after. Stop if available quantity is 0.

Leave the Cursor browser tab open so the user can watch. Do not start a second browser session.

## Accounts

| Role | Home | Email | Password |
|---|---|---|---|
| ADMIN | /home | admin@library.local | Password123! |
| BRANCH_EMPLOYEE | /sales/direct | employee2@library.local | 123123 |
| CUSTOMER_SERVICE | /books/reserve | cs2@library.local | 123123 |

Login URL: /login

## Who can open what

- ADMIN: every route.
- BRANCH_EMPLOYEE: `/sales/direct`, `/reservations` (booking only), `/reservations/deliver`, `/reports/branch`, `/attendance`.
- CUSTOMER_SERVICE: `/books/reserve`, `/reports/customer-service`. Attendance is not in this role.
- ADMIN attendance management is `/attendance/manage`. `/attendance` redirects admins there.

After login, confirm the home above. Open one forbidden route for that role and confirm the app does not stay there.

## Stock words

On a branch inventory row:

- الكمية الفعلية = `physicalQuantity` (copies on the shelf)
- المحجوز = `reservedQuantity`
- المتاح = `availableQuantity` = physical − reserved (never below 0)

Read these three numbers for the same branch and product before the action, then again after it.

## Rules that must hold

**Direct sale** (`/sales/direct`, branch employee or admin)

- Quantity is at least 1 and cannot exceed المتاح للبيع.
- Selling N copies: physical − N, available − N, reserved unchanged.
- Total = unit price × quantity.
- كاش needs no proof image. محفظة إلكترونية and انستا باي require a proof image.
- Sale status becomes مكتمل.

**Reservation** (`/books/reserve` for customer service, `/reservations` for branch employee)

- Reservation quantity is always 1.
- Customer service must choose a branch before products appear.
- Deposit cannot exceed the product price. المتبقي = price − المقدم.
- Reserving: physical unchanged, reserved + 1, available − 1.
- Status is جاهز when stock was available, or بانتظار المخزون when it was not.
- Cancelling a reservation that is not delivered: reserved − 1, available + 1, physical unchanged. If المقدم > 0, that amount is refunded.

**Delivery** (`/reservations/deliver`)

- The list shows جاهز and بانتظار المخزون only.
- Only جاهز can be delivered.
- Delivering: physical − 1, reserved − 1, available unchanged (it was already reduced at booking). Status becomes تم التسليم.

**Refund** (`/sales/exchange`, admin)

- Refund quantity is from 1 up to the remaining sold quantity.
- Refunding N: physical + N, available + N.
- Partial refund → مسترد جزئيًا. Full refund → تم الاسترداد.

**Exchange** (`/sales/exchange`, admin)

- Replacement product must have available ≥ exchanged quantity.
- Old product: stock returns by the exchanged quantity. New product: physical − N, available − N.
- Higher price: collect the difference. Lower price: refund the difference. Same price: no money moves.

**Warehouse** (admin, branch stock)

- إضافة للمخزن of N: physical + N, available + N.
- سحب من المخزن cannot exceed available. physical − N, available − N.

## Responsive and light mode

Run this on every screen you open for the business check, including its add, edit, preview, and confirm dialogs. Do it in the same browser tab. Theme toggle is in the dashboard header.

**Light mode** (html has no `app-dark`)

- Page title, card titles, amounts, badges, and empty states are readable. Fail if text is white or near-white on a light surface, or dark on a dark surface.
- Empty product cards, role chips (such as موظف فرع), report heroes, and refund totals use the light surface, not a leftover dark fill.
- Dialog header, body, and footer follow the dialog corner radius. Cards inside the dialog keep their own radius.

**Dark mode** (html has `app-dark`)

- Switch back and recheck the same screen. Text and fills stay readable. Do not leave the app in light mode if it started in dark mode.

**Responsive**

Check two widths in the same tab: about 390px (phone) and at least 1280px (desktop).

- The page does not scroll sideways. Tables may scroll inside their own area.
- Add, edit, and preview drawers and dialogs stay inside the viewport. Content scrolls inside the popup. Footer buttons wrap or stack.
- Timeline and detail cards use the full width next to the marker on a phone. Dates and Arabic lines do not break mid-word.
- Toasts sit above the header, stay inside the screen, and show the full message.

Fail a check when a control is clipped, overflows the viewport, or cannot be read. Record width and theme with the pass or fail.

## How to run

1. Sign in as the role that owns the flow.
2. Write down physical, reserved, and available for that product and branch.
3. Do one action with quantity 1 (or a deposit smaller than the price). Prefer كاش.
4. Reopen the same inventory row and check the rule above. Also check the success dialog: student, product, quantity, amounts.
5. On that screen and its open dialogs, run the responsive and light mode checks above.
6. Sign out and repeat for the other roles only for flows they are allowed to run.

If the user names one screen, test that screen plus the stock or money rule it changes, then the responsive and light mode checks for that screen. If they say "test the project", run sale, reservation, and delivery once each, then confirm customer service cannot open `/sales/direct` and the branch employee cannot open `/reservations/manage`. Include responsive and light mode on those three flows.

Stop immediately when the user says stop, or when they press Stop. Do not submit another sale, reservation, refund, or stock change after that.

Report each check as pass or fail with the before and after numbers. For layout checks, name the screen, width, and theme. If login or the API blocks you, stop and say which account failed.
