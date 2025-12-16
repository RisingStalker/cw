import FlashMessage from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
    const { priceTables, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Price Tables',
                href: admin.priceTables.index().url,
            },
        ],
        [],
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
        if (!confirm('Delete this price table?')) {
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
            <FlashMessage />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Price Tables</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage price tables by year. Projects use price tables
                        to determine item pricing.
                    </p>
                </div>
                <Button asChild>
                    <Link href={admin.priceTables.create().url}>
                        New Price Table
                    </Link>
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder="Search by year"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit">Apply</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('');
                                    router.get(admin.priceTables.index().url);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Price Tables</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">Year</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Projects</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPriceTables.map((priceTable) => (
                                <tr
                                    key={priceTable.id}
                                    className="border-t border-border/70"
                                >
                                    <td className="py-2 font-medium">
                                        {priceTable.year}
                                    </td>
                                    <td className="py-2">
                                        {priceTable.is_active ? (
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {priceTable.construction_projects_count ??
                                            0}
                                    </td>
                                    <td className="py-2 text-right">
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
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(priceTable)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPriceTables.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        {search || status
                                            ? 'No price tables found matching your filters.'
                                            : 'No price tables found. Create one to get started.'}
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

