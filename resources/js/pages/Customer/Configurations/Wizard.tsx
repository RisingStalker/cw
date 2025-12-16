import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerLayout from '@/layouts/customer-layout';
import { index as configurationsIndex, update as updateConfiguration } from '@/routes/configurations';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

interface ItemVariation {
    id: number;
    type: string;
    name: string;
    surcharge: string;
}

interface ItemImage {
    id: number;
    path: string;
    order: number;
}

interface Item {
    id: number;
    title: string;
    description: string;
    additional_cost: string;
    requires_quantity: boolean;
    consultation_required: boolean;
    is_standard: boolean;
    variations: ItemVariation[];
    images: ItemImage[];
}

interface Category {
    id: number;
    name: string;
    order: number;
    items: Item[];
}

interface ProjectRoom {
    id: number;
    name: string;
    floor_space: string;
    prohibited_floors: number[];
}

interface ProjectBathroom {
    id: number;
    room_number: number;
    has_toilet: boolean;
    has_shower: boolean;
    has_bathtub: boolean;
}

interface ConfigurationItem {
    id: number;
    item_id: number;
    item_variation_id: number | null;
    quantity: number | null;
    project_room_id: number | null;
    project_bathroom_id: number | null;
    item?: Item;
    itemVariation?: ItemVariation;
}

interface Configuration {
    id: number;
    name: string;
    is_locked: boolean;
    last_position: { categoryId?: number } | null;
    configurationItems: ConfigurationItem[];
}

interface Project {
    id: number;
    name: string;
    facade_area: string;
    balcony_meters: string;
    interior_balustrade_meters: string;
    rooms: ProjectRoom[];
    bathrooms: ProjectBathroom[];
}

interface PageProps {
    project: Project;
    configuration: Configuration;
    categories: Category[];
    priceTable: { id: number; year: number } | null;
}

interface SelectedItem {
    item_id: number;
    item_variation_id?: number | null;
    quantity?: number | null;
    project_room_id?: number | null;
    project_bathroom_id?: number | null;
}

