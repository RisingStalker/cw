import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Link, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Category = { id: number; name: string };
type PriceTable = { id: number; year: number };

type PageProps = {
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

export default function ItemsCreate() {
    const { categories, priceTables } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        title: '',
        description: '',
        additional_cost: '0',
        requires_quantity: false,
        consultation_required: false,
        is_standard: false,
        hidden_until: '',
        images: [] as File[],
        variations: [] as Variation[],
        price_tables: [] as PriceTableEntry[],
    });

    const breadcrumbs = [
        { title: 'Items', href: admin.items.index().url },
        { title: 'Create', href: admin.items.create().url },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(admin.items.store().url, {
            forceFormData: true,
        });
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
                    <h1 className="text-3xl font-bold gradient-text mb-2">New Item</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new item with images, variations, and pricing.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={admin.items.index().url}>Back</Link>
                </Button>
            </div>

            <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Category *
                            </label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) =>
                                    setData('category_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
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
                                Title *
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
                                Description
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
                                Additional Cost (€) *
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
                                Hidden Until (Date)
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
                                    Customer can enter quantity
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
                                    Consultation Required
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
                                    Standard Option (no extra cost)
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {data.images.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {data.images.length} image(s) selected
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
                        <CardTitle>Variations</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariation}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Variation
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
                                        <SelectItem value="size">Size</SelectItem>
                                        <SelectItem value="color">
                                            Color
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Name (e.g., Large, Red)"
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
                                    placeholder="Surcharge"
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
                                No variations added. Click "Add Variation" to
                                add size or color options.
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
                        <CardTitle>Price Tables</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPriceTable}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Price Table
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
                                        <SelectValue placeholder="Select price table" />
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
                                    placeholder="Additional Cost"
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
                                No price tables added. Click "Add Price Table"
                                to add pricing for specific years.
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
                        <Link href={admin.items.index().url}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}



