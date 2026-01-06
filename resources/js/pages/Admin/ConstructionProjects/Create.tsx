import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';

type Customer = { id: number; name: string; email: string };
type PriceTable = { id: number; year: number };

type PageProps = {
    customers: Customer[];
    priceTables: PriceTable[];
    defaultPriceTableId?: number | null;
};

type Room = { name: string; floor_space: string; prohibited_floors: string };
type Bathroom = {
    room_number: string;
    has_toilet: boolean;
    has_shower: boolean;
    has_bathtub: boolean;
};

const emptyRoom = (): Room => ({
    name: '',
    floor_space: '',
    prohibited_floors: '',
});

const emptyBathroom = (): Bathroom => ({
    room_number: '',
    has_toilet: false,
    has_shower: false,
    has_bathtub: false,
});

export default function ConstructionProjectsCreate() {
    const translations = useTranslations();
    const { customers, priceTables, defaultPriceTableId } =
        usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        name: '',
        facade_area: '',
        balcony_meters: '',
        interior_balustrade_meters: '',
        manual_price_table_id: defaultPriceTableId ?? '',
        rooms: [emptyRoom()],
        bathrooms: [emptyBathroom()],
    });

    const breadcrumbs = [
        { title: t('projects', translations), href: admin.constructionProjects.index().url },
        { title: t('create', translations), href: admin.constructionProjects.create().url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.constructionProjects.store().url);
    };

    const updateRoom = (index: number, key: keyof Room, value: string) => {
        const updated = [...data.rooms];
        updated[index] = { ...updated[index], [key]: value };
        setData('rooms', updated);
    };

    const updateBathroom = (
        index: number,
        key: keyof Bathroom,
        value: string | boolean,
    ) => {
        const updated = [...data.bathrooms];
        updated[index] = { ...updated[index], [key]: value };
        setData('bathrooms', updated);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        {t('new_construction_project', translations)}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('define_project_rooms_bathrooms', translations)}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.constructionProjects.index().url}>
                        {t('back', translations)}
                    </Link>
                </Button>
            </div>

            <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('project_details', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('customer', translations)}
                            </label>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.customer_id}
                                onChange={(e) =>
                                    setData('customer_id', e.target.value)
                                }
                            >
                                <option value="">{t('select_customer', translations)}</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.email})
                                    </option>
                                ))}
                            </select>
                            {errors.customer_id && (
                                <p className="text-sm text-destructive">
                                    {errors.customer_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('name', translations)}</label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('facade_area_m2', translations)}
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.facade_area}
                                onChange={(e) =>
                                    setData('facade_area', e.target.value)
                                }
                            />
                            {errors.facade_area && (
                                <p className="text-sm text-destructive">
                                    {errors.facade_area}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('balcony_meters', translations)}
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.balcony_meters}
                                onChange={(e) =>
                                    setData('balcony_meters', e.target.value)
                                }
                            />
                            {errors.balcony_meters && (
                                <p className="text-sm text-destructive">
                                    {errors.balcony_meters}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('interior_balustrade_meters', translations)}
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.interior_balustrade_meters}
                                onChange={(e) =>
                                    setData(
                                        'interior_balustrade_meters',
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.interior_balustrade_meters && (
                                <p className="text-sm text-destructive">
                                    {errors.interior_balustrade_meters}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('manual_price_table_optional', translations)}
                            </label>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.manual_price_table_id ?? ''}
                                onChange={(e) =>
                                    setData(
                                        'manual_price_table_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">{t('auto_by_year', translations)}</option>
                                {priceTables.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.year}
                                    </option>
                                ))}
                            </select>
                            {errors.manual_price_table_id && (
                                <p className="text-sm text-destructive">
                                    {errors.manual_price_table_id}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('rooms', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.rooms.map((room, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 gap-3 md:grid-cols-3"
                            >
                                <Input
                                    placeholder={t('room_name', translations)}
                                    value={room.name}
                                    onChange={(e) =>
                                        updateRoom(index, 'name', e.target.value)
                                    }
                                />
                                <Input
                                    placeholder={t('floor_space_m2', translations)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={room.floor_space}
                                    onChange={(e) =>
                                        updateRoom(
                                            index,
                                            'floor_space',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Input
                                    placeholder={t('prohibited_floors_comma_separated', translations)}
                                    value={room.prohibited_floors}
                                    onChange={(e) =>
                                        updateRoom(
                                            index,
                                            'prohibited_floors',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setData('rooms', [...data.rooms, emptyRoom()])
                                }
                            >
                                {t('add_room', translations)}
                            </Button>
                        </div>
                        {errors.rooms && (
                            <p className="text-sm text-destructive">
                                {errors.rooms as string}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('bathrooms', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.bathrooms.map((bathroom, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 gap-3 md:grid-cols-4"
                            >
                                <Input
                                    placeholder={t('room_number', translations)}
                                    type="number"
                                    min="1"
                                    value={bathroom.room_number}
                                    onChange={(e) =>
                                        updateBathroom(
                                            index,
                                            'room_number',
                                            e.target.value,
                                        )
                                    }
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={bathroom.has_toilet}
                                        onChange={(e) =>
                                            updateBathroom(
                                                index,
                                                'has_toilet',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    {t('toilet', translations)}
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={bathroom.has_shower}
                                        onChange={(e) =>
                                            updateBathroom(
                                                index,
                                                'has_shower',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    {t('shower', translations)}
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={bathroom.has_bathtub}
                                        onChange={(e) =>
                                            updateBathroom(
                                                index,
                                                'has_bathtub',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    {t('bathtub', translations)}
                                </label>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setData('bathrooms', [
                                        ...data.bathrooms,
                                        emptyBathroom(),
                                    ])
                                }
                            >
                                {t('add_bathroom', translations)}
                            </Button>
                        </div>
                        {errors.bathrooms && (
                            <p className="text-sm text-destructive">
                                {errors.bathrooms as string}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" asChild>
                        <Link href={admin.constructionProjects.index().url}>
                            {t('cancel', translations)}
                        </Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? t('saving', translations) : t('save', translations)}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}






