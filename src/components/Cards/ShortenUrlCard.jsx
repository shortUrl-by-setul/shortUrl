import './ShortenUrlCard.css';

import { SHORTEN_URL } from '../../helper/vars.jsx';
import { supabase } from '../../helper/supabase.jsx';
import Loading from '../Background/Loading.jsx';
import { useEffect, useState } from 'react';
import InfoTooltip from '../HoverTooltip/HoverTooltip.jsx';


export default function ShortenUrlCard({ onDoneLoading }) {
    ShortenUrlCard.propTypes = {
        onDoneLoading: Function
    }

    const [isURLInputValid, setIsURLInputValid] = useState(false)
    const [error, setError] = useState(null);

    // Pages
    const pages = {
        main: 'shorten-url-main-page',
        result: 'shorten-url-result-page',
        loading: 'shorten-url-loading-page',
        error: 'shorten-url-error-page'
    }
    const [currentPage, setCurrentPage] = useState(pages.main);

    // Setup user/loading
    const [user, setUser] = useState(null);
    useEffect(() => {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user);
            onDoneLoading();
        });
        return () => authSubscription.unsubscribe();
    }, []);

    // Used to animate and show the result page
    const [isLinkGenerated, setIsLinkGenerated] = useState(false);
    useEffect(() => {
        if (!isLinkGenerated) return;
        // Confetti
        var duration = 1.25 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, colors: ['#80C2D9'], disableForReducedMotion: true, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, colors: ['#80C2D9'], disableForReducedMotion: true, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        switchPage(pages.result);
    }, [isLinkGenerated]);

    // Used to animate and show the error page
    useEffect(() => {
        if (!error) return;
        switchPage(pages.error);
    }, [error]);

    // Used to animate the page
    useEffect(() => {
        const curPage = document.getElementById(currentPage);
        if (!curPage) return;
        // if (currentPage === pages.main) { curPage.classList.add('slide-away-active'); }
        // else { curPage.classList.add('custom-slide-away-active'); }
        curPage.classList.add('custom-slide-away-active');

    }, [currentPage]);

    // Used to switch between pages
    function switchPage(page) {
        const curPage = document.getElementById(currentPage);
        if (!curPage) return;
        // if (currentPage === pages.main) { curPage.classList.remove('slide-away-active'); }
        // else { curPage.classList.remove('custom-slide-away-active'); }
        curPage.classList.remove('custom-slide-away-active');

        setTimeout(() => {
            setCurrentPage(page);
        }, 150);
    }

    // Submit form
    function handleSubmit(event) {
        event.preventDefault();
        // disable button
        const button = document.querySelector('.generate-button');
        button.disabled = true;
        // disable input
        const url_input = document.getElementById(`${SHORTEN_URL}-input`);
        const alias_input = document.getElementById(`alias-input`);
        const expirey_input = document.getElementById(`expirey-input`);
        url_input.disabled = true;
        alias_input.disabled = true;
        expirey_input.disabled = true;
        // validate inputs?
        const url = url_input.value;
        const alias = alias_input.value;
        const expirey = expirey_input.value;
        switchPage(pages.loading);
        createLink(url, alias, expirey);
    }

    // Create link
    async function createLink(url, alias, expirey) {
        if (!url) {
            setError({ code: 400, message: 'Please enter a valid URL.' });
            return;
        }
        const { data, error } = await supabase.functions.invoke('create_link', { body: { long_url: url, expires_in: expirey, short_url_key: alias } });
        if (error) {
            try {
                const errorDetails = await error.context.json(); // Extract JSON from the response stream
                setError(errorDetails.error);
                console.error(`Error: Response ${errorDetails.error.code}: ${errorDetails.error.message}`);
            } catch (parseError) {
                setError({ code: '400', message: 'Unknown error. Failed to parse error response.' });
                console.error("Failed to parse error response:", parseError, error);
            }
            return;
        }
        const linkText = document.getElementById(`${pages.result}-url`);
        if (!linkText) return;
        linkText.textContent = data.short_url;
        setIsLinkGenerated(true);

        // setTimeout(() => {
        //     setError({ code: '400', message: 'Unknown error. Failed to parse error response.' });
        // }, 1000);
    }

    // Handle enter key
    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            // submit form
            const form = document.querySelector(`#${SHORTEN_URL}-form`);
            form.requestSubmit();
        }
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
            setIsURLInputValid(null);
            target.classList.remove('invalid');
            switch (target_id) {
                case `${SHORTEN_URL}-input`:
                    target.setCustomValidity('A URL to shorten is requried.');
                    break;
                default:
                    break;
            }
        }
        // Input is too short or too long
        else if (validity.tooShort || validity.tooLong) {
            target.classList.add('invalid');
            switch (target_id) {
                case 'alias-input':
                    target.setCustomValidity('An alias must be at least 4 characters long.');
                    break;
                default:
                    break;
            }
        }
        // Input is valid
        else if (target.checkValidity() == true) {
            setIsURLInputValid(true);
            target.classList.remove('invalid');
        }
        else {
            setIsURLInputValid(false);
            target.classList.add('invalid');
            switch (target_id) {
                case `${SHORTEN_URL}-input`:
                    target.setCustomValidity('The URL must be a valid http or https link.');
                    break;
                case 'alias-input':
                    target.setCustomValidity('An alias can only contain letters, numbers, dashes, and underscores.');
                    break;
                default:
                    break;
            }
        }
        target.reportValidity();
    }

    return (
        <div id={`${SHORTEN_URL}-card`} className={`card ${SHORTEN_URL} primary-card-blurred op-slide-away-left`} style={{ position: 'relative' }}>
            {/* Input Section */}
            <div id={pages.main} className={`card-contents ${SHORTEN_URL} custom-slide-away custom-slide-away-active`} style={{ flexDirection: 'column', alignItems: 'center', }}>
                <h2>Shorten a URL ✂️</h2>
                {/* ✂ ✂️ */}
                <form id={`${SHORTEN_URL}-form`} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', width: '100%', alignItems: 'start', gap: '0.25em' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', width: '100%', alignItems: 'start', gap: '0.5em' }}>
                        <p>Shorten a long URL</p>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor={`${SHORTEN_URL}-input`} style={{ display: 'none' }}>Enter your long link</label>
                            <input
                                type='url'
                                name={SHORTEN_URL}
                                id={`${SHORTEN_URL}-input`}
                                form={`${SHORTEN_URL}-form`}
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                style={{ borderRadius: '1em' }}
                                placeholder='type or paste your link here...'
                                pattern='https?:\/\/.+'
                                onKeyDown={handleInputKeyDown}
                                autoComplete='off'
                                autoCorrect='off'
                                required
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '0', gap: '0.5em' }}>
                            <p>Customize</p>
                            <InfoTooltip width='250px' openUpward={true} message={
                                <div style={{ padding: '0.25em' }}>
                                    <p style={{ textAlign: 'start', fontSize: '0.9em', color: 'var(--text-color)' }}>Customize your short url:</p>
                                    <ul style={{ margin: '0', display: 'flex', flexDirection: 'column', gap: '0.25em', padding: '0.25em 0 0 0.3em', listStyle: 'none', fontSize: '0.9em', color: 'var(--text-color)', textAlign: 'start' }}>
                                        <div style={{ display: 'flex', gap: '0.5em' }}>
                                            ➜
                                            <li>Add an alias for your short link rather than the randomly generated string</li>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5em' }}>
                                            ➜
                                            <li>Set a TTL (Time to Live) to control the expiration of your short link</li>
                                        </div>

                                        {/* ➜ ◇ ⋄ ○ ◦ ▷ ▹ ▸ ▶ ● •🔹 💠 */}
                                    </ul>
                                </div>
                            } />
                        </div>
                        <div style={{ display: 'flex', width: '100%' }}>
                            <label htmlFor='alias-input' style={{ display: 'none' }} value='alias'>Enter an optional alias for you short link</label>
                            <input
                                type='text'
                                name='alias-input'
                                id='alias-input'
                                form={`${SHORTEN_URL}-form`}
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateInput(e.target); } }}
                                pattern='^[A-Za-z0-9_\-]*$'
                                maxLength={30}
                                minLength={4}
                                style={{ width: '100%', borderTopLeftRadius: '1em', borderBottomLeftRadius: '1em' }}
                                placeholder='enter an optional alias...'
                                autoComplete='off'
                                autoCorrect='off'
                            />
                            <div id='expirey-input-wrapper' className='select-wrapper' style={{ borderTopLeftRadius: '0em', borderBottomLeftRadius: '0em' }}>
                                <select
                                    type='number'
                                    name='expirey-input'
                                    id='expirey-input'
                                    form={`${SHORTEN_URL}-form`}
                                    defaultValue={'30'}
                                    title='Choose the number of days until link expires'
                                    style={{ borderTopLeftRadius: '0em', borderBottomLeftRadius: '0em', height: '100%', width: '110px' }}
                                >
                                    <option value='1'>1 day</option>
                                    <option value='2'>2 days</option>
                                    <option value='3'>3 days</option>
                                    <option value='5'>5 days</option>
                                    <option value='7'>7 days</option>
                                    <option value='14'>14 days</option>
                                    <option value='30'>30 days</option>
                                    <option value='60' disabled={user ? false : true}>{user ? null : '🗝️'} 60 days</option>
                                    <option value='90' disabled={user ? false : true}>{user ? null : '🗝️'} 90 days</option>
                                    <option value='180' disabled={user ? false : true}>{user ? null : '🗝️'} 180 days</option>
                                    <option value='365' disabled={user ? false : true}>{user ? null : '🗝️'} 365 days</option>
                                    <option value='Never' disabled={user ? false : true}>{user ? null : '🗝️'} Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Captcha and Submit button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '1em', gap: '1em' }}>
                        <p>
                            Just enter your link and hit the big red button to shorten it!
                        </p>
                        <div>
                            <button form={`${SHORTEN_URL}-form`} type='submit' value='generate' className='generate-button' disabled={!isURLInputValid} title='Generate short link' >
                                <span className='back'></span>
                                <span className='front'></span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {/* Loading Section */}
            <div id={pages.loading} className='custom-slide-away' style={{ position: 'absolute', right: '0', left: '0', top: '0', bottom: '0', marginInline: 'auto', width: 'fit-content', display: 'flex', alignItems: 'center', padding: '1em', maxWidth: '100%' }}>
                <Loading />
            </div>
            {/* Result Section */}
            <div id={pages.result} className='custom-slide-away' style={{ position: 'absolute', right: '0', left: '0', top: '0', bottom: '0', marginInline: 'auto', width: 'fit-content', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1em', maxWidth: '100%' }}>
                {/* Resulting Short URL Section */}
                <h2>Your short URL has been generated!</h2>
                <div style={{ margin: '1em', backgroundColor: 'rgb(from var(--secondary-color) r g b / 25%)', borderRadius: '1em', padding: '1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    <p id={`${pages.result}-url`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'https://www.example.com'}</p>
                    <button className='default-button' onClick={() => { navigator.clipboard.writeText(document.getElementById(`${pages.result}-url`).textContent); }}>Copy</button>
                </div>
                <div>
                    <button className='default-button primary-button' onClick={() => { window.location.href = '/'; }}>Generate another!</button>
                </div>
            </div>
            {/* Error Section */}
            <div id={pages.error} className='custom-slide-away' style={{ position: 'absolute', right: '0', left: '0', top: '0', bottom: '0', marginInline: 'auto', width: 'fit-content', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1em', maxWidth: '100%' }}>
                {/* Resulting Short URL Section */}
                <h2 style={{ marginBottom: '0.25em' }}>An error occured</h2>
                <div style={{ marginTop: '0.25em', marginBottom: '0.5em', backgroundColor: 'rgb(from var(--secondary-color) r g b / 25%)', borderRadius: '1em', padding: '1em', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5em', transition: 'background-color var(--slow-transition-duration) var(--primary-curve)' }}>
                    <span style={{ backgroundColor: 'rgb(from #d12e2e r g b / 85%)', padding: '0.35em 0.85em', borderRadius: '1em', fontSize: 'small', fontWeight: 'bold', color: '#ffffff', width: 'fit-content' }}>{`Code: ${error?.code}`}</span>
                    <p style={{ color: '#d12e2e' }}>{error?.message}</p>
                </div>
                <button className='default-button primary-button' onClick={() => { window.location.href = '/'; }} style={{ marginTop: '0.5em' }}>Reload page</button>

            </div>
        </div>
    );
}
