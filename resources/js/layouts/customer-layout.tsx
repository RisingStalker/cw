import FlashMessage from '@/components/flash-message';
import { CustomerHeader } from '@/components/customer-header';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({
    children,
}: CustomerLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <CustomerHeader />
            <main className="flex-1">
                <FlashMessage className="container mx-auto px-4 pt-4 md:px-6" />
                <div className="container mx-auto px-4 py-6 md:px-6">
                    {children}
                </div>
            </main>
            <footer className="border-t bg-muted/50 py-6">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Home Equipment'}. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link href="/" className="hover:text-foreground">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

