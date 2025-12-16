import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Customer = { id: number; name: string; email: string };

type Project = {
    id: number;
    name: string;
    customer: Customer;
    price_table?: { id: number; year: number } | null;
    manual_price_table?: { id: number; year: number } | null;
    rooms_count?: number;
    bathrooms_count?: number;
    configurations_count?: number;
};

type Paginated<T> = {
    data: T[];
    meta?: {
        links: { url: string | null; label: string; active: boolean }[];
    };
};

type PageProps = {
    projects: Paginated<Project>;
    customers: Customer[];
    filters: {
        search?: string;
        customer_id?: number;
    };
};

export default function ConstructionProjectsIndex() {
    const { projects, filters, customers } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [customerId, setCustomerId] = useState(
        filters.customer_id?.toString() ?? '',
    );

    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Projects',
                href: admin.constructionProjects.index().url,
            },
        ],
        [],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.constructionProjects.index({
                query: {
                    search,
                    customer_id: customerId || undefined,
                },
            }).url,
        );
    };

    const handleDelete = (project: Project) => {
        if (!confirm('Delete this project?')) {
            return;
        }
        router.delete(admin.constructionProjects.destroy(project.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Construction Projects</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage projects and price table assignments.
                    </p>
                </div>
                <Button asChild>
                    <Link href={admin.constructionProjects.create().url}>
                        New Project
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
                            placeholder="Search project or customer"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        >
                            <option value="">All customers</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit">Apply</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setCustomerId('');
                                    router.get(
                                        admin.constructionProjects.index().url,
                                    );
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
                    <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">Name</th>
                                <th className="py-2">Customer</th>
                                <th className="py-2">Price Table</th>
                                <th className="py-2">Rooms</th>
                                <th className="py-2">Bathrooms</th>
                                <th className="py-2">Configs</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.data.map((project) => (
                                <tr
                                    key={project.id}
                                    className="border-t border-border/70"
                                >
                                    <td className="py-2">{project.name}</td>
                                    <td className="py-2 text-muted-foreground">
                                        {project.customer?.name}
                                    </td>
                                    <td className="py-2">
                                        {project.manual_price_table
                                            ? `Manual: ${project.manual_price_table.year}`
                                            : project.price_table
                                                ? `Auto: ${project.price_table.year}`
                                                : '—'}
                                    </td>
                                    <td className="py-2">
                                        {project.rooms_count ?? 0}
                                    </td>
                                    <td className="py-2">
                                        {project.bathrooms_count ?? 0}
                                    </td>
                                    <td className="py-2">
                                        {project.configurations_count ?? 0}
                                    </td>
                                    <td className="py-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={admin.constructionProjects
                                                        .edit(project.id)
                                                        .url}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(project)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={7}
                                    >
                                        No projects found.
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






