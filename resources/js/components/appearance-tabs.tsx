import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const translations = useTranslations();
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: t('light', translations) },
        { value: 'dark', icon: Moon, label: t('dark', translations) },
        { value: 'system', icon: Monitor, label: t('system', translations) },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-muted/50 p-1 backdrop-blur-sm border border-border/50',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-all duration-200 hover-lift',
                        appearance === value
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm font-medium">{label}</span>
                </button>
            ))}
        </div>
    );
}
