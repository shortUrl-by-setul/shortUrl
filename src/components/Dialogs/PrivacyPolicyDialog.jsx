
import { useRef, useEffect, use } from 'react';
import './DefaultDialog.css';


export default function PrivacyPolicyDialog() {
    function handleClose({ target: dialog }) {
        if (dialog.id === "privacyPolicyDialog") {
            dialog.classList.add('hide');
            setTimeout(() => {
                dialog.classList.remove('hide');
                dialog.close();
            }, 400);
        }
    }
    function handleEscapeKey(event, dialog) {
        if (!dialog) return;
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            handleClose({ target: dialog });
        }
    }
    useEffect(() => {
        const dialog = document.getElementById("privacyPolicyDialog");
        if (!dialog) return;

        dialog.addEventListener("click", handleClose);
        dialog.addEventListener("keydown", (event) => { handleEscapeKey(event, dialog); });

        return () => {
            dialog.removeEventListener("click", handleClose);
            dialog.removeEventListener("keydown", (event) => { handleEscapeKey(event, dialog); });
        }
    }, []);


    return (
        <div className='dialog-container'>
            <dialog id="privacyPolicyDialog" className='primary-card-solid' title='Privacy Policy'>
                <form method="dialog" id='privacy-policy-form' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2.5em', position: 'relative' }}>
                    <div style={{
                        textAlign: 'left',
                        borderRadius: '1em',
                        // height: '90%',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <h2 style={{ textAlign: 'center', paddingBottom: '0.75em' }}>Privacy Policy</h2>
                        <div style={{
                            // margin: '2rem 0rem 2rem 0rem',
                            // height: '600px',
                            // overflowY: 'auto',
                            // overflowX: 'none',
                            outline: 'none',
                        }}><div style={{
                            // margin: '0rem 1rem',
                            // marginRight: '1rem',
                            gap: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            // alignItems: 'center',
                            // flex: '1 1 auto',
                        }}>
                                <p style={{ fontWeight: 'bold' }}>Effective Date: [4/1/2025]</p>

                                ShortUrl (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website shorturl.svparekh.com (&quot;Website&quot;) and use our URL shortener and QR code generator services (collectively, the &quot;Services&quot;). Please read this Privacy Policy carefully. By using our Services, you agree to the terms described in this Privacy Policy.

                                <h3>1. Information We Collect</h3>
                                We may collect the following types of information:
                                <h4 style={{ paddingLeft: '1em' }}>- Information You Provide Directly</h4>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>Email Address: When you contact us or create an account (if applicable).</p>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>Optional Information: Any other details you voluntarily submit through forms, surveys, or account settings.</p>
                                <h4 style={{ paddingLeft: '1em' }}>- Automatically Collected Information</h4>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>Shortened URLs: URLs and corresponding shortened links you generate.</p>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>Metadata: Includes the date and time of URL shortening, access counts, referring pages, and geographic data (if available).</p>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>Device Data: Includes IP address, browser type, operating system, and language preferences.</p>
                                <h4 style={{ paddingLeft: '1em' }}>- Cookies and Tracking Technologies</h4>
                                <p style={{ paddingLeft: 'calc(1em + 2ch)' }}>We use cookies and similar tracking technologies to enhance your user experience, track website performance, and analyze traffic.</p>

                                <h3>2. How We Use Your Information</h3>
                                We may use the collected information for purposes including but not limited to:
                                <p style={{ paddingLeft: '1em' }}>- Providing and improving our URL shortening and QR code generation services.</p>
                                <p style={{ paddingLeft: '1em' }}>- Analyzing trends and usage patterns to enhance website performance.</p>
                                <p style={{ paddingLeft: '1em' }}>- Communicating updates, promotional materials, or technical support.</p>
                                <p style={{ paddingLeft: '1em' }}>- Complying with legal obligations or protecting the security of our Services.</p>

                                <h3>3. Disclosure of Your Information</h3>
                                We do not sell or rent your personal information. However, we may disclose your information in the following circumstances:
                                <p style={{ paddingLeft: '1em' }}>a. Service Providers: With trusted third parties who perform website hosting, analytics, or payment processing on our behalf.</p>
                                <p style={{ paddingLeft: '1em' }}>b. Legal Obligations: To comply with applicable laws, regulations, or legal processes.</p>
                                <p style={{ paddingLeft: '1em' }}>c. Business Transactions: In the event of a merger, acquisition, or sale of assets.</p>

                                <h3>4. Data Retention</h3>
                                We retain shortened URLs, QR codes, and associated metadata for as long as necessary to provide our Services and for legitimate business purposes. You may request deletion of specific records by contacting us at [NO_CONTACT@MAIL.COM].

                                <h3>5. Your Rights</h3>
                                Depending on your location, you may have the following rights:
                                <p style={{ paddingLeft: '1em' }}>Access, modify, or delete your personal data.</p>
                                <p style={{ paddingLeft: '1em' }}>Restrict or object to certain data processing activities.</p>
                                <p style={{ paddingLeft: '1em' }}>Data portability (where applicable).</p>
                                To exercise these rights, please email us at [NO_CONTACT@MAIL.COM].

                                <h3>6. Security of Your Information</h3>
                                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet or method of storage is entirely secure. We encourage you to safeguard your credentials and notify us of any unauthorized use of your account (if applicable).

                                <h3>7. Third-Party Websites</h3>
                                Our Website may contain links to third-party websites. We are not responsible for the content, privacy practices, or security of these external websites. Please review their privacy policies before sharing information.

                                <h3>8. Children&apos;s Privacy</h3>
                                Our Services are not intended for individuals under the age of 13 (or equivalent minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have inadvertently collected such data, please contact us to delete it.

                                <h3>9. Changes to This Privacy Policy</h3>
                                We reserve the right to update this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated policy on our Website. We encourage you to review this Privacy Policy periodically.

                                <h3>10. Contact Us</h3>
                                If you have questions or concerns about this Privacy Policy or our data handling practices, please contact us: Email: [NO_CONTACT@MAIL.COM] Phone: [NO_CONTACT]
                            </div>
                            {/* </div> */}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'end', height: 'fit-content' }} className='dialog-actions'>
                        <button form='privacy-policy-form' className='default-button' autoFocus={true} id="close-privacy-policy" value="default" type='cancel' title='Close'>Close</button>
                    </div>
                </form>
            </dialog>
        </div>
    );
}
