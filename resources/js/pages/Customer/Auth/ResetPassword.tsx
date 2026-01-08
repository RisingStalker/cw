import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head, useForm } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function CustomerResetPassword({ token, email }: ResetPasswordProps) {
    const translations = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <AuthLayout
            title={t('reset_password', translations)}
            description={t('enter_new_password_below', translations)}
        >
            <Head title={t('reset_password', translations)} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('email', translations)}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        readOnly
                        className="bg-muted"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">{t('password', translations)}</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoFocus
                        autoComplete="new-password"
                        placeholder={t('password_placeholder', translations)}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        {t('confirm_password', translations)}
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder={t('confirm_password_placeholder', translations)}
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing && <Spinner />}
                    {t('reset_password', translations)}
                </Button>
            </form>
        </AuthLayout>
    );
}

