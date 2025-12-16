import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useInitials } from '@/hooks/use-initials';
import { index as projectsIndex } from '@/routes/projects';
import { logout } from '@/routes';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, User } from 'lucide-react';
import AppLogo from './app-logo';

export function CustomerHeader() {
    const page = usePage<SharedData & { customer?: { user?: { id: number; name: string; email: string } | null } }>();
    const customer = page.props.customer?.user;
    const getInitials = useInitials();

    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href={projectsIndex().url} className="flex items-center space-x-2">
                    <AppLogo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center space-x-6 md:flex">
                    <Link
                        href={projectsIndex().url}
                        className="text-sm font-medium transition-colors hover:text-primary"
                    >
                        My Projects
                    </Link>
                </nav>

                {/* Right Side - User Menu */}
                <div className="flex items-center space-x-4">
                    {customer ? (
                        <>
                            {/* Desktop User Menu */}
                            <div className="hidden md:block">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-10 w-10 rounded-full"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={undefined}
                                                    alt={customer.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(customer.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                        forceMount
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {customer.name}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={projectsIndex().url}
                                                className="w-full cursor-pointer"
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                My Projects
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Mobile Menu */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                    >
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right">
                                    <SheetHeader>
                                        <SheetTitle>Menu</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 flex flex-col space-y-4">
                                        <Link
                                            href={projectsIndex().url}
                                            className="text-sm font-medium"
                                        >
                                            My Projects
                                        </Link>
                                        <div className="border-t pt-4">
                                            <div className="mb-4 flex items-center space-x-2">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={undefined}
                                                        alt={customer.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(customer.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {customer.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log out
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


