import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations, t } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = {
    id: number;
    name: string;
    children?: Category[];
    level?: number;
};

type Item = {
    id: number;
    title: string;
    description?: string;
    additional_cost: string;
    requires_quantity: boolean;
    consultation_required: boolean;
    is_standard: boolean;
    hidden_until?: string;
    category?: Category;
    images_count?: number;
    variations_count?: number;
};

type Paginated<T> = {
    data: T[];
    meta?: {
        links: { url: string | null; label: string; active: boolean }[];
    };
};

type PageProps = {
    items: Paginated<Item>;
    categoriesTree: Category[];
    filters: {
        search?: string;
        category_id?: number;
    };
};

export default function ItemsIndex() {
    const translations = useTranslations();
    const { items, categoriesTree, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(
        filters.category_id?.toString() ?? '',
    );
    const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const breadcrumbs = useMemo(
        () => [
            {
                title: t('items', translations),
                href: admin.items.index().url,
            },
        ],
        [translations],
    );

    const getSelectedCategoryName = (): string => {
        if (!categoryId) return t('all_categories', translations);
        
        const findCategory = (cats: Category[]): Category | null => {
            for (const cat of cats) {
                if (cat.id.toString() === categoryId) return cat;
                if (cat.children) {
                    const found = findCategory(cat.children);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const category = findCategory(categoriesTree);
        return category ? category.name : t('all_categories', translations);
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
            const isSelected = categoryId === category.id.toString();
            
            nodes.push(
                <div key={category.id}>
                    <div
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                            isSelected && "bg-accent"
                        )}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                        onClick={() => {
                            setCategoryId(category.id.toString());
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

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            admin.items.index({
                query: {
                    search,
                    category_id: categoryId || undefined,
                },
            }).url,
        );
    };

    const handleDelete = (item: Item) => {
        if (!confirm(t('delete_item', translations))) {
            return;
        }

        router.delete(admin.items.destroy(item.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('items', translations)}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('manage_items_images_variations', translations)}
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={admin.items.create().url}>+ {t('new_item', translations)}</Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('search_items', translations)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        onSubmit={handleSearch}
                    >
                        <Input
                            placeholder={t('search_title_description', translations)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
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
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
                                            !categoryId && "bg-accent"
                                        )}
                                        onClick={() => {
                                            setCategoryId('');
                                            setCategorySelectorOpen(false);
                                        }}
                                    >
                                        <span className="w-4" />
                                        <span className="flex-1 text-sm">{t('all_categories', translations)}</span>
                                        {!categoryId && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                    {renderCategoryTree(categoriesTree)}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="flex gap-2">
                            <Button type="submit">{t('apply', translations)}</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setCategoryId('');
                                    router.get(admin.items.index().url);
                                }}
                            >
                                {t('reset', translations)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{t('item_list', translations)}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-border/50">
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('title', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('category', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('cost', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('flags', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('images', translations)}</th>
                                <th className="py-3 px-2 font-semibold text-foreground/80">{t('variations', translations)}</th>
                                <th className="py-3 px-2 text-right font-semibold text-foreground/80">{t('actions', translations)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border/30 hover:bg-accent/30 transition-colors duration-150"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="py-3 px-2">
                                        <div className="font-medium">
                                            {item.title}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {item.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-muted-foreground">
                                        {item.category?.name ?? '—'}
                                    </td>
                                    <td className="py-3 px-2">
                                        {item.additional_cost
                                            ? `€${parseFloat(item.additional_cost).toFixed(2)}`
                                            : item.consultation_required
                                                ? 'Consultation'
                                                : '—'}
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex flex-wrap gap-1">
                                            {item.is_standard && (
                                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {t('standard', translations)}
                                                </span>
                                            )}
                                            {item.requires_quantity && (
                                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {t('qty', translations)}
                                                </span>
                                            )}
                                            {item.consultation_required && (
                                                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                    {t('consult', translations)}
                                                </span>
                                            )}
                                            {item.hidden_until && (
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                    {t('hidden', translations)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {item.images_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                            {item.variations_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                asChild
                                                size="sm"
                                            >
                                                <Link
                                                    href={admin.items
                                                        .edit(item.id)
                                                        .url}
                                                >
                                                    {t('edit', translations)}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                            >
                                                {t('delete', translations)}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && (
                                <tr>
                                    <td
                                        className="py-12 text-center text-muted-foreground"
                                        colSpan={7}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-base">{t('no_items_found', translations)}</p>
                                            <p className="text-sm opacity-70">{t('create_first_item', translations)}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}



