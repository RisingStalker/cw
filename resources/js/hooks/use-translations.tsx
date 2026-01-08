import { usePage } from '@inertiajs/react';

type Translations = Record<string, string>;

export function useTranslations(): Translations {
    const page = usePage<{ translations?: Translations }>();
    return page.props.translations || {};
}

export function t(key: string, translations: Translations): string {
    return translations[key] || key;
}



