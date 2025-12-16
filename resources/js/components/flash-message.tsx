import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashMessageProps {
    className?: string;
}

export default function FlashMessage({ className }: FlashMessageProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) {
        return null;
    }

    return (
        <div className={className}>
            {flash.success && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="flex items-center justify-between">
                        <span className="text-green-800 dark:text-green-200">{flash.success}</span>
                        <button
                            onClick={() => setVisible(false)}
                            className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </AlertDescription>
                </Alert>
            )}

            {flash.error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{flash.error}</span>
                        <button
                            onClick={() => setVisible(false)}
                            className="ml-4 hover:opacity-70"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}






