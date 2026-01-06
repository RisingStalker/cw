import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function ConfirmPassword() {
    const translations = useTranslations();
    return (
        <AuthLayout
            title={t('confirm_your_password', translations)}
            description={t('secure_area_confirm_password', translations)}
        >
            <Head title={t('confirm_password', translations)} />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('password', translations)}</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder={t('password_placeholder', translations)}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('confirm_password', translations)}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
