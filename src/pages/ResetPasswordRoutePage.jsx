'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../helper/supabase.jsx';
import Header from '../components/Header/Header.jsx';
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import Loading from '../components/Background/Loading.jsx';
import Background from '../components/Background/Background.jsx';
import AreYouSureDialog from '../components/Dialogs/AreYouSureDialog.jsx';
import './ResetPasswordRoutePage.css';


export default function ResetPasswordRoutePage({ theme, toggleTheme }) {
    ResetPasswordRoutePage.propTypes = {
        theme: String,
        toggleTheme: Function
    }
    // Init loading items
    const [doneLoading, setDoneLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [resetPasswordErrorMessage, setResetPasswordErrorMessage] = useState(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        // Get params
        const url = window.location.href;
        const paramsUnsplit = url.split('reset-password')[1].replace('#', '').split('&')
        const params = paramsUnsplit.reduce((acc, param) => {
            const [key, value] = param.split('=');
            return { ...acc, [key]: value };
        }, {});
        // Check reset password validity
        if (params.type === 'recovery') {
            // Verify OTP
            (async () => {
                const { data: { session }, error } = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token });
                if (!error) {
                    setIsTokenValid(session?.user ? true : false);
                    setUser(session?.user);
                    session?.user ? document.title = 'Reset Password | shortUrl by setul' : document.title = 'Access Denied | shortUrl by setul';
                }
                if (!doneLoading) setDoneLoading(true);
            }
            )();
        };
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

    async function submitResetPassword(e) {
        e.preventDefault();
        function setResetPasswordLoadingState(state) {
            // Toggle button loading
            const submitButton = document.getElementById('reset-password-button');
            const cancelButton = document.getElementById('reset-password-cancel-button');
            submitButton.classList.toggle('button--loading');
            submitButton.disabled = state;
            cancelButton.disabled = state;
            // Disable or enable inputs
            e.target.elements['reset-password-password-input'].disabled = state;
            e.target.elements['reset-password-re-password-input'].disabled = state;
        }
        // Start
        setResetPasswordLoadingState(true);
        // Grab input values
        const passwordInput = e.target.elements['reset-password-password-input'].value;
        const confirmPasswordInput = e.target.elements['reset-password-re-password-input'].value;
        // Validate current password

        // Password and handle should already be validated by the input... so
        // Validate matching password
        if (passwordInput !== confirmPasswordInput) {
            setResetPasswordLoadingState(false);
            validateInput(e.target.elements['reset-password-re-password-input']);
            e.target.elements['reset-password-re-password-input'].classList.add('invalid');
            e.target.elements['reset-password-re-password-input'].focus();
            return;
        }
        // Validate user
        if (!user) {
            setResetPasswordErrorMessage(<p id='reset-password-error-text'>You must be authenticated</p>);
            setResetPasswordLoadingState(false);
            return;
        }
        // Update password
        const { data, error } = await supabase.auth.updateUser({ password: passwordInput });
        console.log('Update password data:', data, 'Update password error:', error);
        if (error) {
            setResetPasswordErrorMessage(<p id='reset-password-error-text'>Something went wrong</p>);
            setResetPasswordLoadingState(false);
            e.target.elements['reset-password-password-input'].classList.add('invalid');
            e.target.elements['reset-password-password-input'].focus();
            return;
        }
        // Redirect to home page
        window.location.href = '/';
    }

    // Validate input
    function validateInput(target) {
        const target_id = target.id;
        const validity = target.validity;
        // Clear custom error and recheck
        if (validity.customError) {
            target.setCustomValidity('');
            target.checkValidity();
        }
        // Input is empty
        if (validity.valueMissing) {
            target.classList.remove('invalid');
            switch (target_id) {
                case 'reset-password-password-input':
                    target.setCustomValidity('A password is required.');
                    setResetPasswordErrorMessage(null);
                    break;
                case 'reset-password-re-password-input':
                    target.setCustomValidity('Please confirm your password.');
                    break;
                default:
                    break;
            }
        }
        // Input is too short or too long
        else if (validity.tooShort || validity.tooLong) {
            target.classList.add('invalid');
            switch (target_id) {
                case 'reset-password-password-input':
                case 'reset-password-re-password-input':
                    target.setCustomValidity('Password must be at least 8 characters long.');
                    break;
                default:
                    break;
            }
        }
        // Input is valid
        else if (target.checkValidity()) {
            target.classList.remove('invalid');
            switch (target_id) {
                case 'reset-password-password-input':
                    if (target.value === document.getElementById('reset-password-re-password-input').value) {
                        document.getElementById('reset-password-re-password-input').classList.remove('invalid');
                    }
                    setResetPasswordErrorMessage(null);
                    break;
                case 'reset-password-re-password-input':
                    if (target.value !== document.getElementById('reset-password-password-input').value) {
                        target.setCustomValidity('Passwords must match.');
                        target.checkValidity();
                        target.classList.add('invalid');
                    }
                    break;
                default:
                    break;
            }
        }
        // Input is invalid (either regex failed or other)
        else {
            target.classList.add('invalid');
            switch (target_id) {
                case 'reset-password-password-input':
                    target.setCustomValidity('Password must match requirements.');
                    setResetPasswordErrorMessage(
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', paddingLeft: '0.8em' }}>
                            <p style={{ color: 'var(--text-color)', textAlign: 'left', fontSize: '0.75rem', margin: '0', transition: 'color var(--slow-transition-duration) var(--primary-curve)' }}>Password requirements:</p>
                            <ul id='reset-password-error-text' style={{ textAlign: 'left', fontSize: '0.75rem', margin: '0 0 1em 0', listStyle: 'none', padding: '0' }}>
                                <li className={/^[\S]{8,}$/.test(target.value) ? 'password-check-green' : 'password-check-red'} style={{ transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>8+ characters long</li>
                                <li className={/(?=.*[A-Z])/.test(target.value) ? 'password-check-green' : 'password-check-red'} style={{ transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>Has an uppercase letter</li>
                                <li className={/(?=.*[a-z])/.test(target.value) ? 'password-check-green' : 'password-check-red'} style={{ transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>Has a lowercase letter</li>
                                <li className={/(?=.*\d)/.test(target.value) ? 'password-check-green' : 'password-check-red'} style={{ transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>Has a number</li>
                                <li className={/(?=.*[^\w\d])/.test(target.value) ? 'password-check-green' : 'password-check-red'} style={{ transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>Has a special character</li>
                            </ul>
                        </div>
                    );
                    return;
                default:
                    break;
            }
        }
        target.reportValidity();
    }

    async function onDeleteConfirmChoice(confirmed) {
        if (confirmed) {
            function setResetPasswordLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('reset-password-button');
                const cancelButton = document.getElementById('reset-password-cancel-button');
                cancelButton.classList.toggle('button--loading');
                cancelButton.disabled = state;
                submitButton.disabled = state;
                // Disable/enable inputs
                document.getElementById('reset-password-password-input').disabled = state;
                document.getElementById('reset-password-re-password-input').disabled = state;
            }
            setResetPasswordLoadingState(true);
            // remove OTP?
        }
        setTimeout(() => {
            setShowCancelDialog(false);
        }, 401);
    }

    return (
        <>
            {/* Loader, Background, and Dialogs */}
            <div className="website-loader-container">
                <Loading />
            </div>
            <Background />
            <PrivacyPolicyDialog />
            {showCancelDialog && <AreYouSureDialog onClose={onDeleteConfirmChoice} title='Cancel Reset' text='Are you sure you want to cancel your password reset?' />}

            {/* Header (logo, profile link, theme toggle) */}
            <Header theme={theme} toggleTheme={toggleTheme} title={"shortUrl"} />

            {/* Main Section */}
            <div className='container'>
                {/* Welcome message */}
                <div className='primary-card-blurred' style={{ maxWidth: '500px', height: 'fit-content', borderRadius: '2em', padding: '2em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve), color var(--slow-transition-duration) var(--primary-curve), border-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    {isTokenValid ?
                        <>
                            <h1>Fresh start? 🌱</h1>
                            <p></p>
                            <form id='reset-password-form'
                                onSubmit={submitResetPassword}
                                className='reset-password-form'>
                                <p style={{ margin: '0' }}>Please enter your new password. You will need to login with it after the reset.</p>
                                <p style={{ margin: '0', color: 'var(--text-color-disabled)' }}>🛈 This page is time sensitive</p>
                                <input
                                    type='password'
                                    name='reset-password-password-input'
                                    id="reset-password-password-input"
                                    onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
                                    pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d])[\S]{8,}$'
                                    style={{ borderRadius: '1em' }}
                                    placeholder='new password'
                                    form='reset-password-form'
                                    title='Enter your new password'
                                    required
                                />
                                <input
                                    type='password'
                                    name='reset-password-re-password-input'
                                    id="reset-password-re-password-input"
                                    onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                    style={{ borderRadius: '1em' }}
                                    placeholder='re-enter new password'
                                    form='reset-password-form'
                                    title='Re-enter your new password'
                                    required
                                />
                                {resetPasswordErrorMessage}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {/* <button type="button" form='reset-password-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.register); }}>Back</button> */}
                                    <button type="button" id='reset-password-cancel-button' form='reset-password-form' className='default-button red-button' value="cancel" title='Cancel and delete account' onClick={() => { setShowCancelDialog(true); }} style={{ position: 'relative' }}>
                                        <span className="button__text">Cancel</span>
                                    </button>
                                    <button type="submit" id='reset-password-button' form='reset-password-form' className='default-button primary-button' value="change-pass" title='Change password' style={{ position: 'relative' }}>
                                        <span className="button__text">Change password</span>
                                    </button>
                                </div>
                            </form>
                        </> :
                        <>
                            <h1 style={{ color: '#d12e2e', marginBottom: '0.25em' }}>Access Denied 🚫</h1>
                            <p>No wristband, no entry. You&apos;re not authenticated via an one-time password link. We can&apos;t let you reset your password. Sorry!</p>
                            <div style={{ display: 'flex', margin: '1.5em 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', textAlign: 'left' }}>
                                        <span>Authenticated:</span>
                                        <span>Associated email:</span>
                                        <span>Access token:</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', alignItems: 'center', gap: '0.25em' }}>
                                    <span style={{ color: '#d12e2e', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.aud ?? 'false'}</span>
                                    <span style={{ color: '#2e6fd1', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.email ?? 'null'}</span>
                                    <span style={{ color: 'var(--text-color-disabled)', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>invalid</span>
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