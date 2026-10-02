<?php

declare(strict_types=1);

use App\Database;
use App\JsonResponse;
use App\TaskRepository;
use App\TaskValidator;

require dirname(__DIR__) . '/src/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($path === '/api/tasks') {
        if ($method === 'GET') {
            $status = $_GET['status'] ?? null;

            if ($status !== null && !in_array($status, ['pending', 'completed'], true)) {
                JsonResponse::send(['message' => 'Status must be pending or completed.'], 400);
            }

            $repository = new TaskRepository(Database::connect());
            JsonResponse::send(['data' => $repository->list($status), 'statistics' => $repository->statistics()]);
        }

        if ($method === 'POST') {
            if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
                JsonResponse::send(['message' => 'Send the task as application/json.'], 400);
            }

            $body = file_get_contents('php://input', false, null, 0, 65537);

            if (strlen($body) > 65536) {
                JsonResponse::send(['message' => 'The request body is too large.'], 400);
            }

            $input = json_decode($body, false, 512, JSON_THROW_ON_ERROR);

            if (!$input instanceof stdClass) {
                JsonResponse::send(['message' => 'Send a JSON object containing the task fields.'], 400);
            }

            $input = (array) $input;
            $errors = TaskValidator::errors($input);

            if ($errors !== []) {
                JsonResponse::send(['message' => 'Please check the highlighted fields.', 'errors' => $errors], 400);
            }

            $repository = new TaskRepository(Database::connect());
            JsonResponse::send(['data' => $repository->create(TaskValidator::values($input))], 201);
        }

        header('Allow: GET, POST');
        JsonResponse::send(['message' => 'Method not allowed.'], 405);
    }

    if (preg_match('#^/api/tasks/([1-9][0-9]*)(/complete)?$#', $path, $matches) === 1) {
        $id = filter_var($matches[1], FILTER_VALIDATE_INT);
        $completion = isset($matches[2]);

        if ($id === false) {
            JsonResponse::send(['message' => 'Task not found.'], 404);
        }

        if ($completion && $method === 'PATCH') {
            $task = (new TaskRepository(Database::connect()))->complete($id);
            if ($task === null) {
                JsonResponse::send(['message' => 'Task not found.'], 404);
            }

            JsonResponse::send(['data' => $task]);
        }

        if (!$completion && $method === 'DELETE') {
            if (!(new TaskRepository(Database::connect()))->delete($id)) {
                JsonResponse::send(['message' => 'Task not found.'], 404);
            }

            JsonResponse::send(['message' => 'Task deleted.']);
        }

        header('Allow: ' . ($completion ? 'PATCH' : 'DELETE'));
        JsonResponse::send(['message' => 'Method not allowed.'], 405);
    }

    JsonResponse::send(['message' => 'Endpoint not found.'], 404);
} catch (JsonException) {
    JsonResponse::send(['message' => 'The request contains invalid JSON.'], 400);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    JsonResponse::send(['message' => 'Tasks are unavailable right now. Please try again.'], 500);
}
