import { useRef, useState } from 'react';

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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('links').delete().eq('id', item.id);
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
                            {/* https://www.svgrepo.com/svg/502739/link-1 */}
                            <svg alt='Link icon' className='link-item-icon-1' width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 8H6C4.34315 8 3 9.34315 3 11V13C3 14.6569 4.34315 16 6 16H10M9 12H15M14 8H18C19.6569 8 21 9.34315 21 11V13C21 14.6569 19.6569 16 18 16H14" />
                            </svg>
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