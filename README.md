# Simple Task Tracker

Responsive task tracker gamit ang **React, TypeScript, Vanilla PHP, at MySQL**. May create, priority sorting, status filters, complete/delete actions, at basic statistics.

## Requirements

PHP 8.3+ (`pdo_mysql`, `mbstring`, `dom`, `xml`, `xmlwriter`), Composer 2, MySQL 8.0+, at Node.js 22.12+.

## Local setup

1. I-install ang dependencies:

   ```sh
   composer install
   npm ci
   ```

2. Sa MySQL administrator connection, gumawa ng database at user:

   ```sql
   CREATE DATABASE task_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'task_tracker'@'127.0.0.1' IDENTIFIED BY 'your-password';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX
       ON task_tracker.* TO 'task_tracker'@'127.0.0.1';
   ```

3. Kopyahin ang `.env.example` bilang `.env` (`Copy-Item .env.example .env` sa PowerShell). Itakda ang `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, at `DB_PASSWORD` ayon sa ginawa mong MySQL setup. Default port: 3306. Huwag isama ang `.env` sa Git.

4. Gumawa ng table, i-build, at patakbuhin:

   ```sh
   composer db:setup
   npm run build
   composer serve
   ```

   Buksan ang **http://127.0.0.1:8000**. Optional: `composer db:seed` para sa sample tasks kapag walang laman ang database.

Para sa frontend development, patakbuhin din ang `npm run dev` at buksan ang http://127.0.0.1:5173/build/. Kailangang tumatakbo ang PHP server. Kung hindi makita ang PHP/Composer, idagdag ang mga ito sa PATH.

## API

| Method | Endpoint                    | Result                                 |
| ------ | --------------------------- | -------------------------------------- |
| GET    | `/api/tasks`                | 200; sorted tasks at global statistics |
| GET    | `/api/tasks?status=pending` | 200; puwede rin ang `completed`        |
| POST   | `/api/tasks`                | 201; bagong pending task               |
| PATCH  | `/api/tasks/{id}/complete`  | 200; mark completed                    |
| DELETE | `/api/tasks/{id}`           | 200; delete task                       |

POST body: `{"title":"Review requirements","description":"Optional notes","priority":"high"}`. Gumamit ng `Content-Type: application/json`.

Required ang nonblank title (max 255 characters). Optional ang description (max 5,000); default priority: medium. Invalid input: **400**; missing task/route: **404**; unsupported method: **405**.

## Tests

```sh
composer test
composer lint
npm run lint
npm run format:check
npm run build
```

May **3 sorter tests** sa `tests/TaskSorterTest.php` para sa priority, date order, at empty input/ties; may 3 karagdagang validation tests.

Para sa API/browser tests, gumawa ng `task_tracker_test` database na may parehong user permissions. Pagkatapos: `npx playwright install chromium`, `npm run build`, at `npm run test:e2e`. Gumagamit ito ng hiwalay na database at PHP server sa port 8001. Kung wala ang PHP sa PATH, itakda ang `PHP_BINARY` sa executable path.

## AI Disclosure

- **Tool:** OpenAI Codex.
- **Saklaw:** Malaking bahagi ng initial PHP sorter/API/schema, React UI/CSS, tests, configuration, at documentation ay generated o assisted ng AI.
- **Review at fixes:** Sa AI-assisted development, inayos ang dependency compatibility, validation, contrast, keyboard focus, responsive layout, at test environment. Sinuri gamit ang PHPUnit, PSR-12, TypeScript, lint, at API/browser tests. Pinasimple rin ang UI at documentation bago submission.

Ang mga check na ito ay AI-assisted. Kailangang personal na aralin at maipaliwanag ng candidate ang code; walang personal review na inaangking tapos na.
