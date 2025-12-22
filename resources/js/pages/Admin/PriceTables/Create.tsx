import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';

type PageProps = {
    defaultYear: number;
};

export default function PriceTablesCreate() {
    const { defaultYear } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        year: defaultYear.toString(),
        is_active: true,
    });

    const breadcrumbs = [
        {
            title: 'Price Tables',
            href: admin.priceTables.index().url,
        },
        { title: 'Create', href: admin.priceTables.create().url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.priceTables.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">New Price Table</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new price table for a specific year.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.priceTables.index().url}>Back</Link>
                </Button>
            </div>

            <Card className="mt-4 max-w-2xl">
                <CardHeader>
                    <CardTitle>Price Table Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Year *
                            </label>
                            <Input
                                type="number"
                                min="2000"
                                max="2100"
                                value={data.year}
                                onChange={(e) =>
                                    setData('year', e.target.value)
                                }
                                placeholder="e.g., 2024"
                            />
                            <p className="text-xs text-muted-foreground">
                                The year this price table applies to. Must be
                                unique.
                            </p>
                            {errors.year && (
                                <p className="text-sm text-destructive">
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked === true)
                                }
                            />
                            <label
                                htmlFor="is_active"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Only active price tables can be assigned to new
                                projects.
                            </p>
                        </div>
                        {errors.is_active && (
                            <p className="text-sm text-destructive">
                                {errors.is_active}
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                asChild
                            >
                                <Link href={admin.priceTables.index().url}>
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



