function encode(s) {
    return (btoa(s)
            .replace(/\+/ug, '-')
            .replace(/\//ug, '_')
        // .replace(/=+$/, '')
    );
}

function decode(s) {
    var decoded;
    s = s || '';
    if (/%[0-9A-Fa-f]{2}/u.test(s)) {
        try {
            s = decodeURIComponent(s);
        } catch (e) {
            // ignore invalid percent-encoding
        }
    }
    s = s
        .replace(/[\n\r\t]/ug, '')
        .replace(/ /ug, '+')
        .replace(/-/ug, '+')
        .replace(/_/ug, '/');
    const padding = s.length % 4;
    if (padding === 1) {
        return null;
    }
    if (padding) {
        s += '='.repeat(4 - padding);
    }
    try {
        decoded = atob(s);
    } catch (e) {
        // will return null for malformed data
    }
    if (decoded && decoded.length) {
        return decoded;
    }
    return null;
}

export {encode, decode};
