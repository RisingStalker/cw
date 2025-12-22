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
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Customers</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage customer accounts and login credentials.
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.customers.create().url}>+ New Customer</Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Search Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">Name</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">Email</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">Projects</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">Actions</th>
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
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">No customers found.</p>
                                            <p className="text-sm opacity-70">Create your first customer to get started.</p>
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

