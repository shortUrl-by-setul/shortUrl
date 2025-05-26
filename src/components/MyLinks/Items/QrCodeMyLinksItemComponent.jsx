import { useRef, useState, useEffect } from 'react';

import { QrCodeMyLinksItem } from '../../../helper/vars.jsx';
import { supabase } from '../../../helper/supabase.jsx';
import { QRCode } from 'react-qrcode-logo';

import './Item.css';
import AreYouSureDialog from '../../Dialogs/AreYouSureDialog.jsx';



export default function QrCodeMyLinksItemComponent({ item }) {
    QrCodeMyLinksItemComponent.propTypes = {
        item: QrCodeMyLinksItem
    }

    const containerRef = useRef(null);
    const qrcodeRef = useRef(null);
    // const createdTimeString = new Date(item.created_at).toLocaleString();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [logoImageConvertedToUrl, setLogoImageConvertedToUrl] = useState(null);

    useEffect(() => {
        if (item.settings.logoImage.base64) {
            fetch(item.settings.logoImage.base64)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    setLogoImageConvertedToUrl(blobUrl);
                });
        } else setLogoImageConvertedToUrl(null);
    }, [item.settings.logoImage]);

    function onDownloadClick(e) {
        e.preventDefault();
        qrcodeRef.current.download('png', item.settings.title);
        const button = document.getElementById(`link-item-button-${item.id}`);
        if (!button) return;
        button.classList.toggle('button--done');
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
            button.classList.toggle('button--done');
        }, 1000);
    }

    async function onDeleteConfirmChoice(confirmed) {
        if (confirmed) {
            if (!containerRef.current) return;
            containerRef.current.classList.toggle('button--loading');
            // containerRef.current.style.backgroundColor = 'rgb(from red r g b / 5%)';
            // containerRef.current.style.borderColor = 'transparent';
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: { qrcodes } } = await supabase.from('profiles').select('qrcodes').eq('id', user.id).limit(1).single();
            const { error: error } = await supabase.from('profiles').update({ qrcodes: qrcodes.filter(qrCode => qrCode.id !== item.id) }).eq('id', user.id);
            if (error) {
                containerRef.current.classList.toggle('button--loading');
                containerRef.current.classList.toggle('button--error');
            }
        }
        setTimeout(() => {
            setIsDialogOpen(false);
        }, 401);
    }

    return (
        <>
            {isDialogOpen && <AreYouSureDialog onClose={onDeleteConfirmChoice} title='Delete QR Code' text='Are you sure you want to permanently delete this QR Code? This action cannot be undone.' data={[item.settings.title, item.value]} />}
            {/* onClick={onDownloadClick} */}
            <div ref={containerRef} className='link-item-container primary-card-solid' >
                <span className='button__text' style={{ width: '100%', height: '100%' }}>
                    {/* Adds ~2x or 72ms to 144ms @ Throttle: Mid-tier Phone */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                        {/* QR Code Icon - Fixed Size */}
                        <div className='link-item-icon-2' style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <QRCode value={item.value} ref={qrcodeRef} id='qrcode-item-icon' style={{ width: 'inherit', height: 'inherit' }}
                                bgColor={item.settings.bgColor}
                                fgColor={item.settings.fgColor}
                                ecLevel={item.settings.ecLevel}
                                enableCORS={item.settings.enableCORS}
                                size={item.settings.size}
                                quietZone={item.settings.quietZone}
                                logoImage={logoImageConvertedToUrl}
                                logoWidth={item.settings.logoWidth}
                                logoHeight={item.settings.logoHeight}
                                logoOpacity={item.settings.logoOpacity}
                                logoPadding={item.settings.logoPadding}
                                logoPaddingStyle={item.settings.logoPaddingStyle}
                                removeQrCodeBehindLogo={item.settings.removeQrCodeBehindLogo}
                                qrStyle={item.settings.qrStyle}
                                eyeRadius={item.settings.eyeRadius}
                                eyeColor={item.settings.eyeColor}
                            />
                        </div>

                        {/* Main Text - Flexible and Ellipsis Applied */}
                        <div className='link-item-text' style={{ flexGrow: 1, overflow: 'hidden' }}>
                            <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.settings.title}</h3>
                            <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</p>
                            <p style={{ fontSize: 'smaller', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}> {'Created: ' + new Date(item.created_at).toLocaleString()}</p>
                            <button type='button' className="default-button red-button" style={{ margin: '0', padding: '0' }} title='Delete QR Code forever' onClick={() => setIsDialogOpen(true)}>Delete</button>
                        </div>

                        {/* Fixed Action Button */}
                        <div style={{ flexShrink: 0 }}>
                            <button type='button' id={`link-item-button-${item.id}`} className="default-button primary-button link-item-button" style={{ position: 'relative' }} title='Download QR Code' onClick={onDownloadClick}>
                                <span className='button__text'>Download</span>
                            </button>
                        </div>
                    </div>
                </span>
            </div>
        </>
    );
}