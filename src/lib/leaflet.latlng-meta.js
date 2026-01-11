import L from 'leaflet';

function cloneLatLngMeta(meta) {
    if (!meta) {
        return null;
    }
    const clone = {...meta};
    if (meta.attributes) {
        clone.attributes = {...meta.attributes};
    }
    if (meta.extra) {
        clone.extra = meta.extra.slice();
    }
    return clone;
}

function copyLatLngMeta(source, target) {
    if (source && source.meta) {
        target.meta = cloneLatLngMeta(source.meta);
    }
    if (source && source.time !== undefined) {
        target.time = source.time;
    }
    if (source && source.ele !== undefined) {
        target.ele = source.ele;
    }
    return target;
}

function toLatLngWithMeta(point) {
    if (point instanceof L.LatLng) {
        return point;
    }
    if (point === null || point === undefined) {
        return point;
    }
    if (Array.isArray(point)) {
        return L.latLng(point[0], point[1], point[2]);
    }
    const latlng = L.latLng(point.lat, point.lng, point.alt);
    if (point.meta) {
        latlng.meta = cloneLatLngMeta(point.meta);
    }
    if (point.time !== undefined) {
        latlng.time = point.time;
    }
    if (point.ele !== undefined) {
        latlng.ele = point.ele;
    }
    return latlng;
}

function cloneLatLngWithMeta(point, overrides = {}) {
    if (!point) {
        return point;
    }
    if (Array.isArray(point)) {
        return L.latLng(point[0], point[1], point[2]);
    }
    const lat = overrides.lat ?? point.lat;
    const lng = overrides.lng ?? point.lng;
    const alt = overrides.alt ?? point.alt;
    const latlng = L.latLng(lat, lng, alt);
    if (point.meta) {
        latlng.meta = cloneLatLngMeta(point.meta);
    }
    if (point.time !== undefined) {
        latlng.time = point.time;
    }
    if (point.ele !== undefined) {
        latlng.ele = point.ele;
    }
    return latlng;
}

function wrapLatLngWithMeta(point) {
    const wrapped = point.wrap();
    if (point.alt !== undefined) {
        wrapped.alt = point.alt;
    }
    return copyLatLngMeta(point, wrapped);
}

export {copyLatLngMeta, toLatLngWithMeta, cloneLatLngWithMeta, wrapLatLngWithMeta};
