# Simple Task Tracker

## Setup sa ibang device

Kailangan: Git, PHP 8.3+ (`pdo_mysql`, `mbstring`, `dom`, `xml`, `xmlwriter`), Composer 2, MySQL 8.0+, at Node.js 22.12+. Ilagay ang command-line tools sa PATH at simulan ang MySQL server.

1. I-clone ang repository at i-install ang dependencies:

   ```sh
   git clone https://github.com/troy-23/exam_fullstack1.git
   cd exam_fullstack1
   composer install
   npm ci
   ```

2. Sa MySQL administrator connection (`mysql -u root -p` o database GUI), patakbuhin ang SQL sa ibaba. Palitan ang `your-password` ng sariling password:

   ```sql
   CREATE DATABASE task_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'task_tracker'@'127.0.0.1' IDENTIFIED BY 'your-password';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX
       ON task_tracker.* TO 'task_tracker'@'127.0.0.1';
   ```

3. Gumawa ng local configuration:

   ```sh
   php -r "copy('.env.example', '.env');"
   ```

   Sa `.env`, itakda ang `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=task_tracker`, `DB_USERNAME=task_tracker`, at ang napili mong `DB_PASSWORD`. Baguhin ang port kung iba ang MySQL setup mo. Hindi kasama sa Git ang `.env`.

4. Gumawa ng table, i-build ang frontend, at patakbuhin ang app:

   ```sh
   composer db:setup
   npm run build
   composer serve
   ```

   Buksan ang **http://127.0.0.1:8000**. Panatilihing bukas ang terminal habang ginagamit ang app.

## AI Disclosure

- **Tool:** OpenAI Codex.
- **Saklaw:** Malaking bahagi ng initial PHP sorter/API/schema, React UI/CSS, tests, configuration, at documentation ay generated o assisted ng AI.
- **Review at fixes:** Sa AI-assisted development, inayos ang dependency compatibility, validation, contrast, keyboard focus, responsive layout, at test environment. Sinuri gamit ang PHPUnit, PSR-12, TypeScript, lint, at API/browser tests. Pinasimple rin ang UI at documentation.

Ang mga review/checks na ito ay AI-assisted; walang personal review ng candidate na inaangking tapos na.
