import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function CustomerRegister() {
    const translations = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <AuthLayout
            title={t('create_account_title', translations)}
            description={t('sign_up_access_projects', translations)}
        >
            <Head title={t('customer_registration', translations)} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('full_name', translations)}</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder={t('name_placeholder', translations)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('email_address', translations)}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder={t('email_placeholder', translations)}
                        />
                        <InputError message={errors.email} />
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
                            autoComplete="new-password"
                            placeholder={t('password_placeholder', translations)}
                        />
                        <InputError message={errors.password} />
                        <p className="text-sm text-muted-foreground">
                            {t('password_min_length', translations)}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('confirm_password', translations)}</Label>
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
                        className="mt-4 w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {t('create_account_button', translations)}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    {t('already_have_account', translations)}{' '}
                    <Link href={login().url} className="text-primary hover:underline">
                        {t('sign_in', translations)}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

