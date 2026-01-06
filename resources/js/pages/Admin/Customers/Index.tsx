import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslations, t } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Customer = {
    id: number;
    name: string;
    email: string;
    construction_projects_count?: number;
};

type Paginated<T> = {
    data: T[];
    meta?: {
        links: { url: string | null; label: string; active: boolean }[];
    };
};

type PageProps = {
    customers: Paginated<Customer>;
    filters: {
        search?: string;
    };
};

export default function CustomersIndex() {
    const translations = useTranslations();
    const { customers, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: t('customers', translations),
                href: admin.customers.index().url,
            },
        ],
        [translations],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.customers.index({
                query: { search },
            }).url,
        );
    };

    const handleDelete = (customer: Customer) => {
        if (!confirm(t('delete_customer', translations))) {
            return;
        }

        router.delete(admin.customers.destroy(customer.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('customers', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('manage_customer_accounts', translations)}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.customers.create().url}>+ {t('new_customer', translations)}</Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('search_customers', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder={t('search_name_email', translations)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <div className="flex gap-2">
                            <Button type="submit">{t('search', translations)}</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    router.get(admin.customers.index().url);
                                }}
                            >
                                {t('reset', translations)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('customer_list', translations)}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('name', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('email', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('projects', translations)}</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">{t('actions', translations)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((customer, index) => (
                                <tr
                                    key={customer.id}
                                    className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-3 px-2 font-medium">{customer.name}</td>
                                    <td className="py-3 px-2 text-muted-foreground">
                                        {customer.email}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {customer.construction_projects_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                asChild
                                                size="sm"
                                            >
                                                <Link
                                                    href={admin.customers
                                                        .edit(customer.id)
                                                        .url}
                                                >
                                                    {t('edit', translations)}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(customer)
                                                }
                                            >
                                                {t('delete', translations)}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">{t('no_customers_found', translations)}</p>
                                            <p className="text-sm opacity-70">{t('create_first_customer', translations)}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

