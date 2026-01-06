import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

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
    const translations = useTranslations();
    const { projects, filters, customers } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [customerId, setCustomerId] = useState(
        filters.customer_id?.toString() ?? '',
    );

    const breadcrumbs = useMemo(
        () => [
            {
                title: t('projects', translations),
                href: admin.constructionProjects.index().url,
            },
        ],
        [translations],
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
        if (!confirm(t('delete_this_project', translations))) {
            return;
        }
        router.delete(admin.constructionProjects.destroy(project.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('construction_projects', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('manage_projects_price_table', translations)}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.constructionProjects.create().url}>
                        + {t('new_project', translations)}
                    </Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('search_projects', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder={t('search_project_or_customer', translations)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        >
                            <option value="">{t('all_customers', translations)}</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit">{t('apply', translations)}</Button>
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
                                {t('reset', translations)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('project_list', translations)}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('name', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('customer', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('price_table_label', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('rooms', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('bathrooms', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('configs', translations)}</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">{t('actions', translations)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.data.map((project, index) => (
                                <tr
                                    key={project.id}
                                    className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-3 px-2 font-medium">{project.name}</td>
                                    <td className="py-3 px-2 text-muted-foreground">
                                        {project.customer?.name}
                                    </td>
                                    <td className="py-3 px-2">
                                        {project.manual_price_table
                                            ? `${t('manual', translations)}: ${project.manual_price_table.year}`
                                            : project.price_table
                                                ? `${t('auto', translations)}: ${project.price_table.year}`
                                                : '—'}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {project.rooms_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {project.bathrooms_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {project.configurations_count ?? 0}
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
                                                    href={admin.constructionProjects
                                                        .edit(project.id)
                                                        .url}
                                                >
                                                    {t('edit', translations)}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(project)
                                                }
                                            >
                                                {t('delete', translations)}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={7}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">{t('no_projects_found', translations)}</p>
                                            <p className="text-sm opacity-70">{t('create_first_project', translations)}</p>
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






