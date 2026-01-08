import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = {
    id: number;
    name: string;
    children?: Category[];
    level?: number;
};

type PageProps = {
    nextOrder: number;
    parentCategoriesTree: Category[];
};

export default function CategoriesCreate() {
    const translations = useTranslations();
    const { nextOrder, parentCategoriesTree } = usePage<PageProps>().props;
    const [parentSelectorOpen, setParentSelectorOpen] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        order: nextOrder,
        parent_id: '',
        scope: 'room',
    });

    // Get selected category name
    const getSelectedCategoryName = () => {
        if (!data.parent_id) return t('no_parent_category', translations);
        
        const findCategory = (cats: Category[]): Category | null => {
            for (const cat of cats) {
                if (cat.id.toString() === data.parent_id) return cat;
                if (cat.children) {
                    const found = findCategory(cat.children);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const found = findCategory(parentCategoriesTree);
        return found ? found.name : t('no_parent_category', translations);
    };

    const toggleParentExpand = (categoryId: number) => {
        setExpandedParents((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Check if category can be selected (max 3 levels)
    const canSelectCategory = (category: Category): boolean => {
        const level = category.level || 0;
        return level < 2; // Level 0, 1, or 2 (max 3 levels: 0->1->2)
    };

    const renderCategoryTree = (categories: Category[], level: number = 0): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        
        categories.forEach((category) => {
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = expandedParents.has(category.id);
            const canSelect = canSelectCategory(category);
            const isSelected = data.parent_id === category.id.toString();
            
            nodes.push(
                <div key={category.id}>
                    <div
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                            isSelected && "bg-accent",
                            !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                        onClick={() => {
                            if (canSelect) {
                                setData('parent_id', category.id.toString());
                                setParentSelectorOpen(false);
                            }
                        }}
                    >
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleParentExpand(category.id);
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
                        {!canSelect && (
                            <span className="text-xs text-muted-foreground">
                                ({t('max_level_reached', translations)})
                            </span>
                        )}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('parent_category', translations)}
                            </label>
                            <Popover open={parentSelectorOpen} onOpenChange={setParentSelectorOpen}>
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
                                    <div className="p-2">
                                        <div
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors"
                                            onClick={() => {
                                                setData('parent_id', '');
                                                setParentSelectorOpen(false);
                                            }}
                                        >
                                            <span className="w-4" />
                                            <span className="flex-1 text-sm">{t('no_parent_category', translations)}</span>
                                            {!data.parent_id && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                        <div className="mt-1 max-h-[300px] overflow-y-auto">
                                            {renderCategoryTree(parentCategoriesTree)}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                {t('parent_category_description', translations)}
                            </p>
                            {errors.parent_id && (
                                <p className="text-sm text-destructive">
                                    {errors.parent_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('scope', translations)} *
                            </label>
                            <Select
                                value={data.scope}
                                onValueChange={(value) =>
                                    setData('scope', value as 'whole_house' | 'room')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="whole_house">
                                        {t('whole_house', translations)}
                                    </SelectItem>
                                    <SelectItem value="room">
                                        {t('room_specific', translations)}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {t('scope_description', translations)}
                            </p>
                            {errors.scope && (
                                <p className="text-sm text-destructive">
                                    {errors.scope}
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



