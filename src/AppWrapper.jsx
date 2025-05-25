'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ResetPasswordRoutePage from './pages/ResetPasswordRoutePage.jsx';
import ConfirmEmailRoutePage from './pages/ConfirmEmailRoutePage.jsx';
import LinkExpiredRoutePage from './pages/LinkExpiredRoutePage.jsx';

const ProfileRoutePage = lazy(() => import('./pages/ProfileRoutePage.jsx'));
const ShortUrlRoutePage = lazy(() => import('./pages/ShortUrlRoutePage.jsx'));
const RegisterRoutePage = lazy(() => import('./pages/RegisterRoutePage.jsx'));

// cookies: light and dark theme
// localStorage: cached links
// analytics:
// - no. link visits
// - loc. link visits

// Credits:


export default function AppWrapper() {
    // Init Theme
    const osTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const storedTheme = getThemeCookie();
    const [theme, setTheme] = useState(storedTheme || osTheme);

    // Init document color
    document.body.setAttribute('data-theme', theme);

    useEffect(() => {
        function onDeviceThemeChange(event) {
            if (!storedTheme) {
                const newTheme = event.matches ? 'dark' : 'light';
                if (newTheme !== theme) {
                    // Update theme if device theme changed
                    document.documentElement.style.setProperty("--quick-transition-duration", "var(--slow-transition-duration)");
                    document.body.setAttribute('data-theme', newTheme);
                    setTheme(newTheme);
                    setTimeout(() => {
                        document.documentElement.style.setProperty("--quick-transition-duration", "0.15s");
                    }, 400);
                }
            }
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onDeviceThemeChange);
        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onDeviceThemeChange);
        };
    }, []);

    // Toggle Theme between light and dark
    function toggleTheme() {
        document.documentElement.style.setProperty("--quick-transition-duration", "var(--slow-transition-duration)");
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        setThemeCookie(newTheme);
        setTheme(newTheme);
        setTimeout(() => {
            document.documentElement.style.setProperty("--quick-transition-duration", "0.15s");
        }, 400)
    }

    function delete_cookie(name, path, domain) {
        if (getThemeCookie(name)) {
            document.cookie = name + "=" +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") +
                ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
    }

    function setThemeCookie(theme) {
        // Set a cookie with the theme preference
        document.cookie = `short-url-theme=${theme}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`; // ; domain=.setulp.com
        console.info('Theme cookie set:', document.cookie);
    }

    // Check for cookie that has current theme option
    function getThemeCookie() {
        const cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('short-url-theme=')) {
                const value = cookie.split('=')[1];
                console.info('Theme cookie found:', value);
                return value;
            }
        }
        console.info("No theme cookie found. Refering to device theme");
        return null;
    }

    return (
        <Suspense>
            <Routes>
                <Route path='/' element={<ShortUrlRoutePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path='/register' element={<RegisterRoutePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path='/reset-password' element={<ResetPasswordRoutePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path='/confirm-email' element={<ConfirmEmailRoutePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path='/user/:handle' element={<ProfileRoutePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path='/*' element={<LinkExpiredRoutePage theme={theme} toggleTheme={toggleTheme} />} />
            </Routes>
        </Suspense>
    )
}