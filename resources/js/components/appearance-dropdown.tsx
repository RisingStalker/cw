import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AppearanceToggleDropdown({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const translations = useTranslations();
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-5 w-5" />;
            case 'light':
                return <Sun className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
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
                        title={t('toggle_theme', translations)}
                    >
                        {getCurrentIcon()}
                        <span className="sr-only">{t('toggle_theme', translations)}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem 
                        onClick={() => updateAppearance('light')}
                        className={appearance === 'light' ? 'bg-accent' : ''}
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            {t('light', translations)}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => updateAppearance('dark')}
                        className={appearance === 'dark' ? 'bg-accent' : ''}
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            {t('dark', translations)}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('system')}
                        className={appearance === 'system' ? 'bg-accent' : ''}
                    >
                        <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            {t('system', translations)}
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
