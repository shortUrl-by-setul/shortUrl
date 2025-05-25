'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../helper/supabase.jsx';
import Header from '../components/Header/Header.jsx';
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import Loading from '../components/Background/Loading.jsx';
import Background from '../components/Background/Background.jsx';
import AreYouSureDialog from '../components/Dialogs/AreYouSureDialog.jsx';
import './RegisterRoutePage.css';


export default function RegisterRoutePage({ theme, toggleTheme }) {
    RegisterRoutePage.propTypes = {
        theme: String,
        toggleTheme: Function
    }
    // Init loading items
    const [doneLoading, setDoneLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [registerErrorMessage, setRegisterErrorMessage] = useState(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [hasRegistered, setHasRegistered] = useState(false);

    useEffect(() => {
        // Get params
        const url = window.location.href;
        const paramsUnsplit = url.split('register')[1].replace('#', '').split('&')
        const params = paramsUnsplit.reduce((acc, param) => {
            const [key, value] = param.split('=');
            return { ...acc, [key]: value };
        }, {});
        // Check reset password validity
        if (params.type === 'invite') {
            // Verify OTP
            (async () => {
                const { data: { session }, error } = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token });
                if (!error) {
                    setIsTokenValid(session?.user ? true : false);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        const { data } = await supabase.from('profiles').select('has_registered').eq('id', session?.user?.id).single();
                        setHasRegistered(data?.has_registered ?? false)
                        data?.has_registered ? document.title = 'Access Denied | shortUrl by setul' : document.title = 'Register | shortUrl by setul';
                    } else {
                        document.title = 'Access Denied | shortUrl by setul';
                    }
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

    async function submitRegister(e) {
        e.preventDefault();
        function setRegisterLoadingState(state) {
            // Toggle button loading
            const registerButton = document.getElementById('register-button');
            const registerCancelButton = document.getElementById('register-cancel-button');
            registerButton.classList.toggle('button--loading');
            registerButton.disabled = state;
            registerCancelButton.disabled = state;
            // Disable or enable inputs
            e.target.elements['register-handle-input'].disabled = state;
            e.target.elements['register-password-input'].disabled = state;
            e.target.elements['register-re-password-input'].disabled = state;
        }
        // Start
        setRegisterLoadingState(true);
        // Grab input values
        const registerHandleInput = e.target.elements['register-handle-input'].value;
        // const registerEmailInput = e.target.elements['register-email-input'].value;
        const registerPasswordInput = e.target.elements['register-password-input'].value;
        const registerConfirmPasswordInput = e.target.elements['register-re-password-input'].value;
        // Password and handle should already be validated by the input... so
        // Validate matching password
        if (registerPasswordInput !== registerConfirmPasswordInput) {
            setRegisterLoadingState(false);
            validateInput(e.target.elements['register-re-password-input']);
            e.target.elements['register-re-password-input'].classList.add('invalid');
            e.target.elements['register-re-password-input'].focus();
            return;
        }
        // Validate user
        if (!user) {
            setRegisterErrorMessage(<p id='register-error-text'>You must be authenticated</p>);
            setRegisterLoadingState(false);
            return;
        }
        // Update password
        const { data: passUpdateData, error: passUpdateError } = await supabase.auth.updateUser({ password: registerPasswordInput });
        console.log('Update password data:', passUpdateData, 'Update password error:', passUpdateError);
        if (passUpdateError) {
            setRegisterErrorMessage(<p id='register-error-text'>That&apos;s on us, something went wrong. Try again later.</p>);
            setRegisterLoadingState(false);
            return;
        }
        // Update profile data (handle) and set user to registered state
        const { data: data2, error: handleUpdateError } = await supabase.from('profiles').update({ handle: registerHandleInput, has_registered: true }).eq('id', user.id);
        console.log(data2, handleUpdateError);
        if (handleUpdateError) {
            // Fails if handle is already taken
            setRegisterErrorMessage(<p id='register-error-text'>Hmm, looks like this handle&apos;s taken</p>);
            setRegisterLoadingState(false);
            e.target.elements['register-handle-input'].classList.add('invalid');
            e.target.elements['register-handle-input'].focus();
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
                case 'register-handle-input':
                    target.setCustomValidity('A handle is required.');
                    break;
                case 'register-password-input':
                    target.setCustomValidity('A password is required.');
                    setRegisterErrorMessage(null);
                    break;
                case 'register-re-password-input':
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
                case 'register-handle-input':
                    target.setCustomValidity('Handle must be 4 to 30 characters long.');
                    break;
                case 'register-password-input':
                case 'register-re-password-input':
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
                case 'register-password-input':
                    if (target.value === document.getElementById('register-re-password-input').value) {
                        document.getElementById('register-re-password-input').classList.remove('invalid');
                    }
                    setRegisterErrorMessage(null);
                    break;
                case 'register-re-password-input':
                    if (target.value !== document.getElementById('register-password-input').value) {
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
                case 'register-handle-input':
                    target.setCustomValidity('Handle can only contain letters and numbers.');
                    break;
                case 'register-password-input':
                    target.setCustomValidity('Password must match requirements.');
                    setRegisterErrorMessage(
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', paddingLeft: '0.8em' }}>
                            <p style={{ color: 'var(--text-color)', textAlign: 'left', fontSize: '0.75rem', margin: '0', transition: 'color var(--slow-transition-duration) var(--primary-curve)' }}>Password requirements:</p>
                            <ul id='register-error-text' style={{ textAlign: 'left', fontSize: '0.75rem', margin: '0 0 1em 0', listStyle: 'none', padding: '0' }}>
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
            function setRegisterLoadingState(state) {
                // Toggle button loading
                const registerCancelButton = document.getElementById('register-cancel-button');
                const registerButton = document.getElementById('register-button');
                registerCancelButton.classList.toggle('button--loading');
                registerCancelButton.disabled = state;
                registerButton.disabled = state;
                // Disable/enable inputs
                document.getElementById('register-handle-input').disabled = state;
                document.getElementById('register-password-input').disabled = state;
                document.getElementById('register-re-password-input').disabled = state;
            }
            setRegisterLoadingState(true);
            // await supabase.functions.invoke('delete_user', { id: user.id });
            // await supabase.auth.signOut();
            // window.location.href = '/';
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
            {showCancelDialog && <AreYouSureDialog onClose={onDeleteConfirmChoice} title='Delete Invitation' text='Are you sure you want to permanently delete this invitation? This action cannot be undone. You will need another invite to create an account.' />}

            {/* Header (logo, profile link, theme toggle) */}
            <Header theme={theme} toggleTheme={toggleTheme} title={"shortUrl"} />

            {/* Main Section */}
            <div className='container'>
                {/* Welcome message */}
                <div className='primary-card-blurred' style={{ maxWidth: '500px', height: 'fit-content', borderRadius: '2em', padding: '2em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve), color var(--slow-transition-duration) var(--primary-curve), border-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    {isTokenValid && !hasRegistered ?
                        <>
                            <h1>Hey there! 🫡</h1>
                            <p></p>
                            <form id='register-form'
                                onSubmit={submitRegister}
                                className='register-form'>
                                <p style={{ margin: '0' }}>We need just a few more details to finish setting up your account and you&apos;re in!</p>
                                <p style={{ margin: '0', color: 'var(--text-color-disabled)' }}>🛈 This page is time sensitive</p>
                                <div id='register-handle-input-container' style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                    <label htmlFor="register-handle-input">@</label>
                                    <input
                                        type='text'
                                        name='register-handle-input'
                                        id="register-handle-input"
                                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                        placeholder='handle'
                                        pattern='^[a-zA-Z0-9]*$'
                                        maxLength={30}
                                        minLength={4}
                                        form='register-form'
                                        title='Enter your handle'
                                        required
                                    />
                                </div>
                                {/* <input
                                    type='text'
                                    name='register-display-name-input'
                                    id="register-display-name-input"
                                    onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                    style={{ borderRadius: '1em' }}
                                    placeholder='display name'
                                    pattern='^[\w\-\s]{4,60}$'
                                    maxLength={60}
                                    minLength={4}
                                    form='register-form'
                                    title='Enter your display name'
                                    required
                                /> */}
                                <input
                                    type='email'
                                    name='register-email-input'
                                    id="register-email-input"
                                    style={{ borderRadius: '1em' }}
                                    placeholder='email'
                                    value={user?.email}
                                    form='register-form'
                                    title='Enter your email address'
                                    required
                                    disabled
                                />
                                <input
                                    type='password'
                                    name='register-password-input'
                                    id="register-password-input"
                                    onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
                                    pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d])[\S]{8,}$'
                                    style={{ borderRadius: '1em' }}
                                    placeholder='password'
                                    form='register-form'
                                    title='Enter your password'
                                    required
                                />
                                <input
                                    type='password'
                                    name='register-re-password-input'
                                    id="register-re-password-input"
                                    onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                    style={{ borderRadius: '1em' }}
                                    placeholder='re-enter password'
                                    form='register-form'
                                    title='Re-enter your password'
                                    required
                                />
                                {registerErrorMessage}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {/* <button type="button" form='register-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.register); }}>Back</button> */}
                                    <button type="button" id='register-cancel-button' form='register-form' className='default-button red-button' value="cancel" title='Cancel and delete account' onClick={() => { setShowCancelDialog(true); }} style={{ position: 'relative' }}>
                                        <span className="button__text">Cancel</span>
                                    </button>
                                    <button type="submit" id='register-button' form='register-form' className='default-button primary-button' value="register" title='Register' style={{ position: 'relative' }}>
                                        <span className="button__text">Register</span>
                                    </button>
                                </div>
                            </form>
                        </> :
                        <>
                            <h1 style={{ color: '#d12e2e', marginBottom: '0.25em' }}>Access Denied 🚫</h1>
                            <p>No wristband, no entry. {hasRegistered ? 'You have already registered. We can\'t let you register again.' : 'You\'re not authenticated via an invite. We can\'t let you register.'}  Sorry!</p>
                            <div style={{ display: 'flex', margin: '1.5em 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', textAlign: 'left' }}>
                                        <span>Status:</span>
                                        <span>Associated email:</span>
                                        <span>Details:</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', alignItems: 'center', gap: '0.25em' }}>
                                    <span style={{ color: '#d12e2e', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.aud ?? 'unknown'}</span>
                                    <span style={{ color: '#2e6fd1', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{user?.email ?? 'null'}</span>
                                    <span style={{ color: 'var(--text-color-disabled)', fontWeight: 'bold', backgroundColor: 'var(--primary-color)', padding: '0.25em 1em', borderRadius: '1em', width: 'fit-content' }}>{hasRegistered ? 'Already registered' : 'Not on guest list'}</span>
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