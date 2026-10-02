<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

$database = App\Database::connect();

$tasks = [
    [
        'Learn Laravel fundamentals',
        'Review routing, controllers, validation, Eloquent, and migrations.',
        'high',
        'pending',
        12,
    ],
    [
        'Build the Task API',
        'Implement GET, POST, PATCH complete, and DELETE endpoints.',
        'high',
        'pending',
        11,
    ],
    [
        'Write PHPUnit tests',
        'Test priority sorting and secondary date sorting.',
        'high',
        'completed',
        10,
    ],
    [
        'Learn Figma components',
        'Practice components, variants, auto layout, and variables.',
        'medium',
        'pending',
        9,
    ],
    [
        'Design task tracker UI',
        'Create a responsive task list and form layout.',
        'medium',
        'completed',
        8,
    ],
    [
        'Review API validation',
        'Verify required title and valid priority/status values.',
        'high',
        'pending',
        7,
    ],
    [
        'Make coffee',
        'Take a short break before continuing the implementation.',
        'low',
        'completed',
        6,
    ],
    [
        'Review database schema',
        'Check task fields, timestamps, indexes, and constraints.',
        'medium',
        'completed',
        5,
    ],
    [
        'Test task filtering',
        'Verify All, Pending, and Completed filters.',
        'medium',
        'pending',
        4,
    ],
    [
        'Improve responsive layout',
        'Test the task tracker on desktop, tablet, and mobile.',
        'medium',
        'pending',
        3,
    ],
    [
        'Update README',
        'Document setup instructions and AI disclosure.',
        'high',
        'pending',
        2,
    ],
    [
        'Review final Git diff',
        'Check for unused files, debugging code, and unrelated changes.',
        'high',
        'pending',
        1,
    ],
];
$existingTask = $database->prepare('SELECT id FROM tasks WHERE title = ? LIMIT 1');
$statement = $database->prepare(
    'INSERT INTO tasks (title, description, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
);
$added = 0;

$database->beginTransaction();

try {
    foreach ($tasks as [$title, $description, $priority, $status, $daysAgo]) {
        $existingTask->execute([$title]);
        if ($existingTask->fetchColumn() !== false) {
            continue;
        }

        $createdAt = gmdate('Y-m-d H:i:s', strtotime("-{$daysAgo} days"));
        $updatedAt = $status === 'completed' ? gmdate('Y-m-d H:i:s') : $createdAt;
        $statement->execute([$title, $description, $priority, $status, $createdAt, $updatedAt]);
        $added++;
    }

    $database->commit();
} catch (Throwable $exception) {
    $database->rollBack();
    throw $exception;
}

echo "Added {$added} sample tasks; existing titles were skipped.\n";
