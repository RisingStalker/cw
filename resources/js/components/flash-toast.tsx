import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function FlashToast() {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 5000,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 5000,
            });
        }
    }, [flash]);

    return null;
}




