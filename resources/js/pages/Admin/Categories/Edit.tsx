import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
    order: number;
};

type PageProps = {
    category: Category;
};

export default function CategoriesEdit() {
    const { category } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        order: category.order,
    });

    const breadcrumbs = [
        { title: 'Categories', href: admin.categories.index().url },
        { title: 'Edit', href: admin.categories.edit(category.id).url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(admin.categories.update(category.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Edit Category</h1>
                    <p className="text-sm text-muted-foreground">
                        Update category details.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.categories.index().url}>Back</Link>
                </Button>
            </div>

            <Card className="mt-4 max-w-2xl">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Category Name *
                            </label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Order</label>
                            <Input
                                type="number"
                                min="1"
                                value={data.order}
                                onChange={(e) =>
                                    setData(
                                        'order',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower numbers appear first. You can reorder
                                categories later.
                            </p>
                            {errors.order && (
                                <p className="text-sm text-destructive">
                                    {errors.order}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                asChild
                            >
                                <Link href={admin.categories.index().url}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}



