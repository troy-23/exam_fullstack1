# Verification

The user story is: create a task in React, persist it through PHP in MySQL, reload and filter it, complete it, then confirm deletion and see updated statistics.

Local result: **6 PHPUnit tests (14 assertions) and 15 Playwright tests passed**. Type checking, linting, formatting, and the production build also passed. The three sorter tests live in the exact path requested by the brief.

## Checks

| Boundary                   | Evidence                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PHP sorting and validation | PHPUnit tests exercise priority, chronological order, timezone offsets, ties, empty input, whitespace, types, and field lengths. |
| API to MySQL               | Playwright request tests use the real API and an isolated MySQL test database.                                                   |
| Response to UI             | Browser tests create, reload, filter, complete, and delete a task.                                                               |
| Failure feedback           | Controlled network responses verify loading, empty states, retry, and preservation of a failed form draft.                       |
| Mobile layouts             | Width tests cover 320, 375, 390, 414, 768, 1024, and 1280px, including a long unbroken title and the confirmation dialog.        |
| Accessibility              | Native form labels and controls, keyboard dialog cancellation/focus restoration, and axe WCAG A/AA scans.                        |
| Static checks              | PHP_CodeSniffer PSR-12, TypeScript, ESLint, Prettier, and a production Vite build.                                               |

## Scope and limits

The UI/UX refinement adds checks for at least 44px button/radio hit areas at all seven widths, 200% text sizing at 375px, landscape at 812×375, and reduced-motion progress behavior. The 15 browser tests passed after the design changes. PHP logic was unchanged in that pass; its six-test result is from the earlier implementation verification.

Tests run locally against PHP 8.5.11 and MySQL 8.4.11. Browser coverage uses Chromium, not physical phones or every browser engine. Automated accessibility checks are a useful baseline, not a full manual screen-reader audit. This small application has no authentication and is not intended to be publicly exposed as a private multi-user task service.

The optional seed is separate from schema setup. Test data lives in a database ending in `_test`; test-created records are cleaned up without clearing the user's task database. Network mocks are restricted to tests explicitly exercising failure/loading states.

GitHub Actions is configured to reproduce the checks using a MySQL service. A local run does not establish that the remote workflow has run; verify its result after pushing.
