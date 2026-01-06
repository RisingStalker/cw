import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    const translations = useTranslations();
    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{title || t('something_went_wrong', translations)}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {Array.from(new Set(errors)).map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
