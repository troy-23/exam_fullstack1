<?php

declare(strict_types=1);

namespace Tests;

use App\TaskSorter;
use PHPUnit\Framework\TestCase;

final class TaskSorterTest extends TestCase
{
    public function testSortsHighThenMediumThenLowRegardlessOfAge(): void
    {
        $tasks = [
            ['id' => 1, 'priority' => 'low', 'created_at' => '2026-01-01 09:00:00'],
            ['id' => 2, 'priority' => 'high', 'created_at' => '2026-03-01 09:00:00'],
            ['id' => 3, 'priority' => 'medium', 'created_at' => '2026-02-01 09:00:00'],
        ];

        $sorted = (new TaskSorter())->sortTasks($tasks);

        self::assertSame([2, 3, 1], array_column($sorted, 'id'));
        self::assertSame([1, 2, 3], array_column($tasks, 'id'));
    }

    public function testSortsEqualPrioritiesByOldestCreationTime(): void
    {
        $tasks = [
            ['id' => 1, 'priority' => 'high', 'created_at' => '2026-03-02T09:00:00Z'],
            ['id' => 2, 'priority' => 'high', 'created_at' => '2026-03-01T10:00:00+08:00'],
            ['id' => 3, 'priority' => 'high', 'created_at' => '2026-03-01T04:00:00Z'],
        ];

        self::assertSame([2, 3, 1], array_column((new TaskSorter())->sortTasks($tasks), 'id'));
    }

    public function testHandlesEmptyInputAndPreservesTheOrderOfExactTies(): void
    {
        $sorter = new TaskSorter();
        $tasks = [
            ['id' => 2, 'priority' => 'medium', 'created_at' => '2026-01-01T09:00:00Z'],
            ['id' => 1, 'priority' => 'medium', 'created_at' => '2026-01-01T09:00:00Z'],
        ];

        self::assertSame([], $sorter->sortTasks([]));
        self::assertSame($tasks, $sorter->sortTasks($tasks));
    }
}
