import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';

type Category = { id: number; name: string };
type PriceTable = { id: number; year: number };
type ItemImage = { id: number; path: string; order: number; url: string };
type ItemVariation = {
    id: number;
    type: 'size' | 'color';
    name: string;
    surcharge: string;
};
type ItemPriceTable = {
    id: number;
    year: number;
    pivot: { additional_cost: string };
};

type Item = {
    id: number;
    category_id: number;
    title: string;
    description?: string;
    additional_cost: string;
    requires_quantity: boolean;
    consultation_required: boolean;
    is_standard: boolean;
    hidden_until?: string;
    images?: ItemImage[];
    variations?: ItemVariation[];
    priceTables?: ItemPriceTable[];
};

type PageProps = {
    item: Item;
    categories: Category[];
    priceTables: PriceTable[];
};

type Variation = {
    type: 'size' | 'color';
    name: string;
    surcharge: string;
};

type PriceTableEntry = {
    price_table_id: string;
    additional_cost: string;
};

export default function ItemsEdit() {
    const translations = useTranslations();
    const { item, categories, priceTables } = usePage<PageProps>().props;
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const { data, setData, put, processing, errors, delete: deleteMethod } =
        useForm({
            category_id: item.category_id.toString(),
            title: item.title,
            description: item.description ?? '',
            additional_cost: item.additional_cost,
            requires_quantity: item.requires_quantity,
            consultation_required: item.consultation_required,
            is_standard: item.is_standard,
            hidden_until: item.hidden_until
                ? new Date(item.hidden_until).toISOString().split('T')[0]
                : '',
            images: [] as File[],
            variations: (item.variations || []).map((v) => ({
                type: v.type,
                name: v.name,
                surcharge: v.surcharge,
            })) as Variation[],
            price_tables: (item.priceTables || []).map((pt) => ({
                price_table_id: pt.id.toString(),
                additional_cost: pt.pivot.additional_cost,
            })) as PriceTableEntry[],
        });

    const breadcrumbs = [
        { title: t('items', translations), href: admin.items.index().url },
        { title: t('edit', translations), href: admin.items.edit(item.id).url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(admin.items.update(item.id).url, {
            forceFormData: true,
        });
    };

    const handleDeleteImage = (imageId: number) => {
        if (!confirm(t('delete_this_image', translations))) {
            return;
        }
        router.delete(
            admin.items.images.destroy({ item: item.id, image: imageId }).url,
            { preserveScroll: true },
        );
    };

    const addVariation = () => {
        setData('variations', [
            ...data.variations,
            { type: 'size', name: '', surcharge: '0' },
        ]);
    };

    const removeVariation = (index: number) => {
        setData(
            'variations',
            data.variations.filter((_, i) => i !== index),
        );
    };

    const updateVariation = (
        index: number,
        key: keyof Variation,
        value: string,
    ) => {
        const updated = [...data.variations];
        updated[index] = { ...updated[index], [key]: value };
        setData('variations', updated);
    };

    const addPriceTable = () => {
        setData('price_tables', [
            ...data.price_tables,
            { price_table_id: '', additional_cost: '0' },
        ]);
    };

    const removePriceTable = (index: number) => {
        setData(
            'price_tables',
            data.price_tables.filter((_, i) => i !== index),
        );
    };

    const updatePriceTable = (
        index: number,
        key: keyof PriceTableEntry,
        value: string,
    ) => {
        const updated = [...data.price_tables];
        updated[index] = { ...updated[index], [key]: value };
        setData('price_tables', updated);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('edit_item', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('update_item_details', translations)}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.items.index().url}>{t('back', translations)}</Link>
                </Button>
            </div>

            <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('basic_information', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('category', translations)} *
                            </label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) =>
                                    setData('category_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('select_category', translations)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <p className="text-sm text-destructive">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('title', translations)} *
                            </label>
                            <Input
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('description', translations)}
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('additional_cost', translations)} *
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.additional_cost}
                                onChange={(e) =>
                                    setData('additional_cost', e.target.value)
                                }
                            />
                            {errors.additional_cost && (
                                <p className="text-sm text-destructive">
                                    {errors.additional_cost}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('hidden_until_date', translations)}
                            </label>
                            <Input
                                type="date"
                                value={data.hidden_until}
                                onChange={(e) =>
                                    setData('hidden_until', e.target.value)
                                }
                            />
                            {errors.hidden_until && (
                                <p className="text-sm text-destructive">
                                    {errors.hidden_until}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="requires_quantity"
                                    checked={data.requires_quantity}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'requires_quantity',
                                            checked === true,
                                        )
                                    }
                                />
                                <label
                                    htmlFor="requires_quantity"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {t('customer_can_enter_quantity', translations)}
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="consultation_required"
                                    checked={data.consultation_required}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'consultation_required',
                                            checked === true,
                                        )
                                    }
                                />
                                <label
                                    htmlFor="consultation_required"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {t('consultation_required', translations)}
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_standard"
                                    checked={data.is_standard}
                                    onCheckedChange={(checked) =>
                                        setData('is_standard', checked === true)
                                    }
                                />
                                <label
                                    htmlFor="is_standard"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {t('standard_option_no_extra_cost', translations)}
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('images', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {item.images && item.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {item.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="relative aspect-square overflow-hidden rounded-lg border cursor-pointer group"
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img
                                            src={image.url}
                                            alt="Item"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteImage(image.id);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {data.images.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {data.images.length} new {t('images_selected', translations)}
                                </p>
                            )}
                            {errors.images && (
                                <p className="text-sm text-destructive">
                                    {errors.images}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('variations', translations)}</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariation}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('add_variation', translations)}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.variations.map((variation, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row"
                            >
                                <Select
                                    value={variation.type}
                                    onValueChange={(value) =>
                                        updateVariation(
                                            index,
                                            'type',
                                            value as 'size' | 'color',
                                        )
                                    }
                                >
                                    <SelectTrigger className="sm:w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="size">{t('size', translations)}</SelectItem>
                                        <SelectItem value="color">
                                            {t('color', translations)}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder={t('name_placeholder', translations)}
                                    value={variation.name}
                                    onChange={(e) =>
                                        updateVariation(
                                            index,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={t('surcharge_placeholder', translations)}
                                    value={variation.surcharge}
                                    onChange={(e) =>
                                        updateVariation(
                                            index,
                                            'surcharge',
                                            e.target.value,
                                        )
                                    }
                                    className="sm:w-32"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeVariation(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {data.variations.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                {t('no_variations_added', translations)}
                            </p>
                        )}
                        {errors.variations && (
                            <p className="text-sm text-destructive">
                                {errors.variations}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('price_tables', translations)}</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPriceTable}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('add_price_table', translations)}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.price_tables.map((pt, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row"
                            >
                                <Select
                                    value={pt.price_table_id}
                                    onValueChange={(value) =>
                                        updatePriceTable(
                                            index,
                                            'price_table_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder={t('select_price_table_placeholder', translations)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priceTables.map((table) => (
                                            <SelectItem
                                                key={table.id}
                                                value={table.id.toString()}
                                            >
                                                {table.year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={t('additional_cost_placeholder', translations)}
                                    value={pt.additional_cost}
                                    onChange={(e) =>
                                        updatePriceTable(
                                            index,
                                            'additional_cost',
                                            e.target.value,
                                        )
                                    }
                                    className="sm:w-40"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removePriceTable(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {data.price_tables.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                {t('no_price_tables_added', translations)}
                            </p>
                        )}
                        {errors.price_tables && (
                            <p className="text-sm text-destructive">
                                {errors.price_tables}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" asChild>
                        <Link href={admin.items.index().url}>{t('cancel', translations)}</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? t('saving', translations) : t('save', translations)}
                    </Button>
                </div>
            </form>

            {/* Image Modal */}
            <Dialog
                open={selectedImageIndex !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedImageIndex(null);
                        setZoomLevel(1);
                    }
                }}
            >
                <DialogContent className="max-w-4xl w-full p-0 [&>button]:z-50">
                    {selectedImageIndex !== null && item.images && item.images[selectedImageIndex] && (
                        <div className="relative overflow-hidden">
                            <div
                                className="relative w-full h-[80vh] flex items-center justify-center bg-black/50 overflow-auto"
                                onMouseDown={(e) => {
                                    // Don't start dragging if clicking on a button, interactive element, or the close button area
                                    const target = e.target as HTMLElement;
                                    if (
                                        target.closest('button') ||
                                        target.closest('[role="button"]') ||
                                        target.closest('[data-slot="dialog-close"]') ||
                                        (e.clientX > window.innerWidth - 60 && e.clientY < 60) // Close button area
                                    ) {
                                        return;
                                    }
                                    if (zoomLevel > 1) {
                                        setIsDragging(true);
                                        setDragStart({
                                            x: e.clientX - panPosition.x,
                                            y: e.clientY - panPosition.y,
                                        });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isDragging && zoomLevel > 1) {
                                        setPanPosition({
                                            x: e.clientX - dragStart.x,
                                            y: e.clientY - dragStart.y,
                                        });
                                    }
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
                                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                    }}
                                >
                                    <img
                                        src={item.images[selectedImageIndex].url}
                                        alt="Item"
                                        className="max-w-full max-h-full object-contain"
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                            userSelect: 'none',
                                        }}
                                        draggable={false}
                                        onWheel={(e) => {
                                            e.preventDefault();
                                            const delta = e.deltaY > 0 ? -0.1 : 0.1;
                                            const newZoom = Math.max(0.5, Math.min(5, zoomLevel + delta));
                                            setZoomLevel(newZoom);
                                            // Reset pan if zooming out to fit
                                            if (newZoom <= 1) {
                                                setPanPosition({ x: 0, y: 0 });
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Zoom Controls */}
                            <div className="absolute top-4 right-16 flex gap-2 z-20">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newZoom = Math.max(0.5, zoomLevel - 0.25);
                                        setZoomLevel(newZoom);
                                        if (newZoom <= 1) {
                                            setPanPosition({ x: 0, y: 0 });
                                        }
                                    }}
                                    disabled={zoomLevel <= 0.5}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomLevel((prev) => Math.min(5, prev + 0.25));
                                    }}
                                    disabled={zoomLevel >= 5}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomLevel(1);
                                        setPanPosition({ x: 0, y: 0 });
                                    }}
                                    disabled={zoomLevel === 1}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Navigation Arrows */}
                            {item.images.length > 1 && (
                                <>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomLevel(1);
                                            setPanPosition({ x: 0, y: 0 });
                                            setSelectedImageIndex(
                                                selectedImageIndex > 0
                                                    ? selectedImageIndex - 1
                                                    : item.images.length - 1
                                            );
                                        }}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomLevel(1);
                                            setPanPosition({ x: 0, y: 0 });
                                            setSelectedImageIndex(
                                                selectedImageIndex < item.images.length - 1
                                                    ? selectedImageIndex + 1
                                                    : 0
                                            );
                                        }}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                                        {selectedImageIndex + 1} / {item.images.length}
                                    </div>
                                </>
                            )}

                            {/* Zoom Level Indicator */}
                            {zoomLevel !== 1 && (
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                                    {Math.round(zoomLevel * 100)}%
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

