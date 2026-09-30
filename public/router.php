<?php

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api' || str_starts_with($path, '/api/')) {
    require __DIR__ . '/index.php';
    return;
}

$file = realpath(__DIR__ . $path);
$build = realpath(__DIR__ . '/build');

if ($file !== false && $build !== false && str_starts_with($file, $build . DIRECTORY_SEPARATOR) && is_file($file)) {
    return false;
}

if (in_array($path, ['/', '/build/', '/build'], true)) {
    if (is_file(__DIR__ . '/build/index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile(__DIR__ . '/build/index.html');
    } else {
        http_response_code(503);
        echo 'Build the frontend with npm run build, or use the Vite development server on port 5173/build/.';
    }

    return;
}

http_response_code(404);
echo 'Page not found.';
