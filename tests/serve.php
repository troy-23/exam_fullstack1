<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

$database = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: '';

if (!str_ends_with($database, '_test')) {
    fwrite(STDERR, "Browser tests require a database name ending in _test.\n");
    exit(1);
}

App\Database::connect()->exec(file_get_contents(dirname(__DIR__) . '/database/schema.sql'));
passthru(escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:8001 -t public public/router.php', $exitCode);
exit($exitCode);
