
import './DefaultDialog.css';

import { useRef, useEffect } from 'react';


export default function AreYouSureDialog({ onClose, title = "Are you sure?", text = "If you are certain about your decision, click 'Yes'.", data = [] }) {
    AreYouSureDialog.propTypes = {
        onClose: Function,
        title: String,
        text: String,
        data: Array[String]
    }

    const ref = useRef(null);

    function handleClose({ target: dialog, retVal: value },) {
        if (dialog.id === "areYouSureDialog") {
            dialog.classList.add('hide');
            onClose(value);
            setTimeout(() => {
                dialog.classList.remove('hide');
                dialog.close();
            }, 400);
        }
    }
    function handleEscapeKey(event) {
        if (!ref.current) return;
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            handleClose({ target: ref.current, retVal: false });
        }
    }

    useEffect(() => {
        setTimeout(() => {
            ref.current?.showModal();
        }, 0);

        const dialog = ref.current;
        if (!dialog) return;
        dialog.addEventListener("click", (event) => { handleClose({ target: event.target, retVal: false }); });
        dialog.addEventListener("keydown", (event) => { handleEscapeKey(event); });

        return () => {
            dialog.removeEventListener("click", (event) => { handleClose({ target: event.target, retVal: false }); });
            dialog.removeEventListener("keydown", (event) => { handleEscapeKey(event); });
        }
    }, []);


    function handleSubmit(event) {
        event.preventDefault();
        handleClose({ target: ref.current, retVal: true });
    }

    function handleCancel(event) {
        event.preventDefault();
        handleClose({ target: ref.current, retVal: false });
    }


    return (
        <div className='dialog-container'>
            <dialog id="areYouSureDialog" className='primary-card-solid' ref={ref} style={{ maxWidth: '500px' }} >
                <div style={{
                    padding: '2rem', maxWidth: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{title}</h3>
                    <form id='are-you-sure-form' method='dialog' style={{
                        gap: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        // flex: '1 1 auto',
                    }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            {data.length !== 0 && text}
                            {data.length !== 0 ? (
                                <ul title={data[0]} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    margin: '0.5em 0 0 0',
                                    listStyle: 'none',
                                    padding: '0.75em',
                                    gap: '0.5em',
                                    // border: '1px solid var(--secondary-color)',
                                    backgroundColor: 'rgb(from var(--secondary-color) r g b / 37.5%)',
                                    borderRadius: '1em',
                                }}>
                                    {data.map((item, index) => (
                                        <li key={index} style={{
                                            color: 'rgb(from var(--text-color) r g b / 75%)',
                                            // border: `1px solid ${index !== 0 ? 'transparent' : 'rgb(from var(--accent-color) r g b / 25%)'}`,
                                            backgroundColor: index !== 0 ? 'transparent' : 'rgb(from var(--accent-color) r g b / 25%)',
                                            borderRadius: index !== 0 ? '0' : '0.5em',
                                            // margin: '0 0.5em',
                                            marginTop: '2px',
                                            padding: ' 0 0.75em',
                                            width: 'fit-content',
                                            maxWidth: '100%',
                                            maxHeight: '6em',
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            textOverflow: 'ellipsis',
                                            // mask: index !== 0 ? 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 1) 100%)' : 'none',
                                            whiteSpace: index !== 0 ? 'normal' : 'nowrap',
                                            wordWrap: index !== 0 ? 'break-word' : 'normal',
                                        }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{text}</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button type="cancel" form='are-you-sure' className='default-button' value="no" title="No" onClick={(e) => { handleCancel(e); }}>No</button>
                            <button type="submit" form='are-you-sure' className='default-button primary-button' value="yes" title='Yes' onClick={(e) => { handleSubmit(e); }}>Yes</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
