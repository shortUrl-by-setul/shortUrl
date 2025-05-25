import './QrCodeCard.css';

import { QR_CODE, DEFAULT_QR_CODE_SETTINGS, DEFAULT_QR_CODE_VALUE } from '../../helper/vars.jsx'
import EditIcon from '../../assets/edit.png';
import CloseIcon from '../../assets/close.png';
import DownloadIcon from '../../assets/download.png';
import QRCodeEditorDialog from '../Dialogs/QRCodeEditorDialog.jsx'

import { QRCode } from 'react-qrcode-logo';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../helper/supabase.jsx';


export default function QrCodeCard() {
    const forms = {
        url: 'qr-code-url-form',
        text: 'qr-code-text-form',
        email: 'qr-code-email-form',
        phone: 'qr-code-phone-form',
        wifi: 'qr-code-wifi-form',
        app: 'qr-code-app-form',
        file: 'qr-code-file-form',
        image: 'qr-code-image-form',
        event: 'qr-code-event-form',
    };

    const qrCodeRef = useRef(null);
    const [chosenFile, setChosenFile] = useState('');
    const [qrCodeSettings, setQrCodeSettings] = useState(DEFAULT_QR_CODE_SETTINGS);
    const [logoImageConvertedToUrl, setLogoImageConvertedToUrl] = useState(null);
    const [qrCodeValue, setQrCodeValue] = useState(DEFAULT_QR_CODE_VALUE);
    const [qrCodeInput1, setQrCodeInput1] = useState('');
    const [qrCodeInput2, setQrCodeInput2] = useState('');
    const [qrCodeInput3, setQrCodeInput3] = useState('');
    const [qrCodeInput4, setQrCodeInput4] = useState('');
    const [currentForm, setCurrentForm] = useState(forms.url);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (qrCodeSettings.logoImage.base64) {
            fetch(qrCodeSettings.logoImage.base64)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    setLogoImageConvertedToUrl(blobUrl);
                });
        } else setLogoImageConvertedToUrl(null);
    }, [qrCodeSettings.logoImage]);

    // On selection change, reset inputs and do animation
    useEffect(() => {
        const curForm = document.getElementById(currentForm);
        if (!curForm) return;
        setQrCodeInput1('');
        setQrCodeInput2('');
        if (currentForm === forms.wifi) {
            setQrCodeInput3('WPA');
            setQrCodeInput4('blank');
        }
        else {
            setQrCodeInput3('');
            setQrCodeInput4('');
        }
        setQrCodeValue('');
        curForm.classList.remove('slide-away-active');
        setTimeout(() => {
            curForm.classList.add('slide-away-active');
        }, 50);
    }, [currentForm]);

    // Used to switch between forms
    function switchForm(form) {
        if (form === currentForm) return;
        const curForm = document.getElementById(currentForm);
        if (!curForm) return;
        curForm.classList.remove('slide-away-active');
        setTimeout(() => {
            setCurrentForm(form);
        }, 100);
    }

    // Used to set qrCodeValue if any input changes
    useEffect(() => {
        // After input validation is complete, do code generation validation and then set value
        // Based on the selected input form, set the qrCodeValue using inputs
        switch (currentForm) {
            // If url, we only need qrCodeInput1 (the url)
            case forms.url: setQrCodeValue(qrCodeInput1); break;
            // If text, we only need qrCodeInput1 (the text)
            case forms.text: setQrCodeValue(qrCodeInput1); break;
            // If email, we need qrCodeInput1 (the email), qrCodeInput2 (subject), qrCodeInput3 (body)
            case forms.email:
                if (!qrCodeInput1) break;
                setQrCodeValue(`mailto:${encodeURIComponent(qrCodeInput1)}?subject=${encodeURIComponent(qrCodeInput2)}&body=${encodeURIComponent(qrCodeInput3)}`);
                break;
            // If phone, we need qrCodeInput1 (the phone number)
            case forms.phone: setQrCodeValue(`tel:${encodeURIComponent(qrCodeInput1)}`); break;
            // case 'qr-code-edit-sms': setQrCodeValue(qrCodeInput1); break;
            // If file, we need qrCodeInput1 (the file url)
            case forms.file: setQrCodeValue(`file://${encodeURIComponent(qrCodeInput1)}`); break;
            // If image, we need qrCodeInput1 (the image url)
            case forms.image: setQrCodeValue(encodeURIComponent(qrCodeInput1)); break;
            // case 'qr-code-edit-vid': setQrCodeValue(qrCodeInput1); break;
            // If wifi, we need qrCodeInput1 (the SSID), qrCodeInput2 (password), qrCodeInput3 (WEP|WPA|nopass), qrCodeInput4 (hidden)
            case forms.wifi:
                // WIFI:S:<SSID>;T:<WEP|WPA|nopass>;P:<PASSWORD>;H:<true|false|blank>;;
                // WIFI:S:My_SSID;T:WPA;P:key goes here;H:false;
                // ^    ^         ^     ^               ^
                // |    |         |     |               +-- hidden SSID (true/false)
                // |    |         |     +-- WPA key
                // |    |         +-- encryption type
                // |    +-- ESSID
                // +-- code type
                if (!qrCodeInput1) { setQrCodeValue(''); break; };
                if (!qrCodeInput3 || !["WEP", "WPA", "nopass"].includes(qrCodeInput3)) { setQrCodeValue(''); break; };
                if (qrCodeInput3 !== "nopass") { if (!qrCodeInput2) { setQrCodeValue(''); break; }; }
                if (qrCodeInput4) { if (!["true", "false", "blank"].includes(qrCodeInput4)) { setQrCodeValue(''); break; }; }
                setQrCodeValue(`WIFI:S:${encodeURIComponent(qrCodeInput1)};T:${encodeURIComponent(qrCodeInput2)};P:${encodeURIComponent(qrCodeInput3)};H:${encodeURIComponent(qrCodeInput4)};`);
                break;
            // If app, we need qrCodeInput1 (the app name)
            case forms.app: setQrCodeValue(qrCodeInput1); break;
            // If event, we need qrCodeInput1 (the event name)
            case forms.event: setQrCodeValue(qrCodeInput1); break;
            // case 'qr-code-edit-geo': setQrCodeValue(qrCodeInput1); break;
            default: setQrCodeValue(''); break;
        }
    }, [qrCodeInput1, qrCodeInput2, qrCodeInput3, qrCodeInput4]);

    function validateAndSetValueOnInput(e) {
        e.preventDefault();
        const target = e.target;
        const validity = target.validity;
        if (validity.valueMissing) {
            target.classList.remove('invalid');
            setQrCodeValue('');
            // Set variable value to empty
            switch (target.name) {
                case 'qr-code-input-2': setQrCodeInput2(''); break;
                case 'qr-code-input-3': setQrCodeInput3(''); break;
                case 'qr-code-input-4': setQrCodeInput4(''); break;
                case 'qr-code-input-1':
                default: setQrCodeInput1(''); break;
            }
        }
        else if (target.checkValidity() == true) {
            target.classList.remove('invalid');
            // Set variable value to input value
            switch (target.name) {
                case 'qr-code-input-2': setQrCodeInput2(target.value); break;
                case 'qr-code-input-3': setQrCodeInput3(target.value); break;
                case 'qr-code-input-4': setQrCodeInput4(target.value); break;
                case 'qr-code-input-1':
                default: setQrCodeInput1(target.value); break;
            }
        }
        else {
            target.classList.add('invalid');
            setQrCodeValue('');
            // Set variable value to empty
            switch (target.name) {
                case 'qr-code-input-2': setQrCodeInput2(''); break;
                case 'qr-code-input-3': setQrCodeInput3(''); break;
                case 'qr-code-input-4': setQrCodeInput4(''); break;
                case 'qr-code-input-1':
                default: setQrCodeInput1(''); break;
            }
        }
        target.reportValidity();
    }

    function handleEditorClose(output) {
        if (output) {
            setQrCodeSettings(output);
        }
        setTimeout(() => {
            setIsDialogOpen(false);
        }, 401);
    }

    async function uploadQrCode(e) {
        e.preventDefault();
        const saveButton = document.getElementById('download-qr-code-button');
        saveButton.classList.toggle('button--loading');
        saveButton.disabled = true;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Get current user qrcodes from users table -> id == uid -> qrcodes jsonb array
            const { data: { qrcodes } } = await supabase.from('profiles').select('qrcodes').eq('id', user.id).single();
            if (qrcodes === null) {
                // Create new qrcodes array
                await supabase.from('profiles').update({ qrcodes: [{ id: Math.random() * 1000000000 + new Date().getTime(), created_at: new Date().toISOString(), value: qrCodeValue, settings: qrCodeSettings },] }).eq('id', user.id);
            } else {
                // Append a new item type qrcode
                await supabase.from('profiles').update({ qrcodes: [...qrcodes, { id: Math.random() * 1000000000 + new Date().getTime(), created_at: new Date().toISOString(), value: qrCodeValue, settings: qrCodeSettings },] }).eq('id', user.id);
            }
        }
        await qrCodeRef.current?.download('png', qrCodeSettings.title);
        saveButton.classList.toggle('button--loading');
        saveButton.removeAttribute("disabled");
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
    }

    return (
        <>
            {isDialogOpen && <QRCodeEditorDialog onClose={handleEditorClose} value={qrCodeValue} settings={qrCodeSettings} />}
            <div id={`${QR_CODE}-card`} className={`card ${QR_CODE} primary-card-blurred op-slide-away-right`} style={{}}>
                <h2 style={{ marginBottom: '2em' }}>Generate a QR Code ⚡</h2>
                {/* 🗲 💡 ⚡ */}
                <div className={`card-contents ${QR_CODE}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                        {/* *********** */}
                        {/* VALUE INPUT */}
                        {/* *********** */}
                        {/* Form Selectors */}
                        <div style={{ display: 'flex', justifyContent: 'left', flexWrap: 'wrap', gap: '0.5em', margin: '1em 0' }}>
                            <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.url); }} title='Open a link'>Link</button>
                            <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.text); }} title='Display text'>Text</button>
                            <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.email); }} title='Draft an email'>E-mail</button>
                            <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.phone); }} title='Dial a phone number'>Phone</button>
                            {/* <button className='default-button' id="qr-code-edit-sms" value="tab" type='button' onClick={(e) => switchForm(forms.url)}>SMS</button> */}
                            <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.wifi); }} title='Connect to a WiFi network'>WiFi</button>
                            {/* <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.app); }} title='Open an app or go to the app store'>App</button> */}
                            {/* <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.file); }} title='Open a file'>File</button> */}
                            {/* <button className='default-button' name="tab" type='button' onClick={() => { switchForm(forms.image); }} title='Open an image'>Image</button> */}
                            {/* <button className='default-button' id="qr-code-edit-vid" value="tab" type='button' onClick={(e) => switchForm(forms.url)}>Video</button> */}
                            {/* <button className='default-button' id="qr-code-edit-event" name="tab" type='button' onClick={() => { switchForm(forms.event); }} title='Create an event on the calendar'>Event</button> */}
                            {/* <button className='default-button' id="qr-code-edit-geo" value="tab" type='button' onClick={(e) => switchForm(forms.url)}>Location</button> */}
                        </div>
                        {/* Form */}
                        {switchFormOnInput()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', alignItems: 'center' }}>
                        <div className='qr-code-container' style={{ marginBottom: '1em', backgroundColor: qrCodeSettings.bgColor }}>
                            <button type='button' className='edit-qr-code-button' onClick={() => setIsDialogOpen(true)} title='Open QR Code Editor'>
                                <img src={EditIcon} />
                            </button>
                            <QRCode ref={qrCodeRef} value={qrCodeValue} style={{ width: '256px', height: '256px' }}
                                bgColor={qrCodeSettings.bgColor}
                                fgColor={qrCodeSettings.fgColor}
                                ecLevel={qrCodeSettings.ecLevel}
                                enableCORS={qrCodeSettings.enableCORS}
                                size={qrCodeSettings.size}
                                quietZone={qrCodeSettings.quietZone}
                                logoImage={logoImageConvertedToUrl}
                                logoWidth={qrCodeSettings.logoWidth}
                                logoHeight={qrCodeSettings.logoHeight}
                                logoPadding={qrCodeSettings.logoPadding}
                                logoOpacity={qrCodeSettings.logoOpacity}
                                logoPaddingStyle={qrCodeSettings.logoPaddingStyle}
                                removeQrCodeBehindLogo={qrCodeSettings.removeQrCodeBehindLogo}
                                qrStyle={qrCodeSettings.qrStyle}
                                eyeRadius={qrCodeSettings.eyeRadius}
                                eyeColor={qrCodeSettings.eyeColor} />
                        </div>
                        <button type='button' id="download-qr-code-button" className='default-button' disabled={qrCodeValue === ''} title='Download QR Code' onClick={(e) => uploadQrCode(e)} style={{ borderRadius: '1em', padding: '0.5em 1.25em', position: 'relative', width: 'fit-content', }}>
                            <span className="button__text" style={{ fontSize: '1.35em', paddingBottom: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5em', }}>
                                <img src={DownloadIcon} alt="Download QR Code" id="download-qr-code-icon" />
                                Save
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    function switchFormOnInput() {
        switch (currentForm) {
            case forms.text:
                return <div id={forms.text} className='slide-away' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <p style={{ paddingBottom: '1em' }}>Show some text through a QR Code.</p>
                    <textarea
                        type='text'
                        name='qr-code-input-1'
                        id='text-input'
                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                        style={{ borderRadius: '1em', resize: 'vertical' }}
                        placeholder='type or paste your text here...'
                        autoComplete='off'
                    />
                </div>;
            case forms.email:
                return <form id={forms.email} className='slide-away'>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '1em' }}>
                        <p>Send an email through a QR Code.</p>
                        <input
                            type='email'
                            name='qr-code-input-1'
                            id='email-input'
                            onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            style={{ borderRadius: '1em' }}
                            placeholder='enter an email address...'
                            autoComplete='off'
                            autoCorrect='off'
                            required
                        />
                        <input
                            type='text'
                            name='qr-code-input-2'
                            id='email-subject-input'
                            onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            style={{ borderRadius: '1em' }}
                            placeholder='enter an email subject...'
                            autoComplete='off'
                            autoCorrect='off'
                        />
                        <textarea
                            type='text'
                            name='qr-code-input-3'
                            id='email-text-input'
                            onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            style={{ borderRadius: '1em', resize: 'vertical' }}
                            placeholder='type or paste your email content here...'
                            autoComplete='off'
                        />
                    </div>
                </form>;
            case forms.phone:
                return <div id={forms.phone} className='slide-away' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <label htmlFor='phone-input' style={{ paddingBottom: '1em' }}>Enter a phone number show through a QR Code. Each block should be seperated by a hyphen (-). For example: 123-456-7890</label>
                    <input
                        type='tel'
                        name='qr-code-input-1'
                        id='phone-input'
                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                        style={{ borderRadius: '1em' }}
                        placeholder='___-___-____'
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        autoComplete='off'
                        autoCorrect='off'
                    />
                </div>;
            // case forms.sms: return <></>;
            case forms.wifi:
                // WIFI:S:<SSID>;T:<WEP|WPA|nopass>;P:<PASSWORD>;H:<true|false|blank>;;
                // WIFI:S:My_SSID;T:WPA;P:key goes here;H:false;
                // ^    ^         ^     ^               ^
                // |    |         |     |               +-- hidden SSID (true/false)
                // |    |         |     +-- WPA key
                // |    |         +-- encryption type
                // |    +-- ESSID
                // +-- code type
                return <div id={forms.wifi} className='slide-away' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '1em' }}>
                    <p>Connect to a WiFi network after scanning.</p>
                    <input
                        type='text'
                        name='qr-code-input-1'
                        id='wifi-ssid-input'
                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                        style={{ borderRadius: '1em' }}
                        placeholder='enter WiFi SSID...'
                        autoComplete='off'
                        autoCorrect='off'
                    />
                    <input
                        type='password'
                        name='qr-code-input-2'
                        id='wifi-pas-input'
                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                        style={{ borderRadius: '1em' }}
                        placeholder='enter WiFi password...'
                        autoComplete='off'
                        autoCorrect='off'
                    />
                    <div style={{ display: 'flex', width: '80%', alignItems: 'center', gap: '0.5em' }}>
                        <label htmlFor='qr-code-wifi-enc-type' value='qr-code-wifi-enc-type'>Encryption Type:</label>
                        <div className='select-wrapper'>
                            <select
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                                name='qr-code-input-3'
                                defaultValue={qrCodeInput3}
                                style={{ width: '75px' }}
                            >
                                <option value='WPA'>WPA</option>
                                <option value='WEP'>WEP</option>
                                <option value='nopass'>None</option>
                            </select>
                        </div>

                    </div>
                    <div style={{ display: 'flex', width: '80%', alignItems: 'center', gap: '0.5em' }}>
                        <label htmlFor='qr-code-wifi-hidden-ssid' value='qr-code-wifi-hidden-ssid'>Is SSID hidden:</label>
                        <div className='select-wrapper'>
                            <select
                                onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                                name='qr-code-input-4'
                                defaultValue={qrCodeInput4}
                                style={{ width: '75px' }}
                            >
                                <option value='blank'>Blank</option>
                                <option value='true'>True</option>
                                <option value='false'>False</option>
                            </select>
                        </div>
                    </div>
                </div>;

            case forms.app: return <div id={forms.app} className='slide-away'></div>;
            case forms.file:
                return <div id={forms.file} className='slide-away'>
                    <p>QR Code will resolve to a file.</p>
                    <p>Select the file you wish to share.</p>
                    <p style={{ color: 'var(--accent-color)' }}>Maximum file size: 10MB</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1em' }}>
                        <input type='file' id='qr-file-input' name='qr-code-input-1' accept='application/*' onChange={(e) => { if (e.target.value.length > 0) setChosenFile(e.target.files[0]); }} value={chosenFile} />
                        <button type='button' className='qr-input-file-deselect-button' disabled={!chosenFile} onClick={() => { document.querySelector('#qr-file-input').value = ''; setChosenFile(''); }}>
                            <img src={CloseIcon} />
                        </button>
                    </div>
                </div>;
            case forms.image:
                return <div id={forms.image} className='slide-away'>
                    <p>QR Code will resolve to an image.</p>
                    <p>Select the image you wish to share.</p>
                    <p style={{ color: 'var(--accent-color)' }}>Maximum file size: 10MB</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1em' }}>
                        <input type='file' id='qr-image-input' name='qr-code-input-1' accept='.png, .jpg, .jpeg, .gif, .webp, .svg' onChange={(e) => { if (e.target.value.length > 0) setChosenFile(e.target.files[0]); }} value={chosenFile} />
                        <button type='button' className='qr-input-file-deselect-button' disabled={!chosenFile} onClick={() => { document.querySelector('#qr-image-input').value = ''; setChosenFile(''); }}>
                            <img src={CloseIcon} />
                        </button>
                    </div>
                </div>;
            // case 'qr-code-edit-vid': return <></>;
            case forms.event: return <div id={forms.event} className='slide-away'></div>;
            // case 'qr-code-edit-geo': return <></>;
            case forms.url:
            default:
                return <div id={forms.url} className='slide-away slide-away-active' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <p>Link a website through a QR Code!</p>
                    <p style={{ paddingBottom: '1em' }}>Opens the URL after scanning.</p>
                    <input
                        type='url'
                        name='qr-code-input-1'
                        id='link-input'
                        onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                        style={{ borderRadius: '1em' }}
                        placeholder='type or paste your link here...'
                        pattern='https?:\/\/.+'
                        autoComplete='off'
                        autoCorrect='off'
                    />
                </div>;
        }
    }
}


