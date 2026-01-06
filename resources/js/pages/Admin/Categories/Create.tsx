import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

type PageProps = {
    nextOrder: number;
};

export default function CategoriesCreate() {
    const translations = useTranslations();
    const { nextOrder } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        order: nextOrder,
    });

    const breadcrumbs = [
        { title: t('categories', translations), href: admin.categories.index().url },
        { title: t('create', translations), href: admin.categories.create().url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.categories.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('new_category', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('create_new_category', translations)}
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
                                placeholder={t('category_name_placeholder', translations)}
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



