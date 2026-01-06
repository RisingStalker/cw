import FlashToast from '@/components/flash-toast';
import { CustomerHeader } from '@/components/customer-header';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({
    children,
}: CustomerLayoutProps) {
    const translations = useTranslations();
    return (
        <div className="flex min-h-screen flex-col">
            <FlashToast />
            <CustomerHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-6 md:px-6">
                    {children}
                </div>
            </main>
            <footer className="border-t bg-muted/50 py-6">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Home Equipment'}. {t('all_rights_reserved', translations)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground">
                                {t('privacy_policy', translations)}
                            </Link>
                            <Link href="/" className="hover:text-foreground">
                                {t('terms_of_service', translations)}
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

