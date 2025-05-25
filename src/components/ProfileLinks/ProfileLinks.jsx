'use client';

import { supabase } from '../../helper/supabase.jsx';
import './ProfileLinks.css';
import { useEffect } from 'react';



export default function ProfileLinks({ setDoneLoading }) {
    ProfileLinks.propTypes = {
        setDoneLoading: Function
    };


    function getUserData() {
        const userHandle = window.href.split('@')[1];
        const { userData, userError } = supabase.from('profiles').select('id, qrcodes, handle').eq('handle', userHandle);
        if (userError) {
            console.error(userError);
            return;
        }
        const { userLinksData, userLinksError } = supabase.from('links').select('id, icon, title, long_url').eq('author', userData.id);
        if (userLinksError) {
            console.error(userError);
            return;
        }
        // const allLinks

    }

    useEffect(() => {
        setTimeout(() => {
            setDoneLoading(true);
        }, 500);
    }, []);

    const links = [
        {
            id: 1,
            created_at: new Date().toISOString(),
            title: 'Twitter',
            icon: '✈️',
            subtitle: 'This goes to a safe place',
            short_url: 'https://url.setulp.com/ShortUrl',
            long_url: 'https://twitter.com',
            expires: new Date().toISOString(),
            times_visited: 0
        },
        {
            id: 2,
            created_at: new Date().toISOString(),
            title: 'King\'s Landing',
            icon: '👑',
            subtitle: 'Link to a risky place',
            short_url: 'https://url.setulp.com/s9jfgha',
            long_url: 'https://twitter.com',
            expires: new Date().toISOString(),
            times_visited: 0
        },
        {
            id: 3,
            created_at: new Date().toISOString(),
            title: 'Clover',
            icon: '🍀',
            subtitle: 'Link to a dangerous place',
            short_url: 'https://url.setulp.com/clerk-check-in-form',
            long_url: 'https://www.bing.com/search?pglt=803&q=emojis&cvid=022505ebc63c4c92b323bf82e471b36e&gs_lcrp=EgRlZGdlKgYIABBFGDsyBggAEEUYOzIGCAEQABhAMgYIAhAAGEAyBggDEAAYQDIGCAQQABhAMgYIBRAAGEAyBggGEAAYQDIGCAcQABhAMgYICBBFGDzSAQgxMzUwajBqMagCALACAA&FORM=ANNTA1&PC=U531',
            expires: new Date().toISOString(),
            times_visited: 0
        }
    ]

    function onCopy(e, link) {
        e.preventDefault();
        navigator.clipboard.writeText(link.short_url);
        const button = document.getElementById(`link-item-button-${link.id}`);
        if (!button) return;
        button.classList.add('button--done');
        var count = 5;
        confetti({
            particleCount: count,
            drift: 0,
            startVelocity: 3,
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
        <>
            <div className="profile-links">
                <h3 style={{ marginBottom: '1em' }}>My Pins</h3>
                {links.map((link) => {
                    return (
                        <div key={link.id} className="primary-card-solid profile-links-item" style={{ gap: '0.5em' }}>
                            <span className='profile-link-item-icon'>{link.icon}</span>
                            <div className='profile-link-item-info'>
                                <h3>{link.title}</h3>
                                <p>{link.short_url.split('://')[1]}</p>
                            </div>
                            {/* href={link.long_url} target="_blank" */}

                            <button className='default-button link-item-copy-button' id={`link-item-button-${link.id}`} style={{ display: 'flex', alignItems: 'center', position: 'relative' }} onClick={(e) => onCopy(e, link)} title={'Copy short url'}>
                                <span className='button__text' style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg className='profile-link-item-copy-icon' width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5 14H19C20.1046 14 21 13.1046 21 12V5C21 3.89543 20.1046 3 19 3H12C10.8954 3 10 3.89543 10 5V6.5M5 10H12C13.1046 10 14 10.8954 14 12V19C14 20.1046 13.1046 21 12 21H5C3.89543 21 3 20.1046 3 19V12C3 10.8954 3.89543 10 5 10Z"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </button>
                            <a href={link.long_url} target="_blank" className='default-button link-item-open-button' style={{ display: 'flex', alignItems: 'center' }} title={'Open ' + link.title + ' in a new tab'}>
                                <svg className='profile-link-item-open-icon' width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5,2 L7,2 C7.55228475,2 8,2.44771525 8,3 C8,3.51283584 7.61395981,3.93550716 7.11662113,3.99327227 L7,4 L5,4 C4.48716416,4 4.06449284,4.38604019 4.00672773,4.88337887 L4,5 L4,19 C4,19.5128358 4.38604019,19.9355072 4.88337887,19.9932723 L5,20 L19,20 C19.5128358,20 19.9355072,19.6139598 19.9932723,19.1166211 L20,19 L20,17 C20,16.4477153 20.4477153,16 21,16 C21.5128358,16 21.9355072,16.3860402 21.9932723,16.8833789 L22,17 L22,19 C22,20.5976809 20.75108,21.9036609 19.1762728,21.9949073 L19,22 L5,22 C3.40231912,22 2.09633912,20.75108 2.00509269,19.1762728 L2,19 L2,5 C2,3.40231912 3.24891996,2.09633912 4.82372721,2.00509269 L5,2 L7,2 L5,2 Z M21,2 L21.081,2.003 L21.2007258,2.02024007 L21.2007258,2.02024007 L21.3121425,2.04973809 L21.3121425,2.04973809 L21.4232215,2.09367336 L21.5207088,2.14599545 L21.5207088,2.14599545 L21.6167501,2.21278596 L21.7071068,2.29289322 L21.7071068,2.29289322 L21.8036654,2.40469339 L21.8036654,2.40469339 L21.8753288,2.5159379 L21.9063462,2.57690085 L21.9063462,2.57690085 L21.9401141,2.65834962 L21.9401141,2.65834962 L21.9641549,2.73400703 L21.9641549,2.73400703 L21.9930928,2.8819045 L21.9930928,2.8819045 L22,3 L22,3 L22,9 C22,9.55228475 21.5522847,10 21,10 C20.4477153,10 20,9.55228475 20,9 L20,5.414 L13.7071068,11.7071068 C13.3466228,12.0675907 12.7793918,12.0953203 12.3871006,11.7902954 L12.2928932,11.7071068 C11.9324093,11.3466228 11.9046797,10.7793918 12.2097046,10.3871006 L12.2928932,10.2928932 L18.584,4 L15,4 C14.4477153,4 14,3.55228475 14,3 C14,2.44771525 14.4477153,2 15,2 L21,2 Z" />
                                </svg>
                            </a>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

