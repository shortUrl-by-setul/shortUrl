import { useEffect, useState, useRef } from "react";
import "./HoverTooltip.css"; // Ensure to create a separate CSS file for styles

const InfoTooltip = ({ text = null, message, onClick, width = 'fit-content', openUpward = false, color = 'var(--background-color)' }) => {
    InfoTooltip.propTypes = {
        text: String,
        message: String,
        onClick: Function,
        width: String,
        openUpward: Boolean,
        color: String
    }
    const [visible, setVisible] = useState(false);
    const self = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            self.current.querySelector('.tooltip')?.classList.add('slide-away-tooltip-active');
        }, 20);
    }, [visible]);

    function changeVisible(value) {
        self.current.querySelector('.tooltip')?.classList.remove('slide-away-tooltip-active');
        setTimeout(() => {
            setVisible(value);
        }, 100);
    }

    return (
        <div
            ref={self}
            className="tooltip-container"
            onMouseEnter={() => changeVisible(true)}
            onMouseLeave={() => changeVisible(false)}
            onClick={onClick}
        >
            {text ?? <span className="info-icon">🛈</span>}
            {visible && <div className="primary-card-solid tooltip slide-away-tooltip" style={{ width, ...(openUpward ? { bottom: '130%' } : { top: '130%' }), backgroundColor: color }}>{message}</div>}
        </div>
    );
};

export default InfoTooltip;