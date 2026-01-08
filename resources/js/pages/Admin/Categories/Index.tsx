import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';
import { ChevronRight, ChevronDown } from 'lucide-react';

type Category = {
    id: number;
    name: string;
    order: number;
    parent_id?: number | null;
    scope?: string;
    items_count?: number;
    parent?: {
        id: number;
        name: string;
    } | null;
    children?: Category[];
    level?: number;
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

    // Expand all categories by default
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    // Expand all categories by default on mount
    useEffect(() => {
        const allIds = new Set<number>();
        const collectIds = (cats: Category[]) => {
            cats.forEach((cat) => {
                if (cat.children && cat.children.length > 0) {
                    allIds.add(cat.id);
                    collectIds(cat.children);
                }
            });
        };
        collectIds(categories);
        setExpandedCategories(allIds);
    }, [categories]);

    const handleDelete = (category: Category) => {
        if (!confirm(t('confirm_delete_category', translations))) {
            return;
        }

        router.delete(admin.categories.destroy(category.id).url);
    };

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Flatten categories for search filtering
    const flattenCategories = (cats: Category[]): Category[] => {
        const result: Category[] = [];
        cats.forEach((cat) => {
            result.push(cat);
            if (cat.children && cat.children.length > 0) {
                result.push(...flattenCategories(cat.children));
            }
        });
        return result;
    };

    const allCategoriesFlat = flattenCategories(categories);
    const filteredCategoriesFlat = allCategoriesFlat.filter((category) => {
        if (!search) {
            return true;
        }
        return category.name.toLowerCase().includes(search.toLowerCase());
    });

    // Filter tree based on search
    const filterTree = (cats: Category[]): Category[] => {
        if (!search) {
            return cats;
        }
        return cats
            .map((cat) => {
                const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
                const filteredChildren = cat.children ? filterTree(cat.children) : [];
                const hasMatchingChildren = filteredChildren.length > 0;

                if (matchesSearch || hasMatchingChildren) {
                    return {
                        ...cat,
                        children: filteredChildren,
                    };
                }
                return null;
            })
            .filter((cat): cat is Category => cat !== null);
    };

    const displayCategories = search ? filterTree(categories) : categories;

    // Render category row recursively
    const renderCategoryRow = (category: Category, index: number, level: number = 0): React.ReactNode[] => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const rows: React.ReactNode[] = [];

        rows.push(
            <tr
                key={category.id}
                className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <td className="py-3 px-2">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => toggleExpand(category.id)}
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-accent transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <span className="w-5" />
                        )}
                        <span className="font-medium">{category.name}</span>
                        {category.parent && (
                            <span className="text-xs text-muted-foreground">
                                ({t('parent', translations)}: {category.parent.name})
                            </span>
                        )}
                    </div>
                </td>
                <td className="py-3 px-2 text-muted-foreground">
                    {category.order}
                </td>
                <td className="py-3 px-2">
                    {category.scope && (
                        <span className="mr-2 text-xs text-muted-foreground">
                            {category.scope === 'whole_house'
                                ? t('whole_house', translations)
                                : t('room_specific', translations)}
                        </span>
                    )}
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
                            onClick={() => handleDelete(category)}
                        >
                            {t('delete', translations)}
                        </Button>
                    </div>
                </td>
            </tr>
        );

        // Add children if expanded
        if (hasChildren && isExpanded && category.children) {
            let childIndex = 0;
            category.children.forEach((child) => {
                const childRows = renderCategoryRow(child, index + rows.length, level + 1);
                rows.push(...childRows);
            });
        }

        return rows;
    };

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
                            {displayCategories.length > 0 ? (
                                displayCategories.flatMap((category, index) =>
                                    renderCategoryRow(category, index, 0)
                                )
                            ) : (
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

