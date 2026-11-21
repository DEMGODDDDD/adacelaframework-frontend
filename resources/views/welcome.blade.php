<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Dem-Aqua') }}</title>
        @if (request()->path() === '/')
            <link rel="preload" as="image" href="/images/ocean-background-optimized.jpg" fetchpriority="high">
            <link rel="modulepreload" href="{{ Vite::asset('resources/js/pages/WelcomePage.jsx') }}" fetchpriority="high">
        @endif
        @viteReactRefresh
        @vite('resources/js/app.jsx')
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>