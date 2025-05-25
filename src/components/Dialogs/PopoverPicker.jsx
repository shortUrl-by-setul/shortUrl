import { useCallback, useRef, useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

import useClickOutside from "./useClickOutside";
import './PopoverPicker.css';

export const PopoverPicker = ({ id, color, onChange }) => {
    PopoverPicker.propTypes = {
        id: String,
        color: String,
        onChange: Function
    }

    const popover = useRef();
    const [isOpen, toggle] = useState(false);

    const close = useCallback(() => onClose(), []);
    useClickOutside(popover, close);

    function validateAndSetValueOnInput(event) {
        // event.preventDefault();
        const target = event.target;
        if (target.value.length === 0) {
            target.classList.remove('invalid');
        }
        else if (target.checkValidity() == true) {
            target.classList.remove('invalid');
            // onChange(target.value);
        }
        else {
            target.classList.add('invalid');
        }
        target.reportValidity();
        onChange(target.value);
    }

    useEffect(() => {
        setTimeout(() => {
            if (!popover.current) return;
            popover.current.classList.toggle('popover-active');
        }, 0);
    }, [isOpen]);

    function onClose() {
        if (!popover.current) return;
        popover.current.classList.toggle('popover-active');
        setTimeout(() => {
            toggle(false);
        }, 150);
    }

    return (
        <div className="picker">
            <div
                className="picker-swatch"
                id={id}
                style={{ backgroundColor: color }}
                onClick={() => toggle(true)}
            />

            {isOpen && (
                <div id="popover-element" className="primary-card-solid popover" ref={popover}>
                    <HexColorPicker color={color} onChange={onChange} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1em' }}>
                        <label htmlFor="hex-color-input">HEX</label>
                        <input
                            type='text'
                            name='hex-color-input'
                            id='hex-color-input'
                            onInput={(e) => { if (typeof e.target.reportValidity === 'function') { validateAndSetValueOnInput(e); } }}
                            pattern='^#(?:[0-9a-fA-F]{3,4}){1,2}$'
                            style={{ borderRadius: '0.5em' }}
                            value={color}
                            autoComplete='off'
                            autoCorrect='off'
                        ></input>
                    </div>
                </div>
            )}
        </div>
    );
};
