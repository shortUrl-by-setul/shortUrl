'use client';

import './MyLinks.css';

import { Drawer } from 'vaul';
import { QR_CODE, SHORTEN_URL } from '../../helper/vars.jsx';
import { supabase } from '../../helper/supabase.jsx';
import ShortUrlMyLinksItemComponent from './Items/ShortUrlMyLinksItemComponent.jsx';
import QrCodeMyLinksItemComponent from './Items/QrCodeMyLinksItemComponent.jsx';
import LoginIllustrationImage from '../../assets/login_illustration.svg';
import EmptyIllustration from '../../assets/empty_illustration.svg';
import { useState, useEffect, useRef } from 'react';

export default function MyLinks({ onDoneLoading }) {
    MyLinks.propTypes = {
        onDoneLoading: Function
    }

    const [userLinks, setUserLinks] = useState([]);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // We'll store our subscriptions in a ref so we can clean them up
    const subsRef = useRef({ linksSubscription: null, qrcodesSubscription: null });

    // Track authentication changes.
    useEffect(() => {
        // Subscribe to auth state changes.
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => authSubscription.unsubscribe();
    }, []);

    // Effect for loading data and setting up/tearing down subscriptions.
    useEffect(() => {

        // If there's no logged-in user, nothing to do.
        if (!user) {
            // Cleanup any subscriptions if still lingering.
            if (subsRef.current.linksSubscription) {
                subsRef.current.linksSubscription.unsubscribe();
            }
            if (subsRef.current.qrcodesSubscription) {
                subsRef.current.qrcodesSubscription.unsubscribe();
            }
            subsRef.current = { linksSubscription: null, qrcodesSubscription: null };
            onDoneLoading();
            return;
        }

        // For a logged-in user: load initial data.
        (async () => {
            const [{ data: links }, { data: { qrcodes } }] = await Promise.all([
                supabase.from('links').select('*').eq('author', user.id),
                supabase.from('profiles').select('qrcodes').eq('id', user.id).limit(1).single()
            ]);
            if (links) links.forEach(link => link.type = SHORTEN_URL);
            if (qrcodes) qrcodes.forEach(qrCode => qrCode.type = QR_CODE);
            const allLinks = [...(links || []), ...(qrcodes || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            // Update user role
            const { data: roleData, error: roleError } = await supabase.from('user_roles').select('role').eq('id', user?.id).limit(1).single();
            if (!roleError && roleData) {
                setUserRole(roleData.role);
            }
            setUserLinks(allLinks);
            onDoneLoading();
        })();

        // Setup channels for real-time subscriptions for links and user data.
        const linksChannel = supabase.channel('realtime:public:links');
        const usersChannel = supabase.channel('realtime:public:profiles');

        // Create subscription for new and deleted links for this user.
        const linksSubscription = linksChannel
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'links',
                filter: `author=eq.${user.id}`,
            },
                (payload) => {
                    setUserLinks((prevLinks) => [...prevLinks, { ...payload.new, type: SHORTEN_URL }].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                }
            )
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'deleted_links',
                filter: `author=eq.${user.id}`,
            },
                (payload) => {
                    setUserLinks((prevLinks) => prevLinks.filter((link) => link.id !== payload.new.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                }
            )
            .subscribe();

        // Create a subscription for QR codes associated with the user via updates on the users table.
        const qrcodesSubscription = usersChannel
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`,
            },
                (payload) => {
                    setUserLinks((prevLinks) => {
                        // Remove any QR codes already stored.
                        const currentLinks = prevLinks.filter((link) => link.type !== QR_CODE);
                        // Convert updated QR code information to the needed format.
                        const newQrcodes = (payload.new.qrcodes || []).map((qrCode) => ({ ...qrCode, type: QR_CODE, })) || [];
                        // Return the combined result sorted by creation date.
                        return [...currentLinks, ...newQrcodes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    });
                }
            )
            .subscribe();

        // Save the subscriptions so we can cancel them on unmount or when user signs out.
        subsRef.current = { linksSubscription, qrcodesSubscription };

        return () => {
            // Cleanup subscriptions when the effect is re-run (for example, on sign-out)
            if (subsRef.current.linksSubscription) {
                subsRef.current.linksSubscription.unsubscribe();
            }
            if (subsRef.current.qrcodesSubscription) {
                subsRef.current.qrcodesSubscription.unsubscribe();
            }
            subsRef.current = { linksSubscription: null, qrcodesSubscription: null };
        };
    }, [user, onDoneLoading]);

    return (
        <Drawer.Root activeSnapPoint={1}>
            <Drawer.Trigger type='button' id='my-links-button' className='default-button' title='View my generated links and QR codes'>My Stuff</Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }} />
                <Drawer.Content className='primary-card-solid' style={{
                    height: '100%', // h-fit
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '2em 2em 0 0',
                    maxHeight: '80%',
                    marginLeft: '-1px',
                    marginRight: '-1px',
                }}>
                    {/* Bar at top */}
                    <div aria-hidden style={{
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        width: '3rem',
                        height: '0.375rem',
                        flexShrink: 0,
                        borderRadius: '9999px',
                        backgroundColor: 'var(--text-color)',
                        marginTop: '1rem',
                        marginBottom: '1rem'
                    }} />
                    <Drawer.Title style={{ textAlign: 'center', marginBottom: '1em' }}>My Links and QR Codes</Drawer.Title>
                    {/* Content */}
                    {
                        user ? userLinks.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '0 1em' }}>
                                <img src={EmptyIllustration} alt='Empty Illustration' style={{ width: '50%', height: '50%', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }} />
                                <h3>Nothing saved yet 🤷‍♂️</h3>
                                <p>Generate a link or save a QR code and it will show up here!</p>
                            </div>
                        ) : (
                            <div style={{
                                margin: '0rem 0rem 1rem 1rem',
                                overflowY: 'auto',
                                overflowX: 'none'
                            }}><div style={{
                                // margin: '0rem 1rem',
                                marginRight: '1rem',
                                gap: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: '1 1 auto',
                            }}>
                                    {
                                        userLinks.map((link) => (
                                            link.type === SHORTEN_URL ? (
                                                <ShortUrlMyLinksItemComponent key={link.id} item={link} userRole={userRole} />
                                            ) : (
                                                <QrCodeMyLinksItemComponent key={link.id} item={link} />
                                            )))
                                    }
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '0 1em' }}>
                                <img src={LoginIllustrationImage} alt='Login Illustration' style={{ height: '50%', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }} />
                                <h3>You are not signed in 🗝️</h3>
                                <p>Login in or create an account to save your links and QR codes!</p>
                            </div>
                        )
                    }
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}