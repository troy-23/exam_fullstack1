<?php

declare(strict_types=1);

namespace App;

final class TaskValidator
{
    public static function errors(array $input): array
    {
        $errors = [];
        $title = $input['title'] ?? null;
        $description = $input['description'] ?? null;
        $priority = $input['priority'] ?? 'medium';

        if (!is_string($title) || preg_match('/\S/u', $title) !== 1) {
            $errors['title'] = 'Title is required.';
        } elseif (mb_strlen(trim($title)) > 255) {
            $errors['title'] = 'Keep the title to 255 characters or fewer.';
        }

        if ($description !== null && (!is_string($description) || mb_strlen($description) > 5000)) {
            $errors['description'] = 'Use a description of 5,000 characters or fewer.';
        }

        if (!in_array($priority, ['low', 'medium', 'high'], true)) {
            $errors['priority'] = 'Choose low, medium, or high priority.';
        }

        return $errors;
    }

    public static function values(array $input): array
    {
        return [
            'title' => trim($input['title']),
            'description' => isset($input['description']) && trim($input['description']) !== ''
                ? trim($input['description']) : null,
            'priority' => $input['priority'] ?? 'medium',
        ];
    }
}
