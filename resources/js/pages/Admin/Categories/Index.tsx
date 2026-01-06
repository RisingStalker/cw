import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

type Category = {
    id: number;
    name: string;
    order: number;
    items_count?: number;
};

type PageProps = {
    categories: Category[];
    filters?: {
        search?: string;
    };
};

export default function CategoriesIndex() {
    const translations = useTranslations();
    const { categories, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: t('categories', translations),
                href: admin.categories.index().url,
            },
        ],
        [translations],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.categories.index({
                query: { search },
            }).url,
        );
    };

    const handleDelete = (category: Category) => {
        if (!confirm(t('confirm_delete_category', translations))) {
            return;
        }

        router.delete(admin.categories.destroy(category.id).url);
    };

    const filteredCategories = categories.filter((category) => {
        if (!search) {
            return true;
        }
        return category.name
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('categories', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('manage_categories_display_order', translations)}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.categories.create().url}>
                        + {t('new_category', translations)}
                    </Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('search_categories', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder={t('search_category_name', translations)}
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
                                    router.get(admin.categories.index().url);
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
                    <CardTitle className="text-lg font-semibold">{t('category_list', translations)}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('name', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('order', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('items', translations)}</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">{t('actions', translations)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category, index) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-3 px-2 font-medium">
                                        {category.name}
                                    </td>
                                    <td className="py-3 px-2 text-muted-foreground">
                                        {category.order}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {category.items_count ?? 0}
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
                                                    href={admin.categories
                                                        .edit(category.id)
                                                        .url}
                                                >
                                                    {t('edit', translations)}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
                                            >
                                                {t('delete', translations)}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">
                                                {search
                                                    ? t('no_categories_found_matching', translations)
                                                    : t('no_categories_found', translations)}
                                            </p>
                                            {!search && (
                                                <p className="text-sm opacity-70">{t('create_first_category', translations)}</p>
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

