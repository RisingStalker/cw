import { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export type Language = 'en' | 'de';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

export function useLanguage() {
    // Get language from cookie if available (for SSR)
    const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') {
            return null;
        }
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    };

    const getInitialLanguage = (): Language => {
        const savedLanguage = localStorage.getItem('locale') as Language | null;
        const cookieLanguage = getCookie('locale') as Language | null;
        const validLanguage = (cookieLanguage || savedLanguage || 'en') as Language;
        
        if (!['en', 'de'].includes(validLanguage)) {
            return 'en';
        }
        
        return validLanguage;
    };

    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    const updateLanguage = useCallback((lang: Language) => {
        // Validate language
        if (!['en', 'de'].includes(lang)) {
            return;
        }

        setLanguage(lang);

        // Store in localStorage for client-side persistence
        localStorage.setItem('locale', lang);

        // Store in cookie for SSR
        setCookie('locale', lang);

        // Reload the page to apply the new language
        router.reload({
            only: [],
            preserveState: false,
            preserveScroll: false,
        });
    }, []);

    useEffect(() => {
        const currentLanguage = getInitialLanguage();
        if (currentLanguage !== language) {
            setLanguage(currentLanguage);
        }
    }, []);

    return { language, updateLanguage } as const;
}

