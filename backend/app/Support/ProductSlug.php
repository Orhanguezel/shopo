<?php

namespace App\Support;

use Illuminate\Support\Str;

class ProductSlug
{
    public static function normalize(?string $value): string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return '';
        }

        $value = rawurldecode($value);
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = strtr($value, [
            'İ' => 'I',
            'I' => 'I',
            'ı' => 'i',
            'Ş' => 'S',
            'ş' => 's',
            'Ğ' => 'G',
            'ğ' => 'g',
            'Ü' => 'U',
            'ü' => 'u',
            'Ö' => 'O',
            'ö' => 'o',
            'Ç' => 'C',
            'ç' => 'c',
        ]);

        return Str::slug($value);
    }

    public static function candidates(?string $value): array
    {
        $value = trim((string) $value);

        if ($value === '') {
            return [];
        }

        return collect([
            Str::lower($value),
            Str::lower(rawurldecode($value)),
            self::normalize($value),
            Str::slug(Str::ascii(rawurldecode($value))),
        ])
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public static function tagsToText($tags): string
    {
        if (!$tags) {
            return '';
        }

        $decoded = json_decode((string) $tags, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return collect($decoded)
                ->map(function ($tag) {
                    if (is_array($tag)) {
                        return trim((string) ($tag['value'] ?? ''));
                    }

                    return trim((string) $tag);
                })
                ->filter()
                ->implode(',');
        }

        return collect(preg_split('/\s*,\s*/', (string) $tags) ?: [])
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->implode(',');
    }
}
