import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { index as configurationsIndex, wizard as wizardConfiguration, exportMethod as exportConfiguration, lock, copy } from '@/routes/configurations';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Copy, Download, Edit, Lock } from 'lucide-react';

interface ConfigurationItem {
    id: number;
    item_id: number;
    item_variation_id: number | null;
    quantity: number | null;
    project_room_id: number | null;
    project_bathroom_id: number | null;
    item?: {
        id: number;
        title: string;
        additional_cost: string;
        category?: {
            name: string;
        };
    };
    itemVariation?: {
        name: string;
        surcharge: string;
    };
    projectRoom?: {
        name: string;
    };
    projectBathroom?: {
        room_number: number;
    };
}

interface Configuration {
    id: number;
    name: string;
    is_completed: boolean;
    is_locked: boolean;
    created_at: string;
    configurationItems?: ConfigurationItem[];
}

interface Project {
    id: number;
    name: string;
}

interface PageProps {
    project: Project;
    configuration: Configuration;
}

export default function ConfigurationShow({ project, configuration }: PageProps) {
    const configurationItems = configuration.configurationItems || [];

    const totalCost = configurationItems.reduce((total, item) => {
        const baseCost = parseFloat(item.item?.additional_cost || '0');
        const variationSurcharge = parseFloat(item.itemVariation?.surcharge || '0');
        const quantity = item.quantity || 1;
        return total + (baseCost + variationSurcharge) * quantity;
    }, 0);

    const handleLock = () => {
        if (confirm('Are you sure you want to lock this configuration? It cannot be edited after locking.')) {
            router.post(lock({ project: project.id, configuration: configuration.id }).url);
        }
    };

    const handleCopy = () => {
        router.post(copy({ project: project.id, configuration: configuration.id }).url);
    };

    // Group items by category
    const itemsByCategory = configurationItems.reduce((acc, item) => {
        const categoryName = item.item?.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {} as Record<string, ConfigurationItem[]>);

    return (
        <CustomerLayout>
            <Head title={`${configuration.name} - Configuration`} />

            <div className="space-y-6">
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
                            <p className="text-muted-foreground mt-2">Project: {project.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!configuration.is_locked && (
                            <Link href={wizardConfiguration({ project: project.id, configuration: configuration.id }).url}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {!configuration.is_locked && (
                            <Button variant="outline" onClick={handleLock}>
                                <Lock className="mr-2 h-4 w-4" />
                                Lock
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <a
                            href={exportConfiguration({ project: project.id, configuration: configuration.id }).url}
                            target="_blank"
                        >
                            <Button>
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        </a>
                    </div>
                </div>

                {configuration.is_locked && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CardContent className="pt-6">
                            <p className="font-medium text-green-800 dark:text-green-200">
                                This configuration is locked and cannot be modified.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Configuration Summary</CardTitle>
                        <CardDescription>
                            Created on {new Date(configuration.created_at).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {configurationItems.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No items in this configuration yet.
                                </div>
                            ) : (
                                Object.entries(itemsByCategory).map(([categoryName, items]) => (
                                <div key={categoryName}>
                                    <h3 className="mb-3 text-lg font-semibold">{categoryName}</h3>
                                    <div className="space-y-2">
                                        {items.map((item) => {
                                            const baseCost = parseFloat(item.item?.additional_cost || '0');
                                            const variationSurcharge = parseFloat(item.itemVariation?.surcharge || '0');
                                            const quantity = item.quantity || 1;
                                            const itemTotal = (baseCost + variationSurcharge) * quantity;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div>
                                                        <div className="font-medium">{item.item?.title}</div>
                                                        {item.itemVariation && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Variation: {item.itemVariation.name}
                                                            </div>
                                                        )}
                                                        {item.projectRoom && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Room: {item.projectRoom.name}
                                                            </div>
                                                        )}
                                                        {item.projectBathroom && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Bathroom: {item.projectBathroom.room_number}
                                                            </div>
                                                        )}
                                                        {item.quantity && item.quantity > 1 && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Quantity: {item.quantity}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold">€{itemTotal.toFixed(2)}</div>
                                                        {quantity > 1 && (
                                                            <div className="text-xs text-muted-foreground">
                                                                €{(baseCost + variationSurcharge).toFixed(2)} × {quantity}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">Total Additional Cost</span>
                                <span className="text-2xl font-bold">€{totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}

