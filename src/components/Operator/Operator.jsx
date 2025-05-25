import './Operator.css';
import { SHORTEN_URL, QR_CODE } from '../../helper/vars.jsx'
import ShortenUrlCard from '../Cards/ShortenUrlCard.jsx';
import QrCodeCard from '../Cards/QrCodeCard.jsx';
import { useState, useEffect } from 'react';


export default function Operator({ onDoneLoading }) {
    Operator.propTypes = {
        onDoneLoading: Function
    }
    const [toggled, setToggled] = useState(false);

    function onToggle(value) {
        if (value === toggled) return;
        const card = toggled ? document.getElementById(`${QR_CODE}-card`) : document.getElementById(`${SHORTEN_URL}-card`);
        if (!card) return;
        card.classList.remove('op-slide-away-active');

        setTimeout(() => {
            setToggled(value);
        }, 150);
    }

    useEffect(() => {
        const card = toggled ? document.getElementById(`${QR_CODE}-card`) : document.getElementById(`${SHORTEN_URL}-card`);
        if (!card) return;
        card.classList.remove('op-slide-away-active');
        setTimeout(() => {
            card.classList.add('op-slide-away-active');
        }, 50);
    }, [toggled]);

    return (
        <>
            <div className='operation-selector primary-card-blurred'>
                <label>
                    <input value="value-1" name="value-radio" id="value-1" type="radio" defaultChecked={true} onChange={() => onToggle(false)} title="Shorten a URL" />
                    <span title="Shorten a URL">Shorten URL</span>
                </label>
                <label>
                    <input value="value-2" name="value-radio" id="value-2" type="radio" onChange={() => onToggle(true)} title="Generate a QR Code" />
                    <span title="Generate a QR Code">QR Code Generator</span>
                </label>
                <span className="selection"></span>
            </div>
            <div className='card-container'>
                {
                    toggled
                        ? <QrCodeCard />
                        : <ShortenUrlCard onDoneLoading={onDoneLoading} />
                }
            </div>
        </>

    );
}
