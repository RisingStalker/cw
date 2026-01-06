import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

type Customer = {
    id: number;
    name: string;
    email: string;
};

type PageProps = {
    customer: Customer;
};

export default function CustomersEdit() {
    const translations = useTranslations();
    const { customer } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name ?? '',
        email: customer.email ?? '',
    });

    const breadcrumbs = [
        {
            title: t('customers', translations),
            href: admin.customers.index().url,
        },
        {
            title: customer.name,
            href: admin.customers.edit(customer.id).url,
        },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(admin.customers.update(customer.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('edit_customer', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('update_customer_details', translations)}
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






