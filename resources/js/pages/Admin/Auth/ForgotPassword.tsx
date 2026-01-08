import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function AdminForgotPassword({ status }: { status?: string }) {
    const translations = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/forgot-password');
    };

    return (
        <AuthLayout
            title={t('forgot_password', translations)}
            description={t('enter_email_for_reset_link', translations)}
        >
            <Head title={t('forgot_password', translations)} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('email_address', translations)}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder={t('email_placeholder', translations)}
                    />
                    <InputError message={errors.email} />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing && <Spinner />}
                    {t('email_password_reset_link', translations)}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    <Link href="/admin/login" className="text-primary hover:underline">
                        {t('back_to_login', translations)}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

