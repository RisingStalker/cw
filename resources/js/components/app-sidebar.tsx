import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import admin from '@/routes/admin';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    Folder,
    LayoutGrid,
    Layers,
    Package,
    Table,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslations, t } from '@/hooks/use-translations';

export function AppSidebar() {
    const translations = useTranslations();

    const mainNavItems: NavItem[] = [
        {
            title: t('dashboard', translations),
            href: admin.dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('customers', translations),
            href: admin.customers.index(),
            icon: Users,
        },
        {
            title: t('projects', translations),
            href: admin.constructionProjects.index(),
            icon: ClipboardList,
        },
        {
            title: t('items', translations),
            href: admin.items.index(),
            icon: Package,
        },
        {
            title: t('categories', translations),
            href: admin.categories.index(),
            icon: Layers,
        },
        {
            title: t('price_tables', translations),
            href: admin.priceTables.index(),
            icon: Table,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('repository', translations),
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: t('documentation', translations),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={admin.dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
