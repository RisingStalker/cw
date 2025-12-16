import FlashMessage from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    const { customers, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Customers',
                href: admin.customers.index().url,
            },
        ],
        [],
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
        if (!confirm('Delete this customer?')) {
            return;
        }

        router.delete(admin.customers.destroy(customer.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <FlashMessage />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Customers</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage customer accounts and login credentials.
                    </p>
                </div>
                <Button asChild>
                    <Link href={admin.customers.create().url}>New Customer</Link>
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder="Search name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button type="submit">Search</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    router.get(admin.customers.index().url);
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
                    <CardTitle>Customers</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">Name</th>
                                <th className="py-2">Email</th>
                                <th className="py-2">Projects</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="border-t border-border/70"
                                >
                                    <td className="py-2">{customer.name}</td>
                                    <td className="py-2 text-muted-foreground">
                                        {customer.email}
                                    </td>
                                    <td className="py-2">
                                        {customer.construction_projects_count ??
                                            0}
                                    </td>
                                    <td className="py-2 text-right">
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
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(customer)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No customers found.
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

