<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

App\Database::connect()->exec(file_get_contents(__DIR__ . '/schema.sql'));
echo "Tasks table is ready.\n";
