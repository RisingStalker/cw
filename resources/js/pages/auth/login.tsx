import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register, login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const translations = useTranslations();
    return (
        <AuthLayout
            title={t('log_in_to_your_account', translations)}
            description={t('enter_email_password_to_log_in', translations)}
        >
            <Head title={t('log_in', translations)} />

            <Form
                action={login().url}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('email_address', translations)}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('email_placeholder', translations)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{t('password', translations)}</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={email.url()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            {t('forgot_password_question', translations)}
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('password_placeholder', translations)}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">{t('remember_me', translations)}</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('log_in', translations)}
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                {t('dont_have_account', translations)}{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    {t('sign_up', translations)}
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
