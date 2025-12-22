<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background: oklch(0.99 0.005 270);
                background-image: 
                    radial-gradient(at 0% 0%, oklch(0.55 0.22 240 / 0.05) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, oklch(0.6 0.2 280 / 0.05) 0px, transparent 50%);
                background-attachment: fixed;
            }

            html.dark {
                background: oklch(0.12 0.015 270);
                background-image: 
                    radial-gradient(at 0% 0%, oklch(0.65 0.25 200 / 0.08) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, oklch(0.6 0.2 280 / 0.08) 0px, transparent 50%);
                background-attachment: fixed;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=jetbrains-mono:400,500" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
