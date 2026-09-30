<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

$database = App\Database::connect();

if ((int) $database->query('SELECT COUNT(*) FROM tasks')->fetchColumn() > 0) {
    echo "Seed skipped: the task list already contains data.\n";
    exit;
}

$tasks = [
    ['Plan the week ahead', 'Pick three things that would make this week a good one.', 'high', 'pending', 5],
    ['Review the homepage designs', 'Check the mobile layouts and leave feedback for the team.', 'high', 'pending', 4],
    ['Send the project update', 'Share progress, open questions, and next steps.', 'medium', 'pending', 3],
    ['Organize project notes', 'Bring the useful links and decisions together in one place.', 'medium', 'pending', 2],
    ['Make time for a little learning', 'Read that article you saved for later.', 'low', 'pending', 1],
    ['Set up the workspace', 'A fresh start, with everything in its place.', 'low', 'completed', 6],
];
$statement = $database->prepare(
    'INSERT INTO tasks (title, description, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
);

$database->beginTransaction();

foreach ($tasks as [$title, $description, $priority, $status, $daysAgo]) {
    $createdAt = gmdate('Y-m-d H:i:s', strtotime("-{$daysAgo} days"));
    $statement->execute([$title, $description, $priority, $status, $createdAt, $createdAt]);
}

$database->commit();
echo "Added six sample tasks.\n";
