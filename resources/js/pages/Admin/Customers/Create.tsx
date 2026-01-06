import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

export default function CustomersCreate() {
    const translations = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
    });

    const breadcrumbs = [
        {
            title: t('customers', translations),
            href: admin.customers.index().url,
        },
        {
            title: t('create', translations),
            href: admin.customers.create().url,
        },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.customers.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('new_customer', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('create_customer_send_credentials', translations)}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.customers.index().url}>{t('back', translations)}</Link>
                </Button>
            </div>

            <Card className="mt-4 max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('customer_details', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('name', translations)}</label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('email', translations)}</label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                asChild
                            >
                                <Link href={admin.customers.index().url}>
                                    {t('cancel', translations)}
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('saving', translations) : t('save', translations)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}






