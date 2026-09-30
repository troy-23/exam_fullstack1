<?php

declare(strict_types=1);

namespace App;

use PDO;

final class Database
{
    public static function connect(): PDO
    {
        $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
        $name = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'task_tracker';
        $username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'task_tracker';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';

        $connection = new PDO(
            "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ],
        );
        $connection->exec("SET time_zone = '+00:00'");

        return $connection;
    }
}
