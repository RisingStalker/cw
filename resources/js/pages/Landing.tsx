import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { ArrowRight, CheckCircle2, Home, Wrench, Building2, ChevronLeft, ChevronRight, BarChart3, Users, Shield, Zap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const heroImages = [
    // Modern kitchen with appliances and equipment
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1920&q=90',
    // Bathroom renovation with fixtures
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1920&q=90',
    // Construction site with building materials
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=90',
    // Modern living room with home equipment
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=90',
    // Home renovation project
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=90',
    // Interior design with home equipment installation
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=90',
];

const cardImages = [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80',
];

export default function Landing() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                    <Home className="h-6 w-6 text-primary" />
                    <span>Home Equipment</span>
                </Link>
                <div className="flex items-center gap-3">
                    <AppearanceToggleDropdown className="hidden sm:block" />
                    <Link
                        href="/login"
                        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="flex w-full flex-col">
                {/* Hero with Full-Width Background Slider */}
                <section className="relative min-h-[600px] w-full overflow-hidden">
                    {/* Background Slider */}
                    <div className="absolute inset-0">
                        <div className="relative h-full w-full">
                            {heroImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-700 ${
                                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Home equipment and construction project ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dark Overlay for Better Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

                    {/* Content Container */}
                    <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 py-20">
                        <div className="grid w-full grid-cols-1 gap-12 text-white lg:grid-cols-2 lg:items-center">
                            {/* First Column */}
                            <div className="space-y-6">
                                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm">
                                    Home Equipment Management · Project Tracking
                                </p>
                                <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                                    Manage your home equipment projects with
                                    <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                        {' '}
                                        precision and ease
                                    </span>
                                    .
                                </h1>
                                <p className="max-w-2xl text-lg text-white/90">
                                    Track construction projects, manage equipment categories, view detailed pricing,
                                    and organize your home equipment needs—all in one comprehensive platform.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-500/30 transition hover:brightness-110"
                                    >
                                        Login to your portal
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/20"
                                    >
                                        Create account
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                                    {[
                                        { label: 'Active Projects', value: 'Unlimited' },
                                        { label: 'Equipment Categories', value: 'All Types' },
                                        { label: 'Price Tables', value: 'Customizable' },
                                        { label: 'Project Tracking', value: 'Real-time' },
                                    ].map((stat) => (
                                        <div key={stat.label}>
                                            <p className="text-sm text-white/70">{stat.label}</p>
                                            <p className="text-xl font-semibold text-white">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Second Column */}
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 text-2xl font-bold text-white">
                                        Why Choose Our Platform?
                                    </h2>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                icon: BarChart3,
                                                title: 'Advanced Analytics',
                                                description: 'Track project progress with real-time analytics and detailed reporting.',
                                            },
                                            {
                                                icon: Users,
                                                title: 'Team Collaboration',
                                                description: 'Work seamlessly with your team and manage multiple projects efficiently.',
                                            },
                                            {
                                                icon: Shield,
                                                title: 'Secure & Reliable',
                                                description: 'Your data is protected with enterprise-grade security measures.',
                                            },
                                            {
                                                icon: Zap,
                                                title: 'Fast & Efficient',
                                                description: 'Streamlined workflows to save time and increase productivity.',
                                            },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 backdrop-blur-sm">
                                                    <feature.icon className="h-6 w-6 text-cyan-300" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-white">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-sm text-white/80">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 p-6 backdrop-blur-md">
                                    <h3 className="mb-3 text-xl font-bold text-white">Get Started Today</h3>
                                    <p className="mb-4 text-sm text-white/90">
                                        Join thousands of customers managing their home equipment projects with ease.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-white/90">
                                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                                            <span>Free account setup</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/90">
                                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                                            <span>No credit card required</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/90">
                                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                                            <span>24/7 customer support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {/* <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button> */}

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === currentSlide
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Rest of Content */}
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20 pt-20">

                {/* Steps / Offerings */}
                <section className="space-y-10">
                    <div className="text-center space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            Project Management
                        </p>
                        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                            Organize your home equipment projects by room and category
                        </h2>
                        <p className="text-muted-foreground max-w-3xl mx-auto">
                            Track construction projects for different rooms, manage equipment categories,
                            and access detailed pricing information for all your home equipment needs.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {[
                            {
                                title: 'Construction Projects',
                                subtitle: 'Track and manage all your home construction projects',
                                bullets: [
                                    'Organize projects by room, floor, or building',
                                    'View project details and equipment requirements',
                                    'Monitor progress and track project status',
                                ],
                            },
                            {
                                title: 'Equipment Categories',
                                subtitle: 'Browse and manage home equipment by category',
                                bullets: [
                                    'Kitchen equipment and appliances',
                                    'Bathroom fixtures and fittings',
                                    'Living room and bedroom furniture',
                                ],
                            },
                            {
                                title: 'Price Tables',
                                subtitle: 'Access detailed pricing for all equipment items',
                                bullets: [
                                    'View item prices across different price tables',
                                    'Compare costs and additional charges',
                                    'Make informed purchasing decisions',
                                ],
                            },
                        ].map((card, idx) => (
                            <div
                                key={card.title}
                                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-black/10"
                            >
                                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20" />
                                </div>
                                <div className="relative space-y-4">
                                    <div className="overflow-hidden rounded-xl border border-white/10">
                                        <img
                                            src={cardImages[idx]}
                                            alt={card.title}
                                            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {idx === 0 && <Building2 className="h-6 w-6 text-primary" />}
                                        {idx === 1 && <Home className="h-6 w-6 text-primary" />}
                                        {idx === 2 && <Wrench className="h-6 w-6 text-primary" />}
                                        <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                                    </div>
                                    <p className="text-sm text-primary/80">{card.subtitle}</p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {card.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/20 p-8 shadow-2xl shadow-primary/20 md:p-12">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                Get Started Today
                            </p>
                            <h3 className="text-3xl font-bold text-foreground">
                                Start managing your home equipment projects now.
                            </h3>
                            <p className="text-muted-foreground">
                                Login to access your projects or create a new account to begin tracking
                                your home equipment and construction projects.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:shadow-xl"
                            >
                                Login
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
                            >
                                Create account
                            </Link>
                        </div>
                    </div>
                </section>
                </div>
            </main>
        </div>
    );
}


