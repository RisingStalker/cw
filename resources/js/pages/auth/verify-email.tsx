// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function VerifyEmail({ status }: { status?: string }) {
    const translations = useTranslations();
    return (
        <AuthLayout
            title={t('verify_email', translations)}
            description={t('verify_email_description', translations)}
        >
            <Head title={t('email_verification', translations)} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {t('verification_link_sent', translations)}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {t('resend_verification_email', translations)}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {t('log_out', translations)}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
