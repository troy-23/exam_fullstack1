# Simple Task Tracker

## Setup on another device

Requirements: Git, PHP 8.3+ (`pdo_mysql`, `mbstring`, `dom`, `xml`, `xmlwriter`), Composer 2, MySQL 8.0+, and Node.js 22.12+. Add the command-line tools to PATH and start the MySQL server.

1. Clone the repository and install dependencies:

   ```sh
   git clone https://github.com/troy-23/exam_fullstack1.git
   cd exam_fullstack1
   composer install
   npm ci
   ```

2. Connect to MySQL as an administrator (`mysql -u root -p` or a database GUI) and run the SQL below. Replace `your-password` with your own password:

   ```sql
   CREATE DATABASE task_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'task_tracker'@'127.0.0.1' IDENTIFIED BY 'your-password';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX
       ON task_tracker.* TO 'task_tracker'@'127.0.0.1';
   ```

3. Create the local configuration:

   ```sh
   php -r "copy('.env.example', '.env');"
   ```

   In `.env`, set `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=task_tracker`, `DB_USERNAME=task_tracker`, and your chosen `DB_PASSWORD`. Adjust the port if your MySQL setup uses a different one. The `.env` file is excluded from Git.

4. Create the table, build the frontend, and start the app:

   ```sh
   composer db:setup
   npm run build
   composer serve
   ```

   Open **http://127.0.0.1:8000**. Keep the terminal open while using the app.

## AI Disclosure

- **Tool:** OpenAI Codex.
- **Scope:** AI generated or assisted with much of the initial PHP sorter/API/database schema, React UI/CSS, tests, configuration, and documentation.
- **Reviews and fixes:** AI-assisted work included fixes for dependency compatibility, validation, contrast, keyboard focus, responsive layouts, and the test environment. Checks included PHPUnit, PSR-12, TypeScript, linting, and API/browser tests. The UI and documentation were also simplified.

These reviews and checks were AI-assisted. No completed personal code review by the candidate is claimed.
