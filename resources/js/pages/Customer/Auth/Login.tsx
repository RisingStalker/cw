import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';
import { Form, Head, Link, useForm } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function CustomerLogin() {
    const translations = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(login().url);
    };

    return (
        <AuthLayout
            title={t('customer_login', translations)}
            description={t('enter_email_password_access_projects', translations)}
        >
            <Head title={t('customer_login', translations)} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
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

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('password', translations)}</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder={t('password_placeholder', translations)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <Label htmlFor="remember">{t('remember_me', translations)}</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {t('log_in', translations)}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    {t('dont_have_account', translations)}{' '}
                    <Link href={register().url} className="text-primary hover:underline">
                        {t('sign_up', translations)}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}




