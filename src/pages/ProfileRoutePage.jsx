'use client';


import Header from '../components/Header/Header.jsx';
import './ProfileRoutePage.css';
import { useState, useEffect } from 'react';
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import Loading from '../components/Background/Loading.jsx';
import ProfileLinks from '../components/ProfileLinks/ProfileLinks.jsx';
import { useParams } from 'react-router-dom';
import InfoTooltip from '../components/HoverTooltip/HoverTooltip.jsx';


function ProfileRoutePage({ theme, toggleTheme }) {
    ProfileRoutePage.propTypes = {
        theme: String,
        toggleTheme: Function
    }
    // Init loading items
    const [doneLoading, setDoneLoading] = useState(false);
    const [isUserHandleCopied, setIsUserHandleCopied] = useState(false);
    const { handle } = useParams();
    console.log(handle);

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



    return (
        <>
            {/* Loader, Background, and Dialogs */}
            <div className="website-loader-container">
                <Loading />
            </div>
            {/* <Background /> */}
            <PrivacyPolicyDialog />

            {/* Header (logo, profile link, theme toggle) */}
            <Header theme={theme} toggleTheme={toggleTheme} title={""} trailing={<button>View as Vistor</button>} />

            {/* Main Section */}
            <div className='container'>
                {/* User avatar (emoji) */}
                <div className="avatar">🐦‍🔥</div>
                {/* User handle */}

                <InfoTooltip
                    text={<h1 className="handle">{'@' + handle}</h1>}
                    message={isUserHandleCopied ? 'Copied!' : '@' + handle}
                    // openUpward={true}
                    onClick={() => {
                        navigator.clipboard.writeText(handle ? `@${handle}` : `@`);
                        setIsUserHandleCopied(true);
                        setTimeout(() => {
                            setIsUserHandleCopied(false);
                        }, 1000);
                    }}
                />
                {/* User links */}
                <div style={{ display: 'flex' }}>
                    <div className='profile-links' style={{ borderRadius: '2em', padding: '2em', marginRight: '1em', width: '500px' }}>
                        <h3 style={{ marginBottom: '1em' }}>Analytics and Tracking</h3>
                    </div>
                    <ProfileLinks setDoneLoading={setDoneLoading} />
                    <div className='profile-links' style={{ borderRadius: '2em', padding: '2em', marginLeft: '1em', width: '500px' }}>
                        <h3 style={{ marginBottom: '1em' }}>Recent Generations</h3>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {/* <footer style={{ fontFamily: 'Kaushan Script', transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>
                Copyright © 2025 Setul Parekh. All rights reserved. | <button className='link' onClick={() => window.privacyPolicyDialog.showModal()}>Privacy Policy 🙊</button>
            </footer> */}
        </>
    )
}

export default ProfileRoutePage
