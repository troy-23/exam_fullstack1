<?php

declare(strict_types=1);

namespace Tests;

use App\TaskValidator;
use PHPUnit\Framework\TestCase;

final class TaskValidatorTest extends TestCase
{
    public function testRejectsBlankAndNonStringTitles(): void
    {
        foreach (['', " \t\n", "\u{00A0}", null, [], 42] as $title) {
            self::assertArrayHasKey('title', TaskValidator::errors(['title' => $title]));
        }
    }

    public function testRejectsInvalidPriorityAndOversizedFields(): void
    {
        $errors = TaskValidator::errors([
            'title' => str_repeat('a', 256),
            'description' => str_repeat('a', 5001),
            'priority' => 'urgent',
        ]);

        self::assertSame(['title', 'description', 'priority'], array_keys($errors));
    }

    public function testNormalizesValidInputAndDefaultsPriority(): void
    {
        $input = ['title' => '  Read the brief  ', 'description' => '  '];

        self::assertSame([], TaskValidator::errors($input));
        self::assertSame(
            ['title' => 'Read the brief', 'description' => null, 'priority' => 'medium'],
            TaskValidator::values($input),
        );
    }
}
