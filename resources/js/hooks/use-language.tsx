import { useCallback, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export type Language = 'en' | 'de';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

export function useLanguage() {
    const page = usePage<{ locale?: string }>();
    
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
        // First, try to get the server's locale from Inertia props (most authoritative)
        const serverLocale = page.props.locale as Language | undefined;
        
        // Then check cookie (server-set)
        const cookieLanguage = getCookie('locale') as Language | null;
        
        // Priority: server locale > cookie > default 'de'
        // Ignore localStorage on initial load to prevent old values from overriding default
        let validLanguage: Language = 'de';
        
        if (serverLocale && ['en', 'de'].includes(serverLocale)) {
            validLanguage = serverLocale;
        } else if (cookieLanguage && ['en', 'de'].includes(cookieLanguage)) {
            validLanguage = cookieLanguage;
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
        // Get server locale (most authoritative source)
        const serverLocale = page.props.locale as Language | undefined;
        const cookieLanguage = getCookie('locale') as Language | null;
        
        // Determine the correct language to use
        // Priority: server locale > cookie > default 'de'
        // Ignore localStorage on first visit (when no cookie exists)
        let currentLanguage: Language;
        if (serverLocale && ['en', 'de'].includes(serverLocale)) {
            currentLanguage = serverLocale;
        } else if (cookieLanguage && ['en', 'de'].includes(cookieLanguage)) {
            currentLanguage = cookieLanguage;
        } else {
            currentLanguage = 'de';
        }
        
        // Ensure cookie is set if it doesn't exist (for first visit)
        if (!cookieLanguage) {
            setCookie('locale', currentLanguage);
            // Also update localStorage to keep them in sync
            localStorage.setItem('locale', currentLanguage);
        }
        
        // Update language state if it's different
        setLanguage(prevLanguage => {
            if (prevLanguage !== currentLanguage) {
                return currentLanguage;
            }
            return prevLanguage;
        });
    }, [page.props.locale]);

    return { language, updateLanguage } as const;
}

