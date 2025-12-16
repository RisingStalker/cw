import FlashMessage from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Item = {
    id: number;
    title: string;
    description?: string;
    additional_cost: string;
    requires_quantity: boolean;
    consultation_required: boolean;
    is_standard: boolean;
    hidden_until?: string;
    category?: Category;
    images_count?: number;
    variations_count?: number;
};

type Paginated<T> = {
    data: T[];
    meta?: {
        links: { url: string | null; label: string; active: boolean }[];
    };
};

type PageProps = {
    items: Paginated<Item>;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: number;
    };
};

export default function ItemsIndex() {
    const { items, categories, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(
        filters.category_id?.toString() ?? '',
    );

    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Items',
                href: admin.items.index().url,
            },
        ],
        [],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.items.index({
                query: {
                    search,
                    category_id: categoryId || undefined,
                },
            }).url,
        );
    };

    const handleDelete = (item: Item) => {
        if (!confirm('Delete this item?')) {
            return;
        }

        router.delete(admin.items.destroy(item.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <FlashMessage />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Items</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage items, images, and variations.
                    </p>
                </div>
                <Button asChild>
                    <Link href={admin.items.create().url}>New Item</Link>
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
                            placeholder="Search title or description"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
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
                                    setCategoryId('');
                                    router.get(admin.items.index().url);
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
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">Title</th>
                                <th className="py-2">Category</th>
                                <th className="py-2">Cost</th>
                                <th className="py-2">Flags</th>
                                <th className="py-2">Images</th>
                                <th className="py-2">Variations</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-border/70"
                                >
                                    <td className="py-2">
                                        <div className="font-medium">
                                            {item.title}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {item.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {item.category?.name ?? '—'}
                                    </td>
                                    <td className="py-2">
                                        {item.additional_cost
                                            ? `€${parseFloat(item.additional_cost).toFixed(2)}`
                                            : item.consultation_required
                                                ? 'Consultation'
                                                : '—'}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex flex-wrap gap-1">
                                            {item.is_standard && (
                                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    Standard
                                                </span>
                                            )}
                                            {item.requires_quantity && (
                                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Qty
                                                </span>
                                            )}
                                            {item.consultation_required && (
                                                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                    Consult
                                                </span>
                                            )}
                                            {item.hidden_until && (
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                    Hidden
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {item.images_count ?? 0}
                                    </td>
                                    <td className="py-2">
                                        {item.variations_count ?? 0}
                                    </td>
                                    <td className="py-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                asChild
                                                size="sm"
                                            >
                                                <Link
                                                    href={admin.items
                                                        .edit(item.id)
                                                        .url}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={7}
                                    >
                                        No items found.
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



