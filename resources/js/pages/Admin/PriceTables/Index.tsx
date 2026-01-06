import FlashToast from '@/components/flash-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

type PriceTable = {
    id: number;
    year: number;
    is_active: boolean;
    construction_projects_count?: number;
};

type PageProps = {
    priceTables: PriceTable[];
    filters?: {
        search?: string;
        status?: string;
    };
};

export default function PriceTablesIndex() {
    const translations = useTranslations();
    const { priceTables, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: t('price_tables', translations),
                href: admin.priceTables.index().url,
            },
        ],
        [translations],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.priceTables.index({
                query: {
                    search,
                    status: status || undefined,
                },
            }).url,
        );
    };

    const handleDelete = (priceTable: PriceTable) => {
        if (!confirm(t('delete_this_price_table', translations))) {
            return;
        }

        router.delete(admin.priceTables.destroy(priceTable.id).url);
    };

    const filteredPriceTables = priceTables.filter((priceTable) => {
        if (search && !priceTable.year.toString().includes(search)) {
            return false;
        }
        if (status === 'active' && !priceTable.is_active) {
            return false;
        }
        if (status === 'inactive' && priceTable.is_active) {
            return false;
        }
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <FlashToast />
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('price_tables', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('manage_price_tables_by_year', translations)}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.priceTables.create().url}>
                        + {t('new_price_table', translations)}
                    </Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('search_price_tables', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder={t('search_by_year', translations)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">{t('all_statuses', translations)}</option>
                            <option value="active">{t('active', translations)}</option>
                            <option value="inactive">{t('inactive', translations)}</option>
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit">{t('apply', translations)}</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('');
                                    router.get(admin.priceTables.index().url);
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
                    <CardTitle className="text-lg font-semibold">{t('price_table_list', translations)}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('year', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('status', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('projects', translations)}</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">{t('actions', translations)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPriceTables.map((priceTable, index) => (
                                <tr
                                    key={priceTable.id}
                                    className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-3 px-2 font-medium">
                                        {priceTable.year}
                                    </td>
                                    <td className="py-3 px-2">
                                        {priceTable.is_active ? (
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {t('active', translations)}
                                            </span>
                                        ) : (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                {t('inactive', translations)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {priceTable.construction_projects_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={admin.priceTables
                                                        .edit(priceTable.id)
                                                        .url}
                                                >
                                                    {t('edit', translations)}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(priceTable)
                                                }
                                            >
                                                {t('delete', translations)}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPriceTables.length === 0 && (
                                <tr>
                                    <td
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">
                                                {search || status
                                                    ? t('no_price_tables_found_matching', translations)
                                                    : t('no_price_tables_found', translations)}
                                            </p>
                                            {!search && !status && (
                                                <p className="text-sm opacity-70">{t('create_first_price_table', translations)}</p>
                                            )}
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

