'use client';

import Header from '../components/Header/Header.jsx';
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import Background from '../components/Background/Background.jsx';


export default function LinkExpiredRoutePage({ theme, toggleTheme }) {
    LinkExpiredRoutePage.propTypes = {
        theme: String,
        toggleTheme: Function
    }

    return (
        <>
            <Background />
            <PrivacyPolicyDialog />

            {/* Header (logo, profile link, theme toggle) */}
            <Header theme={theme} toggleTheme={toggleTheme} title={"shortUrl"} />

            {/* Main Section */}
            <div className='container'>
                {/* Welcome message */}
                <div className='primary-card-blurred' style={{ maxWidth: '500px', height: 'fit-content', borderRadius: '2em', padding: '2em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve), color var(--slow-transition-duration) var(--primary-curve), border-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    <>
                        <h1 style={{ color: '#d12e2e', marginBottom: '0.25em' }}>Error ❌</h1>
                        <p style={{ marginBottom: '1.5em' }}>
                            We&apos;re sorry, but it looks like the link you followed is either invalid or has expired.
                            This could be due to the link being mistyped, or it may no longer be active.
                            Please check the URL and try again, or head back to the homepage to generate a new link.
                        </p>
                        <button type="button" id='go-home-button' className='default-button primary-button' value="home" title='Go home' onClick={() => { window.location.href = '/'; }}>
                            Go home
                        </button>
                    </>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ fontFamily: 'Kaushan Script', transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>
                Copyright © 2025 Setul Parekh.All rights reserved. | <button className='link' onClick={() => window.privacyPolicyDialog.showModal()}>Privacy Policy 🙊</button> | <button className='link' onClick={() => window.open('https://www.setulp.com', '_blank')}>My Portfolio 📂</button>
            </footer>
        </>
    )
}