export default function ConfigurationWizard({ project, configuration, categories, priceTable }: PageProps) {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());
    const [expandedBathrooms, setExpandedBathrooms] = useState<Set<number>>(new Set());

    // Initialize selected items from configuration
    useEffect(() => {
        if (configuration.configurationItems) {
            const items = configuration.configurationItems.map((ci) => ({
                item_id: ci.item_id,
                item_variation_id: ci.item_variation_id,
                quantity: ci.quantity,
                project_room_id: ci.project_room_id,
                project_bathroom_id: ci.project_bathroom_id,
            }));
            setSelectedItems(items);
        }
    }, [configuration]);

    // Restore last position
    useEffect(() => {
        if (configuration.last_position?.categoryId) {
            const categoryIndex = categories.findIndex((c) => c.id === configuration.last_position?.categoryId);
            if (categoryIndex >= 0) {
                setCurrentCategoryIndex(categoryIndex);
            }
        }
    }, [configuration.last_position, categories]);

    const { data, setData, put, processing } = useForm({
        name: configuration.name,
        last_position: { categoryId: categories[currentCategoryIndex]?.id },
        items: selectedItems,
    });

    // Autosave functionality
    useEffect(() => {
        const autosaveTimer = setTimeout(() => {
            if (selectedItems.length > 0 || configuration.name) {
                setData('items', selectedItems);
                setData('last_position', { categoryId: categories[currentCategoryIndex]?.id });
                put(updateConfiguration({ project: project.id, configuration: configuration.id }).url, {
                    preserveScroll: true,
                    only: ['configuration'],
                });
            }
        }, 5000); // Autosave every 5 seconds

        return () => clearTimeout(autosaveTimer);
    }, [selectedItems, configuration.name, currentCategoryIndex]);


    const currentCategory = categories[currentCategoryIndex];
    const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

    // Calculate total cost with proper calculation logic
    const totalCost = useMemo(() => {
        return selectedItems.reduce((total, selected) => {
            const item = categories
                .flatMap((c) => c.items)
                .find((i) => i.id === selected.item_id);
            if (!item) return total;

            let itemCost = parseFloat(item.additional_cost || '0');
            if (selected.item_variation_id) {
                const variation = item.variations.find((v) => v.id === selected.item_variation_id);
                if (variation) {
                    itemCost += parseFloat(variation.surcharge || '0');
                }
            }

            // Calculate based on item type and context
            let calculatedCost = itemCost;

            // Flooring: cost per m² × room area
            if (selected.project_room_id) {
                const room = project.rooms.find((r) => r.id === selected.project_room_id);
                if (room && currentCategory?.name.toLowerCase().includes('floor')) {
                    calculatedCost = itemCost * parseFloat(room.floor_space || '0');
                } else {
                    calculatedCost = itemCost * (selected.quantity || 1);
                }
            }
            // Facade: cost per m² × facade area
            else if (currentCategory?.name.toLowerCase().includes('facade')) {
                calculatedCost = itemCost * parseFloat(project.facade_area || '0');
            }
            // Ventilation: cost per room × number of rooms
            else if (currentCategory?.name.toLowerCase().includes('ventilation')) {
                calculatedCost = itemCost * project.rooms.length;
            }
            // Bathroom items: per bathroom
            else if (selected.project_bathroom_id) {
                calculatedCost = itemCost;
            }
            // Quantity-based items
            else if (item.requires_quantity) {
                calculatedCost = itemCost * (selected.quantity || 1);
            }
            // Default: single item cost
            else {
                calculatedCost = itemCost;
            }

            return total + calculatedCost;
        }, 0);
    }, [selectedItems, categories, project, currentCategory]);

    const toggleItem = (itemId: number, roomId?: number, bathroomId?: number) => {
        setSelectedItems((prev) => {
            const existingIndex = prev.findIndex(
                (si) =>
                    si.item_id === itemId &&
                    si.project_room_id === roomId &&
                    si.project_bathroom_id === bathroomId
            );

            if (existingIndex >= 0) {
                return prev.filter((_, index) => index !== existingIndex);
            } else {
                return [
                    ...prev,
                    {
                        item_id: itemId,
                        project_room_id: roomId,
                        project_bathroom_id: bathroomId,
                    },
                ];
            }
        });
    };

    const isItemSelected = (itemId: number, roomId?: number, bathroomId?: number) => {
        return selectedItems.some(
            (si) =>
                si.item_id === itemId &&
                si.project_room_id === roomId &&
                si.project_bathroom_id === bathroomId
        );
    };

    const updateItemVariation = (itemId: number, variationId: number | null, roomId?: number, bathroomId?: number) => {
        setSelectedItems((prev) => {
            const index = prev.findIndex(
                (si) =>
                    si.item_id === itemId &&
                    si.project_room_id === roomId &&
                    si.project_bathroom_id === bathroomId
            );
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], item_variation_id: variationId };
                return updated;
            }
            return prev;
        });
    };

    const updateItemQuantity = (itemId: number, quantity: number, roomId?: number, bathroomId?: number) => {
        setSelectedItems((prev) => {
            const index = prev.findIndex(
                (si) =>
                    si.item_id === itemId &&
                    si.project_room_id === roomId &&
                    si.project_bathroom_id === bathroomId
            );
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], quantity };
                return updated;
            }
            return prev;
        });
    };

    const handleSave = () => {
        setData('items', selectedItems);
        setData('last_position', { categoryId: currentCategory?.id });
        put(updateConfiguration({ project: project.id, configuration: configuration.id }).url, {
            preserveScroll: true,
        });
    };

    const nextCategory = () => {
        if (currentCategoryIndex < categories.length - 1) {
            setCurrentCategoryIndex(currentCategoryIndex + 1);
        }
    };

    const prevCategory = () => {
        if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(currentCategoryIndex - 1);
        }
    };

    const isProhibited = (item: Item, room?: ProjectRoom) => {
        if (!room || !room.prohibited_floors) {
            return false;
        }
        // Check if this item's ID is in the prohibited floors list
        return room.prohibited_floors.includes(item.id);
    };

    return (
        <CustomerLayout>
            <Head title={`Configure - ${configuration.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={configurationsIndex({ project: project.id }).url}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{configuration.name}</h1>
                            <p className="text-muted-foreground mt-2">Configure your project: {project.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Additional Cost</div>
                            <div className="text-2xl font-bold">€{totalCost.toFixed(2)}</div>
                        </div>
                        <Button onClick={handleSave} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Progress
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span>
                                Category {currentCategoryIndex + 1} of {categories.length}: {currentCategory?.name}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardContent>
                </Card>

                {/* Category Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category, index) => (
                        <Button
                            key={category.id}
                            variant={index === currentCategoryIndex ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentCategoryIndex(index)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Current Category Content */}
                {currentCategory && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{currentCategory.name}</CardTitle>
                                <CardDescription>Select items for this category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Standard option (must be selected) */}
                                {currentCategory.items
                                    .filter((item) => item.is_standard)
                                    .map((item) => (
                                        <div key={item.id} className="flex items-start gap-4 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                                            <Checkbox
                                                checked={isItemSelected(item.id)}
                                                onCheckedChange={() => toggleItem(item.id)}
                                                className="mt-1"
                                                required
                                            />
                                            <div className="flex-1">
                                                <Label className="text-base font-medium">{item.title}</Label>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Standard Option (No Extra Cost) - Required
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                {/* Electrical Installation Notice */}
                                {currentCategory.name.toLowerCase().includes('electrical') && (
                                    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
                                        <p className="font-medium text-orange-800 dark:text-orange-200">
                                            Note: You will receive a separate quote for electrical installation.
                                        </p>
                                    </div>
                                )}

                                {/* Room-specific items (e.g., flooring) */}
                                {project.rooms.length > 0 && currentCategory.name.toLowerCase().includes('floor') && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Room Flooring</h3>
                                        {project.rooms.map((room) => (
                                            <Collapsible
                                                key={room.id}
                                                open={expandedRooms.has(room.id)}
                                                onOpenChange={(open) => {
                                                    const newSet = new Set(expandedRooms);
                                                    if (open) {
                                                        newSet.add(room.id);
                                                    } else {
                                                        newSet.delete(room.id);
                                                    }
                                                    setExpandedRooms(newSet);
                                                }}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between">
                                                        {room.name} ({room.floor_space} m²)
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-2 space-y-2">
                                                    {currentCategory.items
                                                        .filter((item) => !item.is_standard)
                                                        .map((item) => {
                                                            const isProhibitedItem = isProhibited(item, room);
                                                            return (
                                                                <div
                                                                    key={`${item.id}-${room.id}`}
                                                                    className={`flex items-start gap-4 rounded-lg border p-4 ${
                                                                        isProhibitedItem ? 'opacity-50' : ''
                                                                    }`}
                                                                >
                                                                    <Checkbox
                                                                        checked={isItemSelected(item.id, room.id)}
                                                                        onCheckedChange={() => toggleItem(item.id, room.id)}
                                                                        disabled={isProhibitedItem}
                                                                        className="mt-1"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-start justify-between">
                                                                            <div>
                                                                                <Label className="text-base font-medium">{item.title}</Label>
                                                                                {item.description && (
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        {item.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-lg font-bold">
                                                                                    €{(parseFloat(item.additional_cost || '0') * parseFloat(room.floor_space)).toFixed(2)}
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    ({room.floor_space} m² × €{parseFloat(item.additional_cost || '0').toFixed(2)})
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                )}

                                {/* Bathroom-specific items */}
                                {project.bathrooms.length > 0 && currentCategory.name.toLowerCase().includes('bathroom') && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Bathroom Options</h3>
                                        {project.bathrooms.map((bathroom) => (
                                            <Collapsible
                                                key={bathroom.id}
                                                open={expandedBathrooms.has(bathroom.id)}
                                                onOpenChange={(open) => {
                                                    const newSet = new Set(expandedBathrooms);
                                                    if (open) {
                                                        newSet.add(bathroom.id);
                                                    } else {
                                                        newSet.delete(bathroom.id);
                                                    }
                                                    setExpandedBathrooms(newSet);
                                                }}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between">
                                                        Bathroom {bathroom.room_number}
                                                        {bathroom.has_toilet && <span className="ml-2 text-xs">Toilet</span>}
                                                        {bathroom.has_shower && <span className="ml-2 text-xs">Shower</span>}
                                                        {bathroom.has_bathtub && <span className="ml-2 text-xs">Bathtub</span>}
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-2 space-y-2">
                                                    {currentCategory.items
                                                        .filter((item) => !item.is_standard)
                                                        .map((item) => (
                                                            <div
                                                                key={`${item.id}-${bathroom.id}`}
                                                                className="flex items-start gap-4 rounded-lg border p-4"
                                                            >
                                                                <Checkbox
                                                                    checked={isItemSelected(item.id, undefined, bathroom.id)}
                                                                    onCheckedChange={() => toggleItem(item.id, undefined, bathroom.id)}
                                                                    className="mt-1"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <Label className="text-base font-medium">{item.title}</Label>
                                                                            {item.description && (
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {item.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg font-bold">
                                                                                €{parseFloat(item.additional_cost || '0').toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                )}

                                {/* Facade items */}
                                {currentCategory.name.toLowerCase().includes('facade') && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Facade Options</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Facade area: {project.facade_area} m²
                                        </p>
                                        {currentCategory.items
                                            .filter((item) => !item.is_standard)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-4 rounded-lg border p-4"
                                                >
                                                    <Checkbox
                                                        checked={isItemSelected(item.id)}
                                                        onCheckedChange={() => toggleItem(item.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Label className="text-base font-medium">{item.title}</Label>
                                                                {item.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold">
                                                                    €{(parseFloat(item.additional_cost || '0') * parseFloat(project.facade_area || '0')).toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    ({project.facade_area} m² × €{parseFloat(item.additional_cost || '0').toFixed(2)})
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Ventilation items */}
                                {currentCategory.name.toLowerCase().includes('ventilation') && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Ventilation System</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Number of rooms: {project.rooms.length}
                                        </p>
                                        {currentCategory.items
                                            .filter((item) => !item.is_standard)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-4 rounded-lg border p-4"
                                                >
                                                    <Checkbox
                                                        checked={isItemSelected(item.id)}
                                                        onCheckedChange={() => toggleItem(item.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Label className="text-base font-medium">{item.title}</Label>
                                                                {item.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold">
                                                                    €{(parseFloat(item.additional_cost || '0') * project.rooms.length).toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    (€{parseFloat(item.additional_cost || '0').toFixed(2)} × {project.rooms.length} rooms)
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Regular items (non-room/bathroom/facade/ventilation specific) */}
                                {!currentCategory.name.toLowerCase().includes('floor') &&
                                    !currentCategory.name.toLowerCase().includes('bathroom') &&
                                    !currentCategory.name.toLowerCase().includes('facade') &&
                                    !currentCategory.name.toLowerCase().includes('ventilation') &&
                                    currentCategory.items
                                        .filter((item) => !item.is_standard)
                                        .map((item) => {
                                            const isProhibitedItem = false;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-start gap-4 rounded-lg border p-4 ${
                                                        isProhibitedItem ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={isItemSelected(item.id)}
                                                        onCheckedChange={() => toggleItem(item.id)}
                                                        disabled={isProhibitedItem}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Label className="text-base font-medium">{item.title}</Label>
                                                                {item.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                                {item.consultation_required && (
                                                                    <p className="mt-1 text-sm font-medium text-orange-600">
                                                                        Consultation Required
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold">
                                                                    €{parseFloat(item.additional_cost || '0').toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isItemSelected(item.id) && (
                                                            <div className="mt-4 space-y-3">
                                                                {item.variations.length > 0 && (
                                                                    <div>
                                                                        <Label>Variation</Label>
                                                                        <Select
                                                                            value={
                                                                                selectedItems.find((si) => si.item_id === item.id)
                                                                                    ?.item_variation_id?.toString() || ''
                                                                            }
                                                                            onValueChange={(value) =>
                                                                                updateItemVariation(
                                                                                    item.id,
                                                                                    value ? parseInt(value) : null
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select variation" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="">None</SelectItem>
                                                                                {item.variations.map((variation) => (
                                                                                    <SelectItem
                                                                                        key={variation.id}
                                                                                        value={variation.id.toString()}
                                                                                    >
                                                                                        {variation.name} (+
                                                                                        €{parseFloat(variation.surcharge || '0').toFixed(2)})
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}

                                                                {item.requires_quantity && (
                                                                    <div>
                                                                        <Label>Quantity</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            value={
                                                                                selectedItems.find((si) => si.item_id === item.id)
                                                                                    ?.quantity || 1
                                                                            }
                                                                            onChange={(e) =>
                                                                                updateItemQuantity(
                                                                                    item.id,
                                                                                    parseInt(e.target.value) || 1
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button onClick={prevCategory} disabled={currentCategoryIndex === 0} variant="outline">
                        Previous
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} variant="outline" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save & Exit
                        </Button>
                        <Button onClick={nextCategory} disabled={currentCategoryIndex === categories.length - 1}>
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

