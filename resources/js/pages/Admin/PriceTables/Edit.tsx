import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

type PriceTable = {
    id: number;
    year: number;
    is_active: boolean;
};

type PageProps = {
    priceTable: PriceTable;
};

export default function PriceTablesEdit() {
    const translations = useTranslations();
    const { priceTable } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        year: priceTable.year.toString(),
        is_active: priceTable.is_active,
    });

    const breadcrumbs = [
        {
            title: t('price_tables', translations),
            href: admin.priceTables.index().url,
        },
        {
            title: t('edit', translations),
            href: admin.priceTables.edit(priceTable.id).url,
        },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(admin.priceTables.update(priceTable.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('edit_price_table', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('update_price_table_details', translations)}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.priceTables.index().url}>{t('back', translations)}</Link>
                </Button>
            </div>

            <Card className="mt-4 max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('price_table_details', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('year', translations)} *
                            </label>
                            <Input
                                type="number"
                                min="2000"
                                max="2100"
                                value={data.year}
                                onChange={(e) =>
                                    setData('year', e.target.value)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('year_description', translations)}
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
                                {t('active', translations)}
                            </label>
                            <p className="text-xs text-muted-foreground">
                                {t('active_description', translations)}
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



