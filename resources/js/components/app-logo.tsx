import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AppLogo() {
    const translations = useTranslations();
    const { name } = usePage<SharedData>().props;
    
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img 
                    src="/logo.png" 
                    alt={t('logo', translations)} 
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
