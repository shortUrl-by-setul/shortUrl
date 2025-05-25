export default function Cloud({ id, color, scale }) {
    Cloud.propTypes = {
        id: String,
        color: String,
        scale: Number
    }

    return (
        <g id={id} transform={`scale(${scale})`} >
            <ellipse rx="58.746158" ry="37.17271" transform="translate(108.077476 140.16734)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="24.89244" ry="24.89244" transform="translate(141.931194 109.300715)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="88.451137" ry="88.451137" transform="matrix(1 0 0 0.807492 230.382331 102.99463)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="65.218193" ry="52.771973" transform="matrix(1 0 0 0.842767 295.600524 140.16734)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="25.556238" ry="25.556238" transform="translate(355.512963 140.16734)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="47.627535" ry="47.627535" transform="translate(240.305659 150.622165)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
            <ellipse rx="36.342962" ry="36.342962" transform="translate(177.610357 155.165831)" fill={color}
                strokeWidth="0" style={{ transition: 'fill var(--slow-transition-duration) var(--primary-curve)' }} />
        </g>
    );
}
