<?php

declare(strict_types=1);

namespace App;

use DateTimeImmutable;

final class TaskSorter
{
    /** @param array<array{priority: string, created_at: string}> $tasks */
    public function sortTasks(array $tasks): array
    {
        $priorityOrder = ['high' => 0, 'medium' => 1, 'low' => 2];

        usort($tasks, static function (array $first, array $second) use ($priorityOrder): int {
            $priorityComparison = $priorityOrder[$first['priority']] <=> $priorityOrder[$second['priority']];

            if ($priorityComparison !== 0) {
                return $priorityComparison;
            }

            return new DateTimeImmutable($first['created_at']) <=> new DateTimeImmutable($second['created_at']);
        });

        return $tasks;
    }
}
