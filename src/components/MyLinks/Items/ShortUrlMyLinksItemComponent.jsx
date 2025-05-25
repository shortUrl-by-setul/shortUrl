import { useRef, useState } from 'react';

import LinkIcon from '../../../assets/link.png';
import { supabase } from '../../../helper/supabase.jsx';
import { ShortUrlMyLinksItem } from '../../../helper/vars.jsx';
import AreYouSureDialog from '../../Dialogs/AreYouSureDialog.jsx';

import './Item.css';

export default function ShortUrlMyLinksItemComponent({ item, userRole }) {
    ShortUrlMyLinksItemComponent.propTypes = {
        item: ShortUrlMyLinksItem,
        userRole: String
    }

    const containerRef = useRef();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Don't want to use id since it may be sensitive info
    const randID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    function onCopy(e) {
        e.preventDefault();
        navigator.clipboard.writeText('https://url.setulp.com/' + item.id);
        const button = document.getElementById(`link-item-button-${randID}`);
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

    async function onDeleteConfirmChoice(confirmed) {
        if (confirmed) {
            if (!containerRef.current) return;
            containerRef.current.classList.toggle('button--loading');
            // containerRef.current.style.backgroundColor = 'rgb(from red r g b / 5%)';
            // containerRef.current.style.borderColor = 'transparent';
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // const { data: { links } } = await supabase.from('links').select('*').eq('author', user.id);
            const { error: error } = await supabase.from('links').delete().eq('id', item.id);
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
            {isDialogOpen && <AreYouSureDialog onClose={onDeleteConfirmChoice} title='Delete URL' text='Are you sure you want to permanently delete this URL? This link will no longer work.' data={['https://url.setulp.com/' + item.id, item.long_url]} />}
            <div ref={containerRef} className='link-item-container primary-card-solid'>
                <span className='button__text' style={{ width: '100%', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <img src={LinkIcon} alt='Link icon' className='link-item-icon-1' />
                        </div>
                        <div className='link-item-text' style={{ flexGrow: 1, overflow: 'hidden' }}>
                            <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.id}</h3>
                            <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.long_url}</p>
                            {(userRole === 'admin' || userRole === 'vip') && <p style={{ fontSize: 'smaller', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{'Visits: ' + item.times_visited}</p>}
                            <p style={{ fontSize: 'smaller', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{'Created: ' + new Date(item.created_at).toLocaleString()}</p>
                            <p style={{ fontSize: 'smaller', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{'Expires: ' + (item.expires_at ? new Date(item.expires_at).toLocaleString() : 'Never')}</p>
                            <button className="default-button red-button" style={{ margin: '0', padding: '0' }} title='Delete short URL forever' onClick={() => setIsDialogOpen(true)}>Delete</button>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                            <button id={`link-item-button-${randID}`} className="default-button primary-button link-item-button" style={{ position: 'relative' }} title='Copy URL' onClick={onCopy}>
                                <span className="button__text">Copy</span>
                            </button>
                        </div>
                    </div>
                </span>
            </div>
        </>
    );
}