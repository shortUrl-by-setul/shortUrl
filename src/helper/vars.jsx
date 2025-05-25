export const QR_CODE = 'qr-code';
export const SHORTEN_URL = 'shorten-url';
export const DEFAULT_QR_CODE_VALUE = '';
export const DEFAULT_QR_CODE_SETTINGS = {
    title: 'QR Code',
    bgColor: "#FFFFFF",
    fgColor: "#000000",
    size: 2056,
    ecLevel: "M",
    quietZone: 0,
    enableCORS: false,
    logoImage: {
        name: '',
        base64: '',
    },
    logoWidth: 128,
    logoHeight: 128,
    logoOpacity: 1,
    removeQrCodeBehindLogo: false,
    logoPadding: 0,
    logoPaddingStyle: 'square',
    qrStyle: 'squares',
    eyeRadius: 0,
    eyeColor: "#000000"
};




export class MyLinksItem {
    constructor(type) {
        this.type = type;
    }
}

export class ShortUrlMyLinksItem extends MyLinksItem {
    constructor({ longUrl, shortUrl }) {
        super(SHORTEN_URL);
        this.longUrl = longUrl;
        this.shortUrl = shortUrl;
    }
}

export class QrCodeMyLinksItem extends MyLinksItem {
    constructor({ value, settings }) {
        super(QR_CODE);
        this.value = value || DEFAULT_QR_CODE_VALUE;
        this.settings = settings || DEFAULT_QR_CODE_SETTINGS;
    }
}