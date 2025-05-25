import './Background.css';

import Cloud from './Cloud.jsx';

import { useState, useEffect } from 'react';


export default function Background() {
    const [stars, setStars] = useState([]);
    const [blinkState, setBlinkState] = useState({});

    useEffect(() => {
        const numStars = 15;
        const starsArray = [];
        for (let i = 0; i < numStars; i++) {
            starsArray.push({
                id: i,
                x: Math.random() * 960,
                y: Math.random() * 300,
                r: Math.random() * 0.5 + 0.5,
                blinkInterval: Math.random() * 2000 + 1000,
                duration: Math.random() * 1 + 0.35,
            });
        }
        setStars(starsArray);
    }, []);

    useEffect(() => {
        const intervalIds = {};
        stars.forEach((star) => {
            intervalIds[star.id] = setInterval(() => {
                setBlinkState((prevBlinkState) => ({
                    ...prevBlinkState,
                    [star.id]: !prevBlinkState[star.id],
                }));
            }, star.blinkInterval);
        });
        return () => {
            Object.values(intervalIds).forEach((intervalId) => clearInterval(intervalId));
        };
    }, [stars]);

    return (
        <svg
            id="background"
            viewBox="0 0 960 540"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMinYMin meet"
            shapeRendering="auto"
            fill="rgba(0,0,0,0)"
        >

            <defs>
                {/* Waves */}
                <path id='wavePath1' d='M 0 2000 0 500 Q 150 400 300 500 t 300 0 300 0 300 0 300 0 300 0  v1000 z' />
                <path id='waveMotionPath1' d='M -600 0 0 0' />
                <path id='wavePath2' d='M 0 2000 0 500 Q 88 470 176 500 t 176 0 176 0 176 0 176 0 176 0 176 0 176 0  v1000 z' />
                <path id='waveMotionPath2' d='M -352 0 0 0' />
                <path id='wavePath3'
                    d='M 0 2000 0 500 Q 52 480 104 500 t 104 0 104 0 104 0 104 0 104 0 104 0 104 0 104 0 104 0 104 0 104 0  v1000 z' />
                <path id='waveMotionPath3' d='M -208 0 0 0' />

                {/* Clouds */}
                <Cloud id='cloud1' color={'var(--primary-color)'} scale={0.5} />
                <Cloud id='cloud2' color={'var(--primary-color)'} scale={0.75} />
                <Cloud id='cloud2-1' color={'var(--primary-color)'} scale={0.75} />
                <path id='cloudMotionPath1' d='M -960 0 960 0' />
                <path id='cloudMotionPath2' d='M 0 0 960 0' />
                <path id='cloudMotionPath2-1' d='M -960 0 0 0' />

                {/* Shadow on stars to make them glow */}
                <filter id="f1" x="-40%" y="-30%" width="180%" height="180%" filterUnits="userSpaceOnUse">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                    <feFlood floodColor="white" floodOpacity="1" result="offsetColor" />
                    <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetComposite" />
                    <feMerge>
                        <feMergeNode in="offsetComposite" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* <rect width='100%' height='100%' fill='rgba(0,0,0,0)' /> */}

            {/* Stars */}
            {stars.map((star) => (
                <circle
                    key={star.id}
                    cx={star.x}
                    cy={star.y}
                    r={star.r}
                    fill={blinkState[star.id] ? '#ffffff' : '#ffffff11'}
                    style={{ transition: `fill ${star.duration}s var(--primary-curve)`, filter: 'url(#f1)' }}
                />
            ))}


            {/* Sun/Moon */}
            {/* <g>
                <circle id='background-moon-inner' r="75" style={{ fill: '#94908D' }} />
                <circle id='background-moon-outer' r="15" cx='-20px' cy='40px' style={{ fill: '#726D6A' }} />
                <circle id='background-moon-outer' r="5" cx='-50px' cy='10px' style={{ fill: '#726D6A' }} />
            </g>
            <path
                id='background-sun-outer'
                d="M 122.2969 0 l 11.5313 -37.8375 a 9.375 9.375 90 0 0 -3.3187 -10.2094 l -31.5563 -23.8406 l -12.9281 -37.3687 a 9.375 9.375 90 0 0 -8.6813 -6.3094 l -39.5344 -0.7781 l -32.4563 -22.6031 a 9.375 9.375 90 0 0 -10.7062 0 L -37.8094 -116.3438 l -39.5344 0.7781 a 9.375 9.375 90 0 0 -8.6719 6.3094 l -12.9375 37.3687 l -31.5563 23.8406 a 9.375 9.375 90 0 0 -3.3187 10.2094 L -122.2969 0 l -11.5219 37.8375 a 9.375 9.375 90 0 0 3.3187 10.2094 l 31.5469 23.8406 l 12.9375 37.3687 a 9.375 9.375 90 0 0 8.6719 6.3094 l 39.5438 0.7781 l 32.4375 22.5938 a 9.375 9.375 90 0 0 10.7156 0 l 32.4563 -22.6031 l 39.5344 -0.7781 a 9.375 9.375 90 0 0 8.6813 -6.3094 l 12.9375 -37.3687 l 31.5469 -23.8406 a 9.375 9.375 90 0 0 3.3187 -10.2094 Z"
                style={{ fill: "#FFCA84" }} />
            <circle id='background-sun-inner' r="75" style={{ fill: '#FFAB61' }} /> */}


            {/* Clouds */}
            <use xlinkHref='#cloud1' y='50' fill='rgba(128, 194, 217,0.33)'>
                <animateMotion dur='15s' repeatCount='indefinite'>
                    <mpath xlinkHref='#cloudMotionPath1' />
                </animateMotion>
            </use>

            <use xlinkHref='#cloud2' y='-100' fill='rgba(128, 194, 217,0.33)'>
                <animateMotion dur='5s' repeatCount='indefinite'>
                    <mpath xlinkHref='#cloudMotionPath2' />
                </animateMotion>
            </use>
            <use xlinkHref='#cloud2-1' y='-100' fill='rgba(128, 194, 217,0.33)'>
                <animateMotion dur='5s' repeatCount='indefinite'>
                    <mpath xlinkHref='#cloudMotionPath2-1' />
                </animateMotion>
            </use>

            {/* Waves */}
            <g>
                <use xlinkHref='#wavePath1' y='-130' fill='rgba(128, 194, 217,0.33)'>
                    <animateMotion dur='5s' repeatCount='indefinite'>
                        <mpath xlinkHref='#waveMotionPath1' />
                    </animateMotion>
                </use>
            </g>
            <g>
                <use xlinkHref='#wavePath2' y='-150' fill='rgba(128, 194, 217,0.33)'>
                    <animateMotion dur='5s' repeatCount='indefinite'>
                        <mpath xlinkHref='#waveMotionPath2' />
                    </animateMotion>
                </use>
            </g>
            <g>
                <use xlinkHref='#wavePath3' y='-170' fill='rgba(128, 194, 217,0.33)'>
                    <animateMotion dur='5s' repeatCount='indefinite'>
                        <mpath xlinkHref='#waveMotionPath3' />
                    </animateMotion>
                </use>
            </g>
        </svg>

    );
}
