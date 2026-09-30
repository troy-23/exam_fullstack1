<?php

declare(strict_types=1);

namespace App;

final class JsonResponse
{
    public static function send(array $body, int $status = 200): never
    {
        http_response_code($status);
        echo json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        exit;
    }
}
