'use client';


import LoginDrawer from '../components/Login/LoginDrawer.jsx';
import Header from '../components/Header/Header.jsx';
import './ShortUrlRoutePage.css';
import Operator from '../components/Operator/Operator.jsx';
import { useState, useEffect } from 'react';
import Background from '../components/Background/Background.jsx'
import PrivacyPolicyDialog from '../components/Dialogs/PrivacyPolicyDialog.jsx';
import MyLinks from '../components/MyLinks/MyLinks.jsx';
import Loading from '../components/Background/Loading.jsx';


function ShortUrlRoutePage({ theme, toggleTheme }) {
  ShortUrlRoutePage.propTypes = {
    theme: String,
    toggleTheme: Function
  }
  // Init loading items
  const [doneLoadingLoginButton, setDoneLoadingLoginButton] = useState(false);
  const [doneLoadingMyLinks, setDoneLoadingMyLinks] = useState(false);
  const [doneLoadingShortenUrl, setDoneLoadingShortenUrl] = useState(false);


  useEffect(() => {
    if (doneLoadingLoginButton && doneLoadingMyLinks && doneLoadingShortenUrl) {
      const loaderElement = document.querySelector(".website-loader-container");
      if (loaderElement) {
        loaderElement.style.opacity = '0';
        setTimeout(() => {
          loaderElement.remove();
        }, 400);
      }
    }
  }, [doneLoadingLoginButton, doneLoadingMyLinks, doneLoadingShortenUrl]);

  return (
    <>
      {/* Loader, Background, and Dialogs */}
      <div className="website-loader-container">
        <Loading />
      </div>
      <Background />
      <PrivacyPolicyDialog />

      {/* Header (logo, profile link, theme toggle) */}
      <Header theme={theme} toggleTheme={toggleTheme} title={"shortUrl"} trailing={<LoginDrawer onDoneLoading={() => setDoneLoadingLoginButton(true)} />} />

      {/* Main Section */}
      <div className='container'>
        {/* Where the magic happens */}
        <Operator onDoneLoading={() => setDoneLoadingShortenUrl(true)} />
        <div>
          {/* Links Button */}
          <MyLinks onDoneLoading={() => setDoneLoadingMyLinks(true)} />
        </div>
      </div>

      {/* Footer */}
      <footer className='footer' style={{ fontFamily: 'Kaushan Script', transition: 'color var(--quick-transition-duration) var(--primary-curve)' }}>
        Copyright © 2025 Setul Parekh. All rights reserved. | <button className='link' onClick={() => window.privacyPolicyDialog.showModal()}>Privacy Policy 🙊</button> | <button className='link' onClick={() => window.open('https://www.setulp.com', '_blank')}>My Portfolio 📂</button>
      </footer>
    </>
  )
}

export default ShortUrlRoutePage



















// Query links table for user links
// User data: [list of...]
// QR Code
// {
//   id: 'uuid',
//   created_at: 'date',
//   settings: {...}
// }