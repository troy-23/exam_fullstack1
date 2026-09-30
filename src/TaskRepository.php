<?php

declare(strict_types=1);

namespace App;

use PDO;

final class TaskRepository
{
    public function __construct(private readonly PDO $connection)
    {
    }

    public function list(?string $status): array
    {
        $query = 'SELECT * FROM tasks';
        $parameters = [];

        if ($status !== null) {
            $query .= ' WHERE status = :status';
            $parameters['status'] = $status;
        }

        $statement = $this->connection->prepare($query . ' ORDER BY id ASC');
        $statement->execute($parameters);

        return (new TaskSorter())->sortTasks(array_map($this->serialize(...), $statement->fetchAll()));
    }

    public function statistics(): array
    {
        $statement = $this->connection->query(
            "SELECT COUNT(*) AS total,
                COALESCE(SUM(status = 'pending'), 0) AS pending,
                COALESCE(SUM(status = 'completed'), 0) AS completed FROM tasks",
        );

        return array_map('intval', $statement->fetch());
    }

    public function create(array $task): array
    {
        $statement = $this->connection->prepare(
            'INSERT INTO tasks (title, description, priority) VALUES (:title, :description, :priority)',
        );
        $statement->execute($task);

        return $this->find((int) $this->connection->lastInsertId());
    }

    public function complete(int $id): ?array
    {
        $statement = $this->connection->prepare(
            "UPDATE tasks SET status = 'completed', updated_at = UTC_TIMESTAMP()
             WHERE id = :id AND status = 'pending'",
        );
        $statement->execute(['id' => $id]);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->connection->prepare('DELETE FROM tasks WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() === 1;
    }

    private function find(int $id): ?array
    {
        $statement = $this->connection->prepare('SELECT * FROM tasks WHERE id = :id');
        $statement->execute(['id' => $id]);
        $task = $statement->fetch();

        return $task === false ? null : $this->serialize($task);
    }

    private function serialize(array $task): array
    {
        $task['id'] = (int) $task['id'];
        $task['created_at'] = str_replace(' ', 'T', $task['created_at']) . 'Z';
        $task['updated_at'] = str_replace(' ', 'T', $task['updated_at']) . 'Z';

        return $task;
    }
}
