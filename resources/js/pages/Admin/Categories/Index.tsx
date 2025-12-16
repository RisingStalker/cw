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
    const { categories, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters?.search ?? '');

    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Categories',
                href: admin.categories.index().url,
            },
        ],
        [],
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
        if (!confirm('Delete this category?')) {
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
            <FlashMessage />
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage categories and their display order.
                    </p>
                </div>
                <Button asChild>
                    <Link href={admin.categories.create().url}>
                        New Category
                    </Link>
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
                            placeholder="Search category name"
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
                                    router.get(admin.categories.index().url);
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
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">Name</th>
                                <th className="py-2">Order</th>
                                <th className="py-2">Items</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-t border-border/70"
                                >
                                    <td className="py-2 font-medium">
                                        {category.name}
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {category.order}
                                    </td>
                                    <td className="py-2">
                                        {category.items_count ?? 0}
                                    </td>
                                    <td className="py-2 text-right">
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
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={4}
                                    >
                                        {search
                                            ? 'No categories found matching your search.'
                                            : 'No categories found. Create one to get started.'}
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

