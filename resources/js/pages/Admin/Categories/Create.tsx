import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';

type PageProps = {
    nextOrder: number;
};

export default function CategoriesCreate() {
    const { nextOrder } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        order: nextOrder,
    });

    const breadcrumbs = [
        { title: 'Categories', href: admin.categories.index().url },
        { title: 'Create', href: admin.categories.create().url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.categories.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">New Category</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new category for organizing items.
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
                                placeholder="e.g., Flooring, Windows, etc."
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



