import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { Globe } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function LanguageDropdown({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const translations = useTranslations();
    const { language, updateLanguage } = useLanguage();

    const getLanguageName = (lang: string) => {
        switch (lang) {
            case 'en':
                return 'English';
            case 'de':
                return 'Deutsch';
            default:
                return 'English';
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md hover:bg-accent/50 transition-all duration-200"
                        title={t('change_language', translations)}
                    >
                        <Globe className="h-5 w-5" />
                        <span className="sr-only">{t('change_language', translations)}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem
                        onClick={() => updateLanguage('en')}
                        className={language === 'en' ? 'bg-accent' : ''}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-sm font-medium">🇬🇧</span>
                            English
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateLanguage('de')}
                        className={language === 'de' ? 'bg-accent' : ''}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-sm font-medium">🇩🇪</span>
                            Deutsch
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

