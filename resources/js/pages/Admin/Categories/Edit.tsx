import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

type Category = {
    id: number;
    name: string;
    order: number;
};

type PageProps = {
    category: Category;
};

export default function CategoriesEdit() {
    const translations = useTranslations();
    const { category } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        order: category.order,
    });

    const breadcrumbs = [
        { title: t('categories', translations), href: admin.categories.index().url },
        { title: t('edit', translations), href: admin.categories.edit(category.id).url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(admin.categories.update(category.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">{t('edit_category', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('update_category_details', translations)}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.categories.index().url}>{t('back', translations)}</Link>
                </Button>
            </div>

            <Card className="mt-4 max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('category_details', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('category_name', translations)} *
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
                            <label className="text-sm font-medium">{t('order', translations)}</label>
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
                                {t('order_description', translations)}
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
                                    {t('cancel', translations)}
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('saving', translations) : t('save', translations)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}



