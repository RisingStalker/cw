import { ImgHTMLAttributes } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    const translations = useTranslations();
    return (
        <img 
            src="/logo.png" 
            alt={t('logo', translations)} 
            className="object-contain"
            {...props}
        />
    );
}
