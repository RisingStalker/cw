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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, ZoomIn, ZoomOut, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslations, t } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type Category = { 
    id: number; 
    name: string;
    children?: Category[];
    level?: number;
};
type PriceTable = { id: number; year: number };
type ItemImage = { id: number; path: string; order: number; url: string };
type ItemVariation = {
    id: number;
    type: 'size' | 'color';
    name: string;
    surcharge: string;
    image_path?: string | null;
    short_text?: string | null;
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
    categoriesTree: Category[];
    priceTables: PriceTable[];
};

type Variation = {
    type: 'size' | 'color';
    name: string;
    surcharge: string;
    image?: File | null;
    short_text?: string;
    existing_image_path?: string | null;
    price_tables?: PriceTableEntry[];
};

type PriceTableEntry = {
    price_table_id: string;
    additional_cost: string;
};

export default function ItemsEdit() {
    const translations = useTranslations();
    const { item, categoriesTree, priceTables } = usePage<PageProps>().props;
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

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
                image: null,
                short_text: v.short_text || '',
                existing_image_path: v.image_path,
                price_tables: (v.priceTables || []).map((pt) => ({
                    price_table_id: pt.id.toString(),
                    surcharge: pt.pivot.surcharge,
                })),
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

    // Get selected category name
    const getSelectedCategoryName = () => {
        if (!data.category_id) return t('select_category', translations);
        
        const findCategory = (cats: Category[]): Category | null => {
            for (const cat of cats) {
                if (cat.id.toString() === data.category_id) return cat;
                if (cat.children) {
                    const found = findCategory(cat.children);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const found = findCategory(categoriesTree);
        return found ? found.name : t('select_category', translations);
    };

    const toggleCategoryExpand = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const renderCategoryTree = (categories: Category[], level: number = 0): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        
        categories.forEach((category) => {
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = data.category_id === category.id.toString();
            
            nodes.push(
                <div key={category.id}>
                    <div
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                            isSelected && "bg-accent"
                        )}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                        onClick={() => {
                            setData('category_id', category.id.toString());
                            setCategorySelectorOpen(false);
                        }}
                    >
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategoryExpand(category.id);
                                }}
                                className="group flex items-center justify-center w-8 h-8 -ml-1 rounded bg-background border border-border hover:bg-primary/10 hover:border-primary/50 hover:cursor-pointer transition-all duration-200 cursor-pointer"
                                aria-label={isExpanded ? t('collapse', translations) : t('expand', translations)}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-foreground/70 group-hover:text-primary transition-colors" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-foreground/70 group-hover:text-primary transition-colors" />
                                )}
                            </button>
                        ) : (
                            <span className="w-8" />
                        )}
                        <span className="flex-1 text-sm">{category.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    {hasChildren && isExpanded && category.children && (
                        <div>
                            {renderCategoryTree(category.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
        
        return nodes;
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
            { type: 'size', name: '', surcharge: '0', image: null, short_text: '', existing_image_path: null, price_tables: [] },
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


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('images', [...data.images, ...newFiles]);
        }
    };

    const removeNewImage = (index: number) => {
        const updatedImages = data.images.filter((_, i) => i !== index);
        setData('images', updatedImages);
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
                            <Popover open={categorySelectorOpen} onOpenChange={setCategorySelectorOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        <span className="truncate">
                                            {getSelectedCategoryName()}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                        {renderCategoryTree(categoriesTree)}
                                    </div>
                                </PopoverContent>
                            </Popover>
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
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {t('existing_images', translations) || 'Existing Images'}
                                </p>
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
                                                className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            </div>
                        )}
                        <div className="space-y-2">
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {errors.images && (
                                <p className="text-sm text-destructive">
                                    {errors.images}
                                </p>
                            )}
                        </div>
                        {data.images.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {data.images.length} {t('new_images_selected', translations) || 'new images selected'}
                                </p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {data.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square overflow-hidden rounded-lg border group"
                                        >
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`New preview ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeNewImage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                className="flex flex-col gap-3 rounded-lg border p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row">
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
                                {variation.existing_image_path && (
                                    <div className="relative w-32 h-32 rounded-lg border overflow-hidden">
                                        <img
                                            src={`/storage/${variation.existing_image_path}`}
                                            alt={variation.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('variation_image', translations)}
                                    </label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            updateVariation(index, 'image', file);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('short_text', translations)}
                                    </label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder={t('short_text_placeholder', translations)}
                                        value={variation.short_text || ''}
                                        onChange={(e) =>
                                            updateVariation(
                                                index,
                                                'short_text',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">
                                            {t('price_tables', translations)}
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const updated = [...data.variations];
                                                updated[index].price_tables = [
                                                    ...(updated[index].price_tables || []),
                                                    { price_table_id: '', surcharge: '0' },
                                                ];
                                                setData('variations', updated);
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('add_price_table', translations)}
                                        </Button>
                                    </div>
                                    {(variation.price_tables || []).map((pt, ptIndex) => (
                                        <div
                                            key={ptIndex}
                                            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row"
                                        >
                                            <Select
                                                value={pt.price_table_id}
                                                onValueChange={(value) => {
                                                    const updated = [...data.variations];
                                                    // Check if this price table is already selected in another row
                                                    const isDuplicate = updated[index].price_tables.some(
                                                        (otherPt, otherIndex) => 
                                                            otherIndex !== ptIndex && 
                                                            otherPt.price_table_id === value &&
                                                            value !== ''
                                                    );
                                                    
                                                    if (isDuplicate) {
                                                        alert(t('price_table_already_selected', translations) || 'This price table is already selected for this variation. Please select a different one.');
                                                        return;
                                                    }
                                                    
                                                    updated[index].price_tables[ptIndex].price_table_id = value;
                                                    setData('variations', updated);
                                                }}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder={t('select_price_table_placeholder', translations)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priceTables.map((table) => {
                                                        // Check if this price table is already selected in another row
                                                        const isSelected = variation.price_tables?.some(
                                                            (otherPt, otherIndex) => 
                                                                otherPt.price_table_id === table.id.toString() &&
                                                                otherPt.price_table_id !== pt.price_table_id
                                                        );
                                                        
                                                        return (
                                                            <SelectItem
                                                                key={table.id}
                                                                value={table.id.toString()}
                                                                disabled={isSelected}
                                                            >
                                                                {table.year} {isSelected && '(Already selected)'}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={t('surcharge_placeholder', translations)}
                                                value={pt.surcharge}
                                                onChange={(e) => {
                                                    const updated = [...data.variations];
                                                    updated[index].price_tables[ptIndex].surcharge = e.target.value;
                                                    setData('variations', updated);
                                                }}
                                                className="sm:w-40"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = [...data.variations];
                                                    updated[index].price_tables = updated[index].price_tables.filter((_, i) => i !== ptIndex);
                                                    setData('variations', updated);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
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

