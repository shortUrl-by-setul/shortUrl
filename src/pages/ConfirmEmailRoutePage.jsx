'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../helper/supabase.js';
import Header from '../components/Header/Header.jsx';
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import Loading from '../components/Background/Loading.jsx';
import Background from '../components/Background/Background.jsx';
import './ConfirmEmailRoutePage.css';


export default function ConfirmEmailRoutePage({ theme, toggleTheme }) {
    ConfirmEmailRoutePage.propTypes = {
        theme: String,
        toggleTheme: Function
    }
    // Init loading items
    const [doneLoading, setDoneLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect(() => {
        // Subscribe to auth state changes. Runs once on page load
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            session?.user ? document.title = 'Confirmed | shortUrl by setul' : document.title = 'Access Denied | shortUrl by setul';
            // 2 events, signed in and password recovery, are fired
            setIsTokenValid(session?.user ? true : false);
            if (!doneLoading) setDoneLoading(true);
        });
        return () => authSubscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (doneLoading) {
            const loaderElement = document.querySelector(".website-loader-container");
            if (loaderElement) {
                loaderElement.style.opacity = '0';
                setTimeout(() => {
                    loaderElement.remove();
                }, 400);
            }
        }
    }, [doneLoading]);



    return (
        <>
            {/* Loader, Background, and Dialogs */}
            <div className="website-loader-container">
                <Loading />
            </div>
            <Background />
            <PrivacyPolicyDialog />

            {/* Header (logo, profile link, theme toggle) */}
            <Header theme={theme} toggleTheme={toggleTheme} title={"shortUrl"} />

            {/* Main Section */}
            <div className='container'>
                {/* Welcome message */}
                <div className='primary-card-blurred' style={{ maxWidth: '500px', height: 'fit-content', borderRadius: '2em', padding: '2em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve), color var(--slow-transition-duration) var(--primary-curve), border-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    {isTokenValid ?
                        <>
                            <h1>Looking good! 💫</h1>
                            <p></p>
                            <form id='reset-password-form' onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}
                                className='reset-password-form'>
                                <p style={{ marginTop: '1.5em' }}>Great work! Make sure you have confirmed the email change request on both the old and new email addresses. Only then will the new email address be active.</p>
                                <div style={{ display: 'flex', justifyContent: 'end' }}>
                                    {/* <button type="button" form='reset-password-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.register); }}>Back</button> */}
                                    <button type="submit" id='reset-password-button' form='reset-password-form' className='default-button primary-button' value="change-pass" title='Change password' style={{ position: 'relative' }}>
                                        <span className="button__text">Ok</span>
                                    </button>
                                </div>
                            </form>
                        </> :
                        <>
                            <h1 style={{ color: '#d12e2e', marginBottom: '0.25em' }}>Access Denied 🚫</h1>
                            <p>No wristband, no entry. You&apos;re not authenticated via an one-time confirmation link. We can&apos;t let you change your email. Sorry!</p>
                            <div style={{ display: 'flex', margin: '1.5em 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', textAlign: 'left' }}>
                                        <span>Authenticated:</span>
                                        <span>Associated email:</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', alignItems: 'center', gap: '0.25em' }}>
                                    <span style={{ color: '#d12e2e', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.aud ?? 'false'}</span>
                                    <span style={{ color: '#2e6fd1', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.email ?? 'null'}</span>
                                </div>
                            </div>
                            <button type="button" id='go-home-button' className='default-button primary-button' value="home" title='Go home' onClick={() => { window.location.href = '/'; }}>
                                Go home
                            </button>
                        </>
                    }
                </div>
            </div>

            {/* Footer */}
            <footer style={{ fontFamily: 'Kaushan Script', transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>
                Copyright © 2025 Setul Parekh.All rights reserved. | <button className='link' onClick={() => window.privacyPolicyDialog.showModal()}>Privacy Policy 🙊</button> | <button className='link' onClick={() => window.open('https://www.setulp.com', '_blank')}>My Portfolio 📂</button>
            </footer>
        </>
    )
}