import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslations, t } from '@/hooks/use-translations';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Users, FolderKanban, Package, FolderTree, Table, FileText, TrendingUp } from 'lucide-react';

type StatCard = {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
};

type PageProps = {
    stats: {
        customers: number;
        projects: number;
        items: number;
        categories: number;
        price_tables: number;
        configurations: number;
        active_price_tables: number;
    };
    itemsByCategory: Array<{ name: string; count: number }>;
    projectsOverTime: Array<{ month: string; count: number }>;
    customersOverTime: Array<{ month: string; count: number }>;
    priceTableDistribution: Array<{ name: string; value: number; year: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
    recentCustomers: Array<{
        id: number;
        name: string;
        email: string;
        projects_count: number;
        created_at: string;
    }>;
    recentProjects: Array<{
        id: number;
        name: string;
        customer_name: string;
        price_table_year: string | number;
        created_at: string;
    }>;
    recentConfigurations: Array<{
        id: number;
        name: string;
        project_name: string;
        customer_name: string;
        is_locked: boolean;
        is_completed: boolean;
        created_at: string;
    }>;
    itemsWithVariations: Array<{
        id: number;
        title: string;
        variations_count: number;
    }>;
};

const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
];

export default function Dashboard() {
    const translations = useTranslations();
    const { stats, itemsByCategory, projectsOverTime, customersOverTime, priceTableDistribution, categoryDistribution, recentCustomers, recentProjects, recentConfigurations, itemsWithVariations } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard', translations),
            href: admin.dashboard().url,
        },
    ];

    const statCards: StatCard[] = [
        {
            title: t('customers', translations),
            value: stats.customers,
            icon: <Users className="h-5 w-5" />,
            color: 'text-blue-600',
        },
        {
            title: t('projects', translations),
            value: stats.projects,
            icon: <FolderKanban className="h-5 w-5" />,
            color: 'text-green-600',
        },
        {
            title: t('items', translations),
            value: stats.items,
            icon: <Package className="h-5 w-5" />,
            color: 'text-purple-600',
        },
        {
            title: t('categories', translations),
            value: stats.categories,
            icon: <FolderTree className="h-5 w-5" />,
            color: 'text-orange-600',
        },
        {
            title: t('price_tables', translations),
            value: stats.price_tables,
            icon: <Table className="h-5 w-5" />,
            color: 'text-red-600',
        },
        {
            title: t('configurations', translations),
            value: stats.configurations,
            icon: <FileText className="h-5 w-5" />,
            color: 'text-indigo-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard', translations)} />
            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <div className={card.color}>{card.icon}</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                {card.title === t('price_tables', translations) && (
                                    <p className="text-xs text-muted-foreground">
                                        {stats.active_price_tables} {t('active', translations)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Items by Category - Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('items_by_category', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={itemsByCategory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        fontSize={12}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Price Table Distribution - Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('price_table_distribution', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={priceTableDistribution.filter((item) => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {priceTableDistribution
                                            .filter((item) => item.value > 0)
                                            .map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Projects and Customers Over Time - Line Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('projects_over_time', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={projectsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name={t('projects', translations)}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Customers Over Time - Line Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('customers_over_time', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={customersOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name={t('customers', translations)}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Distribution - Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('category_distribution', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryDistribution.filter((item) => item.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryDistribution
                                        .filter((item) => item.value > 0)
                                        .map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Tables Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Customers Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('recent_customers', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2">{t('name', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('email', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('projects', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('created_at', translations)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentCustomers.length > 0 ? (
                                            recentCustomers.map((customer) => (
                                                <tr key={customer.id} className="border-b">
                                                    <td className="py-2 px-2">{customer.name}</td>
                                                    <td className="py-2 px-2 text-muted-foreground">
                                                        {customer.email}
                                                    </td>
                                                    <td className="py-2 px-2">{customer.projects_count}</td>
                                                    <td className="py-2 px-2 text-muted-foreground">
                                                        {customer.created_at}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    {t('no_data', translations)}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Projects Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('recent_projects', translations)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2">{t('name', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('customer', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('price_table', translations)}</th>
                                            <th className="text-left py-2 px-2">{t('created_at', translations)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProjects.length > 0 ? (
                                            recentProjects.map((project) => (
                                                <tr key={project.id} className="border-b">
                                                    <td className="py-2 px-2">{project.name}</td>
                                                    <td className="py-2 px-2 text-muted-foreground">
                                                        {project.customer_name}
                                                    </td>
                                                    <td className="py-2 px-2">{project.price_table_year}</td>
                                                    <td className="py-2 px-2 text-muted-foreground">
                                                        {project.created_at}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    {t('no_data', translations)}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Configurations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('recent_configurations', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-2">{t('name', translations)}</th>
                                        <th className="text-left py-2 px-2">{t('project', translations)}</th>
                                        <th className="text-left py-2 px-2">{t('customer', translations)}</th>
                                        <th className="text-left py-2 px-2">{t('status', translations)}</th>
                                        <th className="text-left py-2 px-2">{t('created_at', translations)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentConfigurations.length > 0 ? (
                                        recentConfigurations.map((config) => (
                                            <tr key={config.id} className="border-b">
                                                <td className="py-2 px-2">{config.name}</td>
                                                <td className="py-2 px-2 text-muted-foreground">
                                                    {config.project_name}
                                                </td>
                                                <td className="py-2 px-2 text-muted-foreground">
                                                    {config.customer_name}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <div className="flex gap-2">
                                                        {config.is_locked && (
                                                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {t('locked', translations)}
                                                            </span>
                                                        )}
                                                        {config.is_completed && (
                                                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                {t('completed', translations)}
                                                            </span>
                                                        )}
                                                        {!config.is_locked && !config.is_completed && (
                                                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                                {t('in_progress', translations)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-muted-foreground">
                                                    {config.created_at}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                {t('no_data', translations)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Items with Most Variations */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('items_with_most_variations', translations)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-2">{t('item', translations)}</th>
                                        <th className="text-left py-2 px-2">{t('variations', translations)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsWithVariations.length > 0 ? (
                                        itemsWithVariations.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="py-2 px-2">{item.title}</td>
                                                <td className="py-2 px-2">
                                                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                                        {item.variations_count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                {t('no_data', translations)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
