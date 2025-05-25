'use client';

import './LoginDrawer.css';
import { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { supabase } from '../../helper/supabase.jsx';
import InfoTooltip from '../HoverTooltip/HoverTooltip.jsx';

export default function LoginDrawer({ onDoneLoading }) {
    LoginDrawer.propTypes = {
        onDoneLoading: Function
    };
    const pages = {
        register: 'login-drawer-register-page',
        user: 'login-drawer-user-page',
        login: 'login-drawer-login-page',
        forgot: 'login-drawer-forgot-password-page',
        changeHandle: 'login-drawer-change-display-name-page',
        changeEmail: 'login-drawer-change-email-page',
        changePassword: 'login-drawer-change-password-page',
        deleteData: 'login-drawer-delete-data-page',
        deleteAccount: 'login-drawer-delete-account-page',
        admin: 'login-drawer-admin-page'
    };
    const [currentPage, setCurrentPage] = useState(pages.login);
    const [buttonText, setButtonText] = useState('Login');
    const [buttonIcon, setButtonIcon] = useState('🗝️');
    const [userHandle, setUserHandle] = useState(null);
    const [userIsPublic, setUserIsPublic] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [curUser, setCurUser] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const roleSubRef = useRef(null);


    useEffect(() => {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
            (async () => {
                setButtonText(session?.user ? 'Hey!' : 'Login');
                setButtonIcon(session?.user ? '✅' : '🗝️');
                setCurUser(session?.user);
                if (session?.user) {
                    const { data, error } = await supabase.from('profiles').select('handle, public').eq('id', session?.user?.id).single();
                    if (!error && data) {
                        setUserHandle(data.handle);
                        setUserIsPublic(data.public);
                    }
                    const { data: roleData, error: roleError } = await supabase.from('user_roles').select('role').eq('id', session?.user?.id).single();
                    if (!roleError && roleData) {
                        setUserRole(roleData.role);
                    }
                }
                if (isFirstLoad) { setIsFirstLoad(false); onDoneLoading(); }
            })();
        });

        // If there's no logged-in user, nothing to do.
        if (!curUser) {
            // Cleanup any subscriptions if still lingering.
            if (roleSubRef.current) {
                roleSubRef.current.unsubscribe();
            }
            roleSubRef.current = null;
            return;
        }

        // Setup channels for real-time subscriptions for links and user data.
        const profilesChannel = supabase.channel('realtime:public:profiles');

        // Create subscription for new and deleted links for this user.
        const profilesSubscription = profilesChannel
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${curUser.id}`,
            },
                (payload) => {
                    if (payload.new.public !== payload.old.public) {
                        setUserIsPublic(payload.new.public);
                    }
                }
            )
            .subscribe();

        // Save the subscriptions so we can cancel them on unmount or when user signs out.
        roleSubRef.current = profilesSubscription;

        return () => {
            // Cleanup auth subscription
            authSubscription.unsubscribe();
            // Cleanup subscriptions when the effect is re-run (for example, on sign-out)
            if (roleSubRef.current) {
                roleSubRef.current.unsubscribe();
            }
            roleSubRef.current = null;
        };
    }, []);


    function switchPage(page) {
        const curPage = document.getElementById(currentPage);
        if (!curPage) return;
        curPage.classList.remove('slide-away-active');
        setTimeout(() => {
            setCurrentPage(page);
        }, 100);
    }

    useEffect(() => {
        const curPage = document.getElementById(currentPage);
        if (!curPage) return;
        curPage.classList.remove('slide-away-active');
        setTimeout(() => {
            curPage.classList.add('slide-away-active');
        }, 50);
    }, [currentPage]);

    return (
        <Drawer.Root activeSnapPoint={1} direction='right'>
            <Drawer.Trigger type='button' id='open-login-drawer-button' className='default-button' title='Open login dialog' onClick={() => {
                // const { data: { user } } = await supabase.auth.getUser();
                curUser ? setCurrentPage(pages.user) : setCurrentPage(pages.login);
            }}>
                <span id='open-login-drawer-button-icon'>{buttonIcon}</span>
                <span id='open-login-drawer-button-text'>{buttonText}</span>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }} />
                <Drawer.Content id='login-drawer' style={{
                    position: 'fixed',
                    display: 'flex',
                    outline: 'none',
                    flexDirection: 'column',
                    top: 0,
                    right: 0,
                    // marginRight: '-1px',
                }}>
                    <div id='login-drawer-content' className='primary-card-solid' style={{
                        margin: '1rem 1rem 0rem 0rem',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}>
                        {(() => {
                            switch (currentPage) {
                                case pages.register:
                                    return <RegisterPage />;
                                case pages.user:
                                    return <UserPage />;
                                case pages.forgot:
                                    return <ForgotPasswordPage />;
                                case pages.changeHandle:
                                    return <ChangeHandle />;
                                case pages.changeEmail:
                                    return <ChangeEmailPage />;
                                case pages.changePassword:
                                    return <ChangePasswordPage />;
                                case pages.deleteData:
                                    return <DeleteDataPage />;
                                case pages.deleteAccount:
                                    return <DeleteAccountPage />;
                                case pages.admin:
                                    return <AdminPage />;
                                case pages.login:
                                default:
                                    return <LoginPage />;
                            }
                        })()}
                        {/* {currentPage} */}
                        {/* <LoginPage /> */}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );

    function LoginPage() {
        const [loginErrorMessage, setLoginErrorMessage] = useState(null);
        async function submitLogin(e) {
            e.preventDefault();
            const loginButton = document.getElementById('login-button');
            loginButton.classList.toggle('button--loading');
            loginButton.disabled = true;
            const email = e.target.elements['login-email-input'].value;
            const password = e.target.elements['login-password-input'].value;
            // const response = await signInWithEmailAndPassword(getAuth(), email, password);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            // Handle error
            if (error) {
                // https://supabase.com/docs/guides/auth/debugging/error-codes
                switch (error.code) {
                    // email_not_confirmed
                    case 'invalid_credentials':
                        console.error('Invalid credentials');
                        setLoginErrorMessage(<p id='login-error-text'>Invalid credentials</p>);
                        break;
                    case 'email_not_confirmed':
                        console.error('Account not verified');
                        setLoginErrorMessage(<p id='login-error-text'>Account not verified</p>);
                        break;
                    default:
                        console.error('Error signing in:', error);
                        setLoginErrorMessage(<p id='login-error-text'>Error signing in</p>);
                }
                loginButton.classList.toggle('button--loading');
                loginButton.removeAttribute("disabled");
                e.target.elements['login-email-input'].classList.add('invalid');
                e.target.elements['login-password-input'].classList.add('invalid');
                e.target.elements['login-email-input'].focus();
            }
            // Handle successful sign in
            if (data.user) {
                switchPage(pages.user);
            }
        }
        return (
            <div id={pages.login} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0 0.25em 0' }}>Who are you? 🤨</Drawer.Title>
                {/* Content */}
                <div style={{ margin: '0rem 2rem 2rem' }}>
                    <form id='login-form' onSubmit={(e) => { submitLogin(e); }} className='login-form'>
                        <p style={{ textAlign: 'center', margin: '0' }}>Login to experience the magic!</p>
                        {/* <Login /> */}

                        {/* <label htmlFor="login-email-input">Email</label> */}
                        <input
                            type='email'
                            name='login-email-input'
                            id="login-email-input"
                            // onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            // pattern='^[a-zA-Z0-9\s\-,\.!?]+$'
                            style={{ borderRadius: '1em' }}
                            placeholder='email'
                            // autoComplete='off'
                            // autoCorrect='off'
                            form='login-form'
                            title='Enter your email address'
                            required
                        />
                        {/* <label htmlFor="password">Password</label> */}
                        <input
                            type='password'
                            name='login-password-input'
                            id="login-password-input"
                            // onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            // pattern='^[a-zA-Z0-9\s\-,\.!?]+$'
                            style={{ borderRadius: '1em' }}
                            placeholder='password'
                            // autoComplete='off'
                            // autoCorrect='off'
                            form='login-form'
                            title='Enter your password'
                            required
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button type='button' className='link' title='Create a new account' onClick={() => { switchPage(pages.register); }} style={{
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '0 !important',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}>
                                New? Register now!
                            </button>
                            <button type='button' className='link' title='Forgot password?' onClick={() => { switchPage(pages.forgot); }} style={{
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '0 !important',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}>
                                Forgot Password?
                            </button>
                        </div>
                        {loginErrorMessage}
                        <div style={{ display: 'flex', justifyContent: 'right', marginTop: '0.25em' }}>
                            {/* <button type="cancel" form='login-form' className='default-button' value="cancel" title='Go back'>Back</button> */}
                            <button type="submit" id='login-button' form='login-form' className='default-button primary-button' value="login" title='Login' style={{ position: 'relative' }}>
                                <span className="button__text">Login</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        )
    }

    function RegisterPage() {
        return (
            <div id={pages.register} className='slide-away slide-away-active'>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0 0.25em 0' }}>First Timer? Join in! 🎉</Drawer.Title>
                <div style={{ margin: '0rem 2rem 2rem' }}>
                    <form id='login-form' className='login-form'>
                        <p style={{ textAlign: 'center', margin: '0' }}>Registering is currently invite only. Get an invite to save your links and QR codes, share with friends, use custom domains, set custom expiration dates and more!</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25em' }}>
                            <button type="button" form='login-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.login); }}>Back</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function ForgotPasswordPage() {
        const [forgotPasswordErrorMessage, setForgotPasswordErrorMessage] = useState(null);
        // <p id='login-error-text'>There&apos;s no account with this email</p>
        async function submitForgotPassword(e) {
            e.preventDefault();
            function setChangeEmailLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('forgot-password-submit-button');
                const cancelButton = document.getElementById('forgot-password-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable or enable inputs
                e.target.elements['login-forgot-password-email-input'].disabled = state;
            }
            // Start
            setChangeEmailLoadingState(true);

            // Grab input values
            const emailInput = e.target.elements['login-forgot-password-email-input'].value;

            // Send request
            const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
                redirectTo: `http://localhost:5173/#reset-password`,
                type: 'link',
                autoLogin: true
            });

            // Handle response
            if (error) {
                e.target.elements['login-forgot-password-email-input'].classList.add('invalid');
                e.target.elements['login-forgot-password-email-input'].focus();
                setForgotPasswordErrorMessage(<p id='login-error-text'>Something went wrong while sending the email</p>);
                setChangeEmailLoadingState(false);
                return;
            }

            // Show user more details on finish
            const emailNotSentSection = document.getElementById('email-not-sent');
            const emailSentSection = document.getElementById('email-sent');
            emailNotSentSection.classList.toggle('slide-away-active');
            setTimeout(() => {
                emailSentSection.classList.toggle('slide-away-active');
                const submitButton = document.getElementById('forgot-password-submit-button');
                const cancelButton = document.getElementById('forgot-password-cancel-button');
                submitButton.classList.toggle('button--loading');
                cancelButton.disabled = false;
            }, 150);
        }
        return (
            <div id={pages.forgot} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0 0.5em 0' }}>Oops, Memory Lapse? 😅</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-forgot-password-form' className='login-forgot-password-form' onSubmit={submitForgotPassword} style={{ position: 'relative' }}>
                        <div id='email-sent' className='slide-away' style={{ position: 'absolute', width: 'calc(100% - 4em)', top: '20%', gap: '1em', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <p>Done ✅</p>
                            <p>We&apos;ve sent a password reset link to the provided email, if there&apos;s an account linked to it. Check your inbox and follow the link in the email to reset your password.</p>
                        </div>
                        <div id='email-not-sent' className='slide-away slide-away-active'>
                            <p>Enter your email address.</p>
                            <input
                                type='email'
                                name='login-forgot-password-email-input'
                                id="login-forgot-password-email-input"
                                onInput={(e) => {
                                    if (typeof e.target.reportValidity === 'function') {
                                        e.preventDefault();
                                        const target = e.target;
                                        const validity = target.validity;
                                        // Clear custom error and recheck
                                        if (validity.customError) {
                                            target.setCustomValidity('');
                                            target.checkValidity();
                                        }
                                        // Input is empty
                                        if (validity.valueMissing) {
                                            target.classList.remove('invalid');
                                            target.setCustomValidity('Please enter your email.');
                                        }
                                        // Input is too short or too long
                                        else if (validity.tooShort || validity.tooLong) {
                                            target.classList.add('invalid');
                                            target.setCustomValidity('Email must be at least 4 characters long.');
                                        }
                                        // Input is valid
                                        else if (target.checkValidity()) {
                                            target.classList.remove('invalid');
                                        }
                                        // Input is invalid (either regex failed or other)
                                        else {
                                            target.classList.add('invalid');
                                        }
                                        target.reportValidity();
                                    }
                                }}
                                style={{ borderRadius: '1em' }}
                                placeholder='email'
                                form='login-forgot-password-form'
                                title='Enter your email address'
                                maxLength={254}
                                minLength={4}
                                required
                            />
                            {forgotPasswordErrorMessage}
                            <p>A password reset link will be sent to you if your email is registered.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button type="button" form='login-forgot-password-form' id='forgot-password-cancel-button' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.login); }}>Back</button>
                            <button type="submit" form='login-forgot-password-form' id='forgot-password-submit-button' className='default-button primary-button' value="email" title='Send email' style={{ position: 'relative' }}>
                                <span className='button__text'>Send email</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function UserPage() {
        const [isUserHandleCopied, setIsUserHandleCopied] = useState(false);
        const completeHandle = userHandle ? `@${userHandle}` : `@${curUser.id.split('-')[0]}`;
        useEffect(() => {
            var flag = false;
            function explodeOnClick(e) {
                var div = document.createElement("div");
                div.classList.add("tag-click-explode-div");

                document.querySelector("body").appendChild(div);
                div.style.left = e.pageX + "px";
                div.style.top = e.pageY + "px";
                var maxElems = 10;
                for (var i = 0; i < maxElems; i++) {
                    var span = document.createElement("span");
                    var newSpan = div.appendChild(span);
                    var deg = i * (360 / maxElems) + Math.floor(Math.random() * 15);
                    var height = 10 + Math.floor(Math.random() * 28);
                    var width = 4 + Math.floor(Math.random() * 8);
                    newSpan.style.height = height + "px";
                    newSpan.style.width = width + "px";
                    newSpan.style.transform = "rotate(" + deg + "deg)";
                    newSpan.classList.add("tag-click-explode-span");
                    newSpan.style.setProperty("--tag-color", window.getComputedStyle(e.target).getPropertyValue('--tag-color'));
                }
                window.requestAnimationFrame(
                    function () {
                        Array.from(div.querySelectorAll(".tag-click-explode-span")).forEach((el) => {
                            var trasY = -50 - Math.floor(Math.random() * 100);
                            el.style.transform += "scaleY(0.5) translateY(" + trasY + "px)";
                            el.style.opacity = "0";
                        });
                        window.setTimeout(function () {
                            document.body.removeChild(div);
                        }, 400)
                    }

                );
                if (!flag && e.target.classList.contains('explode-tag')) {
                    flag = true;
                    var maxShakeOffset = 2;
                    var shake = window.setInterval(() => {
                        var shakeOffsetX = Math.floor(Math.random() * 2 * maxShakeOffset) - maxShakeOffset;
                        var shakeOffsetY = Math.floor(Math.random() * 2 * maxShakeOffset) - maxShakeOffset;
                        document.body.style.transform = `translate(${shakeOffsetX}px, ${shakeOffsetY}px) rotate(${Math.random() * 0.2 - 0.2}deg)`;
                    }, 10);
                    window.setTimeout(() => {
                        window.clearInterval(shake);
                        document.body.style.transform = '';
                        flag = false;
                    }, 150);
                }
            }
            document.querySelectorAll(".base-tag").forEach((el) => { el.addEventListener("click", (e) => explodeOnClick(e)) });

            //hover effects
            document.getElementById('public-profile-toggle-slider')?.addEventListener('mouseover', () => {
                document.getElementById('public-profile-toggle-label').classList.add('public-profile-toggle-label-hover');
            });
            document.getElementById('public-profile-toggle-slider')?.addEventListener('mouseout', () => {
                document.getElementById('public-profile-toggle-label').classList.remove('public-profile-toggle-label-hover');
            });

            // TODO: RETURN
        }, []);

        async function submitLogout(e) {
            e.preventDefault();
            const logoutButton = document.getElementById('logout-button');
            logoutButton.classList.toggle('button--loading');
            logoutButton.disabled = true;
            const { error } = await supabase.auth.signOut();
            if (error) {
                logoutButton.classList.toggle('button--loading');
                logoutButton.disabled = false;
            }
            else {
                switchPage(pages.login);
            }
        }

        function onCopy(e) {
            e.preventDefault();
            navigator.clipboard.writeText(document.getElementById('public-profile-link-text').innerText);
            const button = document.getElementById('public-profile-link-copy-button');
            if (!button) return;
            button.classList.add('button--done');
            var count = 10;
            confetti({
                particleCount: count,
                drift: 0,
                startVelocity: 7,
                decay: 0.95,
                spread: 360,
                ticks: 60,
                zIndex: 0,
                // angle: Math.random() * 360,
                gravity: 0,
                colors: ['#80C2D9'],
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
            });
            setTimeout(() => {
                button.classList.remove('button--done');
            }, 1000);
        }

        return (
            <div id={pages.user} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0 0.5em 0' }}>Hey, You Made It! 👋</Drawer.Title>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 2rem 1em 2rem', gap: '0.5em' }}>
                    {/* <p >@{userHandle ?? curUser.id.split('-')[0] ?? 'user'}</p> */}
                    <InfoTooltip
                        text={completeHandle}
                        message={isUserHandleCopied ? 'Copied!' : completeHandle}
                        // openUpward={true}
                        onClick={() => {
                            navigator.clipboard.writeText(userHandle ? `@${userHandle}` : `@${curUser.id.split('-')[0]}`);
                            setIsUserHandleCopied(true);
                            setTimeout(() => {
                                setIsUserHandleCopied(false);
                            }, 1000);
                        }}
                    />
                </div>

                <div style={{ maxWidth: '100%', margin: '0em 2em', height: 'fit-content', gap: '0.5em', display: 'flex', flexWrap: 'wrap' }}>
                    {/* 🛡️ 🌎 🙍🏻‍♂️ 🏆 ❤️‍🔥 💎 👑*/}
                    <span className='base-tag'>🛡️ member</span>
                    {userIsPublic && <span className='base-tag blue-tag explode-tag'>🌎 public</span>}
                    {(userRole === 'vip' || userRole === 'admin') && <span className='base-tag yellow-tag explode-tag'>❤️‍🔥 vip</span>}
                    {userRole === 'admin' && <span className='base-tag purple-tag explode-tag'>⚜️ admin</span>}
                    <InfoTooltip width='200px' message={
                        <div style={{ padding: '0.25em' }}>
                            <p>Badges reflect your role in the community</p>
                            <ul style={{ margin: '0', padding: '0.5em 0 0 0', listStyle: 'none', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                                <li><span className='base-tag'>🛡️ member</span></li>
                                <li><span className='base-tag blue-tag explode-tag'>🌎 public</span></li>
                                <li><span className='base-tag yellow-tag explode-tag'>❤️‍🔥 vip</span></li>
                                <li><span className='base-tag purple-tag explode-tag'>⚜️ admin</span></li>
                            </ul>
                        </div>
                    } />
                </div>
                {/* Content */}
                <div style={{
                    margin: '1em 2rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}>
                    <form id="logout-form" onSubmit={(e) => { submitLogout(e); }} className='login-form'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label id='public-profile-toggle-label' htmlFor='public-profile-toggle' className={(userRole !== 'vip' && userRole !== 'admin') && 'toggle-switch-disabled' || null} style={{ flexGrow: 1 }} title='A VIP feature to create a public profile'>Make my profile public</label>
                            <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                                <span style={{ fontSize: 'small', opacity: (userRole === 'vip' || userRole === 'admin') ? '1' : '0.5' }}>❤️‍🔥</span>
                                <input id='public-profile-toggle' defaultChecked={userIsPublic} type="checkbox" disabled={userRole !== 'vip' && userRole !== 'admin'}
                                    onChange={async (e) => {
                                        const { error } = await supabase.from('profiles').update({ public: e.target.checked ?? false }).eq('id', curUser.id);
                                        if (!error) {
                                            setUserIsPublic(e.target.checked ?? false);
                                        }
                                    }}
                                />
                                <div id="public-profile-toggle-slider" className="toggle-switch-slider" title='A VIP feature to create a public profile'>
                                    <div className="toggle-switch-circle">
                                        <svg className="toggle-switch-cross" xmlSpace="preserve" style={{ enableBackground: 'new 0 0 512 512' }} viewBox="0 0 365.696 365.696" y="0" x="0" height="6" width="6" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <path data-original="#000000" fill="var(--primary-color)" d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"></path>
                                            </g>
                                        </svg>
                                        <svg className="toggle-switch-checkmark" xmlSpace="preserve" style={{ enableBackground: 'new 0 0 512 512' }} viewBox="0 0 24 24" y="0" x="0" height="10" width="10" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <path className="" data-original="#000000" fill="var(--primary-color)" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {userIsPublic && <div className='primary-card-solid' style={{ display: 'flex', padding: '0.5em 1em', alignItems: 'center', backgroundColor: 'var(--primary-color)', borderRadius: '1em', color: 'var(--text-color)' }}>
                            <div id='public-profile-link-text' style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: '1', fontSize: 'small' }} title={'https://shorturl.setulp.com/#user/' + userHandle}>
                                https://shorturl.setulp.com/#user/{userHandle}
                            </div>
                            <button type='button' id='public-profile-link-copy-button' className='default-button' title='Copy link to my public profile' onClick={(e) => { onCopy(e); }}
                                style={{ padding: '0.25em 0.75em 0.375em 0.75em', marginLeft: '0.5em', fontSize: 'small', position: 'relative' }}>
                                <span className='button__text'>Copy</span>
                            </button>
                        </div>}
                        {userRole === 'admin' && <button type='button' className='link' title='See admin options' onClick={() => { switchPage(pages.admin); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}>
                            Admin options
                        </button>}
                        <button type='button' className='link' title='Change handle' onClick={() => { switchPage(pages.changeHandle); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}>
                            Change handle
                        </button>
                        <button type='button' className='link' title='Change email' onClick={() => { switchPage(pages.changeEmail); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}>
                            Change email
                        </button>
                        <button type='button' className='link' title='Change password' onClick={() => { switchPage(pages.changePassword); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}>
                            Change password
                        </button>
                        <button type='button' className='link red-button' title='Delete my data' onClick={() => { switchPage(pages.deleteData); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        }}>
                            Delete my data
                        </button>
                        <button type='button' className='link red-button' title='Delete my account' onClick={() => { switchPage(pages.deleteAccount); }} style={{
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0 !important',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        }}>
                            Delete my account
                        </button>
                        {/* <p style={{ margin: '0', color: 'var(--text-color-disabled)', textAlign: 'center' }}>🛈 VIP exclusive features are labeled <span style={{ fontSize: 'small', opacity: '0.7' }}>❤️‍🔥</span></p> */}
                        <div style={{ display: 'flex', justifyContent: 'right' }}>
                            {/* <button type="cancel" form='login-form' className='default-button' value="cancel" title='Go back'>Back</button> */}
                            <button type="submit" id='logout-button' className='default-button primary-button' value="Logout" title='Logout' style={{ position: 'relative' }}>
                                <span className="button__text">Logout</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function ChangeHandle() {
        const [changeHandleErrorMessage, setChangeHandleErrorMessage] = useState(null);
        async function submitChangeHandle(e) {
            e.preventDefault();
            const target = e.target.elements['login-change-handle-input'];
            function setChangeHandleLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-change-handle-submit-button');
                const cancelButton = document.getElementById('login-change-handle-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable or enable inputs
                target.disabled = state;
            }
            setChangeHandleLoadingState(true);
            if (!curUser) {
                setChangeHandleLoadingState(false);
                target.classList.add('invalid');
                target.focus();
                setChangeHandleErrorMessage(<p id='login-error-text'>You&apos;re not authenticated</p>);
                setChangeHandleLoadingState(false);
                return;
            }
            const { error } = await supabase.from('profiles').update({ handle: target.value }).eq('id', curUser.id);
            if (error) {
                target.classList.add('invalid');
                target.focus();
                setChangeHandleErrorMessage(<p id='login-error-text'>Hmm, looks like this handle&apos;s taken</p>);
                setChangeHandleLoadingState(false);
                return;
            }
            else {
                setUserHandle(target.value);
                switchPage(pages.user);
            }
        }
        return (
            <div id={pages.changeHandle} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>Need a new handle?</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-change-handle-form' className='login-form' onSubmit={(e) => { submitChangeHandle(e); }}>
                        <p>Think of a good one and hope it&apos;s not taken!</p>
                        <div id='login-handle-input-container' style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="login-handle-input">@</label>
                            <input
                                type='text'
                                name='login-change-handle-input'
                                id="login-change-handle-input"
                                placeholder='handle'
                                onInput={(e) => {
                                    if (typeof e.target.reportValidity === 'function') {
                                        e.preventDefault();
                                        const target = e.target;
                                        const validity = target.validity;
                                        // Clear custom error and recheck
                                        if (validity.customError) {
                                            target.setCustomValidity('');
                                            target.checkValidity();
                                        }
                                        // Input is empty
                                        if (validity.valueMissing) {
                                            target.classList.remove('invalid');
                                            target.setCustomValidity('Please enter your new handle.');
                                        }
                                        else if (validity.tooShort || validity.tooLong) {
                                            target.classList.add('invalid');
                                            target.setCustomValidity('Handle must be 4 to 30 characters long.');
                                        }
                                        // Input is valid
                                        else if (target.checkValidity()) {
                                            target.classList.remove('invalid');
                                        }
                                        // Input is invalid (either regex failed or other)
                                        else {
                                            target.classList.add('invalid');
                                            target.setCustomValidity('Handle can only contain letters and numbers.');
                                        }
                                        target.reportValidity();
                                    }
                                }}
                                form='login-change-handle-form'
                                pattern='^[a-zA-Z0-9]*$'
                                maxLength={30}
                                minLength={4}
                                required
                            />
                        </div>
                        {changeHandleErrorMessage}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button id='login-change-handle-cancel-button' type="button" form='login-change-handle-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>Back</button>
                            <button id='login-change-handle-submit-button' type="submit" form='login-change-handle-form' className='default-button primary-button' value="change-handle" title='Submit handle change' style={{ position: 'relative' }}>
                                <span className="button__text">Change handle</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        )
    }

    function ChangeEmailPage() {
        const [changeEmailErrorMessage, setChangeEmailErrorMessage] = useState(null);
        async function submitChangeEmail(e) {
            e.preventDefault();
            function setChangeEmailLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-change-email-submit-button');
                const cancelButton = document.getElementById('login-change-email-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable or enable inputs
                e.target.elements['login-change-email-cur-email-input'].disabled = state;
                e.target.elements['login-change-email-email-input'].disabled = state;
                e.target.elements['login-change-email-re-email-input'].disabled = state;
            }
            // Start
            setChangeEmailLoadingState(true);

            // Grab input values
            const curEmailInput = e.target.elements['login-change-email-cur-email-input'].value;
            const emailInput = e.target.elements['login-change-email-email-input'].value;
            const confirmEmailInput = e.target.elements['login-change-email-re-email-input'].value;

            // Validate inputs
            if (emailInput !== confirmEmailInput) {
                setChangeEmailLoadingState(false);
                e.target.elements['login-change-email-re-email-input'].classList.add('invalid');
                e.target.elements['login-change-email-re-email-input'].focus();
                setChangeEmailErrorMessage(<p id='login-error-text'>Emails do not match</p>);
                return;
            }

            if (curEmailInput !== curUser.email) {
                setChangeEmailLoadingState(false);
                e.target.elements['login-change-email-cur-email-input'].classList.add('invalid');
                e.target.elements['login-change-email-cur-email-input'].focus();
                setChangeEmailErrorMessage(<p id='login-error-text'>Failed to confirm current email</p>);
                return;
            }

            if (emailInput === curUser.email) {
                setChangeEmailLoadingState(false);
                e.target.elements['login-change-email-email-input'].classList.add('invalid');
                e.target.elements['login-change-email-email-input'].focus();
                setChangeEmailErrorMessage(<p id='login-error-text'>New email cannot be the same as current email</p>);
                return;
            }

            // Send email change request
            const { error } = await supabase.auth.update({ email: emailInput });

            // Handle response
            if (error) {
                e.target.elements['login-change-email-cur-email-input'].classList.add('invalid');
                e.target.elements['login-change-email-email-input'].classList.add('invalid');
                e.target.elements['login-change-email-re-email-input'].classList.add('invalid');
                e.target.elements['login-forgot-email-cur-email-input'].focus();
                setChangeEmailErrorMessage(<p id='login-error-text'>Something went wrong while sending the email</p>);
                setChangeEmailLoadingState(false);
                return;
            }

            // Switch to email sent page
            const emailNotSentSection = document.getElementById('email-not-sent');
            const emailSentSection = document.getElementById('email-sent');
            emailNotSentSection.classList.toggle('slide-away-active');
            setTimeout(() => {
                emailSentSection.classList.toggle('slide-away-active');
                const submitButton = document.getElementById('login-change-email-submit-button');
                const cancelButton = document.getElementById('login-change-email-cancel-button');
                submitButton.classList.toggle('button--loading');
                cancelButton.disabled = false;
            }, 150);
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
                    case 'login-change-email-cur-email-input':
                        target.setCustomValidity('Please confirm your current email address.');
                        break;
                    case 'login-change-email-email-input':
                        target.setCustomValidity('Please enter your new email address.');
                        break;
                    case 'login-change-email-re-email-input':
                        target.setCustomValidity('Please confirm your new email address.');
                        break;
                    default:
                        break;
                }
            }
            // Input is too short or too long
            else if (validity.tooShort || validity.tooLong) {
                target.classList.add('invalid');
                switch (target_id) {
                    case 'login-change-email-cur-email-input':
                    case 'login-change-email-email-input':
                    case 'login-change-email-re-email-input':
                        target.setCustomValidity('Email must be at least 4 characters long.');
                        break;
                    default:
                        break;
                }
            }
            // Input is valid
            else if (target.checkValidity()) {
                target.classList.remove('invalid');
                switch (target_id) {
                    case 'login-change-email-email-input':
                        if (target.value === document.getElementById('login-change-email-re-email-input').value) {
                            document.getElementById('login-change-email-re-email-input').classList.remove('invalid');
                        }
                        break;
                    case 'login-change-email-re-email-input':
                        if (target.value !== document.getElementById('login-change-email-email-input').value) {
                            target.setCustomValidity('Emails must match.');
                            target.classList.add('invalid');
                            target.checkValidity();
                        }
                        break;
                    default:
                        break;
                }
            }
            // Input is invalid (either regex failed or other)
            else {
                target.classList.add('invalid');
            }
            target.reportValidity();
        }

        return (
            <div id={pages.changeEmail} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>Need a new email?</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-change-email-form' className='login-form' onSubmit={submitChangeEmail}>
                        <div id='email-sent' className='slide-away' style={{ position: 'absolute', width: 'calc(100% - 4em)', top: '31%', gap: '1em', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <p>Done ✅</p>
                            <p>A link to confirm your email change was sent to the email address currently registered to this account as well as the new email address. You must click the confirmation link on both emails to complete the process.</p>
                        </div>
                        <div id='email-not-sent' className='slide-away slide-away-active'>
                            <label htmlFor='login-change-email-cur-email-input'>For security purposes, please confirm your current email.</label>
                            <input
                                type='email'
                                name='login-change-email-cur-email-input'
                                id='login-change-email-cur-email-input'
                                form='login-change-email-form'
                                placeholder={starEmail(curUser.email)}
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') validateInput(e.target); }}
                                style={{ borderRadius: '1em' }}
                                maxLength={254}
                                minLength={4}
                                required
                            />
                            <p>Then, enter the desired new email and re-enter it.</p>
                            <input
                                type='email'
                                name='login-change-email-email-input'
                                id='login-change-email-email-input'
                                form='login-change-email-form'
                                placeholder='new email'
                                style={{ borderRadius: '1em' }}
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') validateInput(e.target); }}
                                maxLength={254}
                                minLength={4}
                                required
                            />
                            <input
                                type='email'
                                name='login-change-email-re-email-input'
                                id='login-change-email-re-email-input'
                                form='login-change-email-form'
                                placeholder='re-enter new email'
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') validateInput(e.target); }}
                                style={{ borderRadius: '1em' }}
                                maxLength={254}
                                minLength={4}
                                required
                            />
                            {changeEmailErrorMessage}
                            <p style={{ margin: '0', color: 'var(--text-color-disabled)' }}>🛈 A confirmation link will be sent to both old and new emails</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button id='login-change-email-cancel-button' type="button" form='login-change-email-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>Back</button>
                            <button id='login-change-email-submit-button' type="submit" form='login-change-email-form' className='default-button primary-button' value="send-email" title='Send email change request' style={{ position: 'relative' }}>
                                <span className="button__text">Send link</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function ChangePasswordPage() {
        const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState(null);
        async function submitChangePassword(e) {
            e.preventDefault();
            function setChangePasswordLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-change-password-submit-button');
                const cancelButton = document.getElementById('login-change-password-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable or enable inputs
                e.target.elements['login-change-password-cur-email-input'].disabled = state;
            }
            // Start
            setChangePasswordLoadingState(true);

            // Validate email
            const emailInput = e.target.elements['login-change-password-cur-email-input'].value;
            if (emailInput !== curUser.email) {
                e.target.elements['login-change-password-cur-email-input'].classList.add('invalid');
                e.target.elements['login-change-password-cur-email-input'].focus();
                setChangePasswordErrorMessage(<p id='login-error-text'>Email does not match</p>);
                setChangePasswordLoadingState(false);
                return;
            }

            // Send request
            const { error } = await supabase.auth.resetPasswordForEmail(curUser.email, {
                redirectTo: `http://localhost:5173/#reset-password`,
                type: 'link',
                autoLogin: true
            });

            // Handle response
            if (error) {
                e.target.elements['login-change-password-cur-email-input'].classList.add('invalid');
                e.target.elements['login-change-password-cur-email-input'].focus();
                setChangePasswordErrorMessage(<p id='login-error-text'>Something went wrong while sending the email</p>);
                setChangePasswordLoadingState(false);
                return;
            }

            // Switch to email sent page
            const emailNotSentSection = document.getElementById('email-not-sent');
            const emailSentSection = document.getElementById('email-sent');
            emailNotSentSection.classList.toggle('slide-away-active');
            setTimeout(() => {
                emailSentSection.classList.toggle('slide-away-active');
                const submitButton = document.getElementById('login-change-password-submit-button');
                const cancelButton = document.getElementById('login-change-password-cancel-button');
                submitButton.classList.remove('button--loading');
                cancelButton.disabled = false;
            }, 150);
        }
        return (
            <div id={pages.changePassword} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>Need a new password?</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-change-password-form' className='login-form' onSubmit={submitChangePassword}>
                        <div id='email-sent' className='slide-away' style={{ position: 'absolute', width: 'calc(100% - 4em)', top: '32.5%', gap: '1em', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <p>Done ✅</p>
                            <p>An email containing a link to reset your password has been sent to you. Follow the link in the email to complete the process.</p>
                        </div>
                        <div id='email-not-sent' className='slide-away slide-away-active'>
                            <p>Please confirm your current email.</p>
                            <input
                                type='email'
                                name='login-change-password-cur-email-input'
                                id='login-change-password-cur-email-input'
                                form='login-change-password-form'
                                placeholder={starEmail(curUser.email)}
                                onInput={(e) => {
                                    if (typeof e.target.reportValidity === 'function') {
                                        e.preventDefault();
                                        const target = e.target;
                                        const validity = target.validity;
                                        // Clear custom error and recheck
                                        if (validity.customError) {
                                            target.setCustomValidity('');
                                            target.checkValidity();
                                        }
                                        // Input too short or too long
                                        if (validity.tooShort || validity.tooLong) {
                                            target.classList.add('invalid');
                                            target.setCustomValidity('Email must be at least 4 characters long.');
                                        }
                                        // Input is empty
                                        if (validity.valueMissing) {
                                            target.classList.remove('invalid');
                                            target.setCustomValidity('Please confirm your email.');
                                        }
                                        // Input is valid
                                        else if (target.checkValidity()) {
                                            target.classList.remove('invalid');
                                        }
                                        // Input is invalid (either regex failed or other)
                                        else {
                                            target.classList.add('invalid');
                                        }
                                        target.reportValidity();
                                    }
                                }}
                                style={{ borderRadius: '1em' }}
                                maxLength={254}
                                minLength={4}
                                required
                            />
                            {changePasswordErrorMessage}
                            <p style={{ margin: '0', color: 'var(--text-color-disabled)' }}>🛈 A link to change your password will be sent to your email</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button id='login-change-password-cancel-button' type="button" form='login-change-password-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>Back</button>
                            <button id='login-change-password-submit-button' type="submit" form='login-change-password-form' className='default-button primary-button' value="send-pr" title='Send password change request' style={{ position: 'relative' }}>
                                <span className='button__text'>Send link</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function DeleteDataPage() {
        const [deleteDataErrorMessage, setDeleteDataErrorMessage] = useState(null);
        async function submitDeleteData(e) {
            e.preventDefault();
            function setDeleteDataLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-delete-data-submit-button');
                const cancelButton = document.getElementById('login-delete-data-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable inputs
                e.target.elements['login-delete-data-cur-email-input'].disabled = state;
            }
            // Start
            setDeleteDataLoadingState(true);

            // Validate email
            const emailInput = e.target.elements['login-delete-data-cur-email-input'].value;
            if (emailInput !== curUser.email) {
                e.target.elements['login-delete-data-cur-email-input'].classList.add('invalid');
                e.target.elements['login-delete-data-cur-email-input'].focus();
                setDeleteDataErrorMessage(<p id='login-error-text'>Email does not match</p>);
                setDeleteDataLoadingState(false);
                return;
            }

            // Send request
            const { error: errorQrCodes } = await supabase.from('profiles').update({ qrcodes: [] }).eq('id', curUser.id);
            const { error: errorLinks } = await supabase.from('links').delete().eq('author', curUser.id);

            // Handle response
            if (errorLinks || errorQrCodes) {
                e.target.elements['login-delete-data-cur-email-input'].classList.add('invalid');
                e.target.elements['login-delete-data-cur-email-input'].focus();
                setDeleteDataLoadingState(false);
                if (errorLinks && errorQrCodes) {
                    setDeleteDataErrorMessage(<p id='login-error-text'>Something went wrong deleting your links and QR codes</p>);
                    return;
                }
                else if (errorQrCodes) {
                    setDeleteDataErrorMessage(<p id='login-error-text'>Something went wrong deleting your QR codes</p>);
                    return;
                }
                else if (errorLinks) {
                    setDeleteDataErrorMessage(<p id='login-error-text'>Something went wrong deleting your links</p>);
                    return;
                }
            }

            // On success
            switchPage(pages.user);
        }
        return (
            <div id={pages.deleteData} className={`slide-away slide-away-active`}>
                {/* 🧼 🫧 🧹 */}
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>Wipe the slate clean? 🧼</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-delete-data-form' className='login-form' onSubmit={(e) => { submitDeleteData(e) }}>
                        <p>Are you sure you want to <i><b style={{ textDecoration: 'underline' }}>permanently</b></i> delete all your data? This mean you will lose all your links and QR codes forever with no way of undoing it.</p>
                        <p>Confirm your email to continue.</p>
                        <input
                            type='email'
                            name='login-delete-data-cur-email-input'
                            id='login-delete-data-cur-email-input'
                            form='login-delete-data-form'
                            placeholder={starEmail(curUser.email)}
                            onInput={(e) => {
                                if (typeof e.target.reportValidity === 'function') {
                                    e.preventDefault();
                                    const target = e.target;
                                    const validity = target.validity;
                                    // Clear custom error and recheck
                                    if (validity.customError) {
                                        target.setCustomValidity('');
                                        target.checkValidity();
                                    }
                                    // Input too short or too long
                                    if (validity.tooShort || validity.tooLong) {
                                        target.classList.add('invalid');
                                        target.setCustomValidity('Email must be at least 4 characters long.');
                                    }
                                    // Input is empty
                                    if (validity.valueMissing) {
                                        target.classList.remove('invalid');
                                        target.setCustomValidity('Please confirm your email.');
                                    }
                                    // Input is valid
                                    else if (target.checkValidity()) {
                                        target.classList.remove('invalid');
                                    }
                                    // Input is invalid (either regex failed or other)
                                    else {
                                        target.classList.add('invalid');
                                    }
                                    target.reportValidity();
                                }
                            }}
                            style={{ borderRadius: '1em' }}
                            maxLength={254}
                            minLength={4}
                            required
                        />
                        {deleteDataErrorMessage}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button type="button" id='login-delete-data-cancel-button' form='login-delete-data-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>No</button>
                            <button type="submit" id='login-delete-data-submit-button' form='login-delete-data-form' className='default-button primary-button' value="continue" title='Delete my data' style={{ position: 'relative' }}>
                                <span className='button__text'>Delete</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function DeleteAccountPage() {
        const [deleteAccountErrorMessage, setDeleteAccountErrorMessage] = useState(null);
        async function submitDeleteAccount(e) {
            e.preventDefault();
            function setDeleteAccountLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-delete-account-submit-button');
                const cancelButton = document.getElementById('login-delete-account-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable inputs
                e.target.elements['login-delete-account-cur-email-input'].disabled = state;
            }
            // Start
            setDeleteAccountLoadingState(true);

            // Validate email
            const emailInput = e.target.elements['login-delete-account-cur-email-input'].value;
            if (emailInput !== curUser.email) {
                e.target.elements['login-delete-account-cur-email-input'].classList.add('invalid');
                e.target.elements['login-delete-account-cur-email-input'].focus();
                setDeleteAccountErrorMessage(<p id='login-error-text'>Email does not match</p>);
                setDeleteAccountLoadingState(false);
                return;
            }

            // Send request
            const { error } = await supabase.rpc('delete_my_account');

            // Handle response
            if (error) {
                e.target.elements['login-delete-account-cur-email-input'].classList.add('invalid');
                e.target.elements['login-delete-account-cur-email-input'].focus();
                setDeleteAccountLoadingState(false);
                setDeleteAccountErrorMessage(<p id='login-error-text'>Something went wrong deleting your account</p>);
            }

            // On success
            await supabase.auth.signOut();
            window.location.reload(true);
        }
        return (
            <div id={pages.deleteAccount} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>You wanna leave? 🥺</Drawer.Title>
                {/* Content */}
                <div style={{
                    margin: '0rem 2rem 2rem',
                    // overflowY: 'auto',
                    // overflowX: 'none'
                }}><form id='login-delete-account-form' className='login-form' onSubmit={(e) => submitDeleteAccount(e)}>
                        <p>Are you sure you want to <i><b style={{ textDecoration: 'underline' }}>permanently</b></i> delete your account? This mean you will lose all your links, QR codes, profile, and account status/access forever with no way of undoing it.</p>
                        <p>Confirm your email to continue.</p>
                        <input
                            type='email'
                            name='login-delete-account-cur-email-input'
                            id='login-delete-account-cur-email-input'
                            form='login-delete-account-form'
                            placeholder={starEmail(curUser.email)}
                            onInput={(e) => {
                                if (typeof e.target.reportValidity === 'function') {
                                    e.preventDefault();
                                    const target = e.target;
                                    const validity = target.validity;
                                    // Clear custom error and recheck
                                    if (validity.customError) {
                                        target.setCustomValidity('');
                                        target.checkValidity();
                                    }
                                    // Input too short or too long
                                    if (validity.tooShort || validity.tooLong) {
                                        target.classList.add('invalid');
                                        target.setCustomValidity('Email must be at least 4 characters long.');
                                    }
                                    // Input is empty
                                    if (validity.valueMissing) {
                                        target.classList.remove('invalid');
                                        target.setCustomValidity('Please confirm your email.');
                                    }
                                    // Input is valid
                                    else if (target.checkValidity()) {
                                        target.classList.remove('invalid');
                                    }
                                    // Input is invalid (either regex failed or other)
                                    else {
                                        target.classList.add('invalid');
                                    }
                                    target.reportValidity();
                                }
                            }}
                            style={{ borderRadius: '1em' }}
                            maxLength={254}
                            minLength={4}
                            required
                        />
                        {deleteAccountErrorMessage}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                            <button type="button" id='login-delete-account-cancel-button' form='login-delete-account-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>No</button>
                            <button type="submit" id='login-delete-account-submit-button' form='login-delete-account-form' className='default-button primary-button' value="delete-acc" title='Delete my account' style={{ position: 'relative' }}>
                                <span className='button__text'>Delete</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    function AdminPage() {
        const [adminErrorMessage, setAdminErrorMessage] = useState(null);
        const [adminInviteErrorMessage, setAdminInviteErrorMessage] = useState(null);
        const [adminChangePermErrorMessage, setAdminChangePermErrorMessage] = useState(null);

        const [isInviteEmailValid, setIsInviteEmailValid] = useState(false);
        const [selectedChangePermUser, setSelectedChangePermUser] = useState(null);
        const [selectedChangePermUserRole, setSelectedChangePermUserRole] = useState(null);
        const [newSelectedChangePermUserRole, setNewSelectedChangePermUserRole] = useState(null);

        const [userList, setUserList] = useState(null);

        useEffect(() => {
            (async () => {
                const { data, error } = await supabase.from('profiles').select('email');
                if (error) {
                    console.log(error);
                } else {
                    setUserList(data);
                }
            })();
        }, []);

        async function submitAdminInviteForm(e) {
            e.preventDefault();
            function setAdminInviteLoadingState(state) {
                // Toggle button loading
                const submitButton = document.getElementById('login-admin-submit-invite-button');
                const cancelButton = document.getElementById('login-admin-cancel-button');
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable inputs
                document.getElementById('login-admin-invite-input').disabled = state;
            }
            // Start
            setAdminInviteLoadingState(true);

            const inviteInput = document.getElementById('login-admin-invite-input').value;

            // Send request
            const { error } = await supabase.functions.invoke('invite_user', { body: { email: inviteInput } });

            // Handle response
            if (error) {
                e.target.elements['login-admin-invite-input'].classList.add('invalid');
                e.target.elements['login-admin-invite-input'].focus();
                setAdminInviteErrorMessage(<p id='login-error-text'>Something went wrong while sending the email</p>);
                setAdminInviteLoadingState(false);
                return;
            }

            // On success
            console.log('Invite sent successfully!');
            setAdminInviteErrorMessage(<p className='password-check-green' style={{ textAlign: 'center' }}>Invite sent successfully!</p>);
            setAdminInviteLoadingState(false);
        }

        async function submitAdminChangePermForm(e) {
            e.preventDefault();
            function setAdminChangePermLoadingState(state) {
                // Toggle button loading
                const submitButton = e.target.elements['login-admin-submit-change-perm-button'];
                const cancelButton = e.target.elements['login-admin-clear-sel-user-button'];
                submitButton.classList.toggle('button--loading');
                submitButton.disabled = state;
                cancelButton.disabled = state;
                // Disable inputs
                e.target.elements['login-admin-change-perm-role-select'].disabled = state;
            }
            // Start
            setAdminChangePermLoadingState(true);

            // Get input
            const newRole = e.target.elements['login-admin-change-perm-role-select'].value;
            console.log('New role:', newRole);

            // Validate input
            if ((selectedChangePermUserRole && selectedChangePermUserRole !== newSelectedChangePermUserRole) ? false : true) {
                e.target.elements['login-admin-change-perm-role-select'].classList.add('invalid');
                e.target.elements['login-admin-change-perm-role-select'].focus();
                setAdminChangePermErrorMessage(<p id='login-error-text'>Please select a new role</p>);
                setAdminChangePermLoadingState(false);
                return;
            }

            // Send request
            const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('email', selectedChangePermUser);
            console.log(error)

            // Handle response
            if (error) {
                setAdminChangePermErrorMessage(<p id='login-error-text'>Something went wrong while changing the user role</p>);
                setAdminChangePermLoadingState(false);
                return;
            }

            // On success
            console.log('User role changed successfully!');
            setAdminChangePermErrorMessage(<p className='password-check-green' style={{ textAlign: 'center' }}>User role changed successfully!</p>);
            setAdminChangePermLoadingState(false);
            setSelectedChangePermUserRole(newRole);
            if (selectedChangePermUser === curUser.email) {
                switchPage(pages.user);
            }
        }

        function onUserSelect(e) {
            // Grab parent parent element (the ul) and add a disabled attribute
            if (!e.target.parentElement.parentElement.classList.contains('disabled')) {
                e.target.parentElement.parentElement.classList.add('disabled');
                // Change selected user visual
                document.querySelector('.login-admin-change-perm-user-item.user-selected')?.classList.remove('user-selected');
                e.target.classList.add('user-selected');
                setAdminChangePermErrorMessage(null);
                // Set selected user
                setSelectedChangePermUser(e.target.textContent);
                setSelectedChangePermUserRole(null);
                // Set details area to loading state
                const detailsArea = document.getElementById('login-admin-selected-user-details-section');
                detailsArea.classList.add('user-details-visible');
                detailsArea.querySelector('.button__text')?.parentElement.classList.add('button--loading');
                setTimeout(async () => {
                    // Get selected user and their role
                    const { data, error } = await supabase.from('profiles').select('role').eq('email', e.target.textContent).single();
                    e.target.parentElement.parentElement.classList.remove('disabled');
                    detailsArea.querySelector('.button__text')?.parentElement.classList.remove('button--loading');
                    if (error) {
                        console.error(error);
                        setAdminChangePermErrorMessage(<p id='login-error-text'>Something went wrong while getting the user&apos;s role</p>);
                        return;
                    }
                    // Set details area text
                    setSelectedChangePermUserRole(data?.role ?? 'member');
                    setNewSelectedChangePermUserRole(data?.role ?? 'member');
                }, 0);
            }
        }

        return (
            <div id={pages.admin} className={`slide-away slide-away-active`}>
                <Drawer.Title style={{ textAlign: 'center', margin: '1.5em 0em' }}>Admin</Drawer.Title>
                {/* Content */}
                <div style={{ margin: '0rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    {/* INVITE USER FORM */}
                    <form id='login-admin-invite-form' className='login-form' onSubmit={(e) => { submitAdminInviteForm(e) }}>
                        {/* Option to invite a user */}
                        <label>Invite a user</label>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <input type="email" name='login-admin-invite-input' id='login-admin-invite-input' form='login-admin-invite-form' placeholder='user&apos;s email' style={{ borderRadius: '1em', flexGrow: '1' }} minLength={4} maxLength={254} required
                                onInput={(e) => {
                                    if (typeof e.target.reportValidity === 'function') {
                                        e.preventDefault();
                                        const target = e.target;
                                        const validity = target.validity;
                                        // Clear custom error and recheck
                                        if (validity.customError) {
                                            target.setCustomValidity('');
                                            target.checkValidity();
                                        }
                                        // Input is empty
                                        if (validity.valueMissing) {
                                            target.classList.remove('invalid');
                                            target.setCustomValidity('Please enter an email to invite.');
                                            setIsInviteEmailValid(false);
                                        }
                                        // Input is too short or too long
                                        else if (validity.tooShort || validity.tooLong) {
                                            target.classList.add('invalid');
                                            target.setCustomValidity('Email must be at least 4 characters long.');
                                            setIsInviteEmailValid(false);
                                        }
                                        // Input is valid
                                        else if (target.checkValidity()) {
                                            target.classList.remove('invalid');
                                            setIsInviteEmailValid(true);
                                        }
                                        // Input is invalid (either regex failed or other)
                                        else {
                                            target.classList.add('invalid');
                                            setIsInviteEmailValid(false);
                                        }
                                        target.reportValidity();
                                    }
                                }} />
                            <button type="submit" id='login-admin-submit-invite-button' form='login-admin-invite-form' className='default-button' value="send-invite" title='Send invite' style={{ flexShrink: '0', position: 'relative' }} disabled={!isInviteEmailValid}>
                                <span className='button__text'>Invite</span>
                            </button>
                        </div>
                        {adminInviteErrorMessage}
                    </form>
                    {/* CHANGE PERMISSIONS FORM */}
                    <form id='login-admin-change-perm-form' className='login-form' onSubmit={(e) => { submitAdminChangePermForm(e); }}>
                        <label>Change user special permissions</label>
                        <div className='primary-card-solid' style={{ borderRadius: '1em', padding: '0.5em 0.5em 0.5em 0' }}>
                            <ul style={{ maxHeight: '10em', overflowY: 'scroll', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '1px', margin: '0', padding: '0 0.5em' }}>
                                {userList && typeof userList === 'object' && userList.length > 0 && userList.map((u, i) =>
                                    <li key={'login-admin-change-perm-user-' + i} >
                                        <p className='login-admin-change-perm-user-item' onClick={(e) => { onUserSelect(e) }} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRadius: '0.5em' }}>
                                            {u.email}
                                        </p>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div id='login-admin-selected-user-details-section' style={{ height: 'fit-content', padding: '0 0.5em' }}>
                            <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0', display: 'flex', gap: '0.5em' }}>
                                <span>User:</span>
                                <span style={{ color: 'var(--accent-color)' }}>{selectedChangePermUser}</span>
                            </p>
                            <div style={{ position: 'relative', height: '1.25em' }}>
                                <span className='button__text'>
                                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0', display: 'flex', gap: '0.5em' }}>
                                        {selectedChangePermUserRole &&
                                            <>
                                                <span>Role:</span>
                                                <span style={{ color: 'var(--accent-color)' }}>{selectedChangePermUserRole ?? 'member'}</span>
                                            </>
                                        }
                                    </p>
                                </span>
                            </div>
                            <button type="button" id='login-admin-clear-sel-user-button' form='login-admin-change-perm-form' className='default-button red-button' value="clear" title='Clear selected user'
                                disabled={selectedChangePermUser ? false : true}
                                style={{ flexShrink: '0', padding: '0' }}
                                onClick={() => {
                                    setSelectedChangePermUser(null);
                                    setNewSelectedChangePermUserRole(null);
                                    setSelectedChangePermUserRole(null);
                                    setAdminChangePermErrorMessage(null);
                                    const detailsArea = document.getElementById('login-admin-selected-user-details-section');
                                    detailsArea.classList.remove('user-details-visible');
                                    document.querySelector('.login-admin-change-perm-user-item.user-selected')?.classList.remove('user-selected');
                                }}>
                                Deselect user
                            </button>
                        </div>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5em', justifyContent: 'space-between' }}>
                            <div className='select-wrapper'>
                                <select
                                    type='text'
                                    name='login-admin-change-perm-role-select'
                                    id='login-admin-change-perm-role-select'
                                    form='login-admin-change-perm-form'
                                    value={newSelectedChangePermUserRole ?? 'member'}
                                    onInput={(e) => { setNewSelectedChangePermUserRole(e.target.value) }}
                                    title='Choose the permission level'
                                    disabled={selectedChangePermUserRole ? false : true}
                                    style={{ height: '100%', width: '110px' }}
                                >
                                    <option value='member'>member</option>
                                    <option value='vip'>vip</option>
                                    <option value='admin'>admin</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" id='login-admin-submit-change-perm-button' form='login-admin-change-perm-form' className='default-button' value="change-perm" title='Change permission level' disabled={(selectedChangePermUserRole && selectedChangePermUserRole !== newSelectedChangePermUserRole) ? false : true} style={{ flexShrink: '0', position: 'relative' }}>
                                    <span className='button__text'>Change</span>
                                </button>
                            </div>
                        </div>
                        {adminChangePermErrorMessage}
                    </form>
                    {adminErrorMessage}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
                        <button type="button" id='login-admin-cancel-button' form='login-admin-form' className='default-button' value="cancel" title='Go back' onClick={() => { switchPage(pages.user); }}>Back</button>
                    </div>
                </div>
            </div>
        )
    }

    // Helper functions
    // Convert email to starred version
    function starEmail(email) {
        const parts = email.split('@');
        const local = parts[0];
        const localParts = local.split('.');
        const domain = parts[1];
        const domainParts = domain.split('.');

        var starredLocal = '';
        for (var li = 0; li < localParts.length; li++) {
            if (li === 0) {
                starredLocal += localParts[li][0] + '*'.repeat(localParts[li].length - 1);
            } else {
                starredLocal += '.' + '*'.repeat(localParts[li].length);
            }
        }

        var starredDomain = '';
        for (var di = 0; di < domainParts.length; di++) {
            if (di === domainParts.length - 1) {
                starredDomain += '.' + domainParts[di];
            } else if (di === 0) {
                starredDomain += domainParts[di][0] + '*'.repeat(domainParts[di].length - 1);
            } else {
                starredDomain += '.' + '*'.repeat(domainParts[di].length);
            }
        }

        return `${starredLocal}@${starredDomain}`;
    }
}


