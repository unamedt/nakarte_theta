import {decode as utf8_decode} from 'utf8';
import {xmlGetNodeText} from './xmlUtils';
import stripBom from '~/lib/stripBom';

function parseGpx(txt, name, preferNameFromFile) {
    var error;

    function getElementText(element) {
        const text = xmlGetNodeText(element);
        return text === null ? null : text.trim();
    }

    function getChildElements(element) {
        return Array.prototype.slice.call(element.childNodes)
            .filter((node) => node.nodeType === 1);
    }

    function parsePointElement(point_element, serializer) {
        var lat = parseFloat(point_element.getAttribute('lat'));
        var lng = parseFloat(point_element.getAttribute('lon'));
        if (isNaN(lat) || isNaN(lng)) {
            error = 'CORRUPT';
            return null;
        }
        const point = {lat: lat, lng: lng};
        const meta = {};
        const extra = [];
        const children = getChildElements(point_element);
        for (const child of children) {
            if (child.tagName === 'ele') {
                const eleText = getElementText(child);
                if (eleText !== null) {
                    point.ele = eleText;
                    const eleValue = parseFloat(eleText);
                    if (!isNaN(eleValue)) {
                        point.alt = eleValue;
                    }
                }
            } else if (child.tagName === 'time') {
                const timeText = getElementText(child);
                if (timeText !== null) {
                    point.time = timeText;
                }
            } else {
                extra.push(serializer.serializeToString(child));
            }
        }
        if (point_element.attributes && point_element.attributes.length) {
            const attributes = {};
            for (const attr of point_element.attributes) {
                if (attr.name === 'lat' || attr.name === 'lon') {
                    continue;
                }
                attributes[attr.name] = attr.value;
            }
            if (Object.keys(attributes).length) {
                meta.attributes = attributes;
            }
        }
        if (extra.length) {
            meta.extra = extra;
        }
        if (Object.keys(meta).length) {
            point.meta = meta;
        }
        return point;
    }

    function getSegmentPoints(segment_element) {
        var points_elements = segment_element.getElementsByTagName('trkpt');
        var points = [];
        const serializer = new XMLSerializer();
        for (var i = 0; i < points_elements.length; i++) {
            var point_element = points_elements[i];
            var point = parsePointElement(point_element, serializer);
            if (!point) {
                break;
            }
            points.push(point);
        }
        return points;
    }

    function getTrackSegments(xml) {
        var segments = [];
        var segments_elements = xml.getElementsByTagName('trkseg');
        for (var i = 0; i < segments_elements.length; i++) {
            var segment_points = getSegmentPoints(segments_elements[i]);
            if (segment_points.length) {
                segments.push(segment_points);
            }
        }
        return segments;
    }

    function getRoutePoints(rte_element) {
        var points_elements = rte_element.getElementsByTagName('rtept');
        var points = [];
        const serializer = new XMLSerializer();
        for (var i = 0; i < points_elements.length; i++) {
            var point_element = points_elements[i];
            var point = parsePointElement(point_element, serializer);
            if (!point) {
                break;
            }
            points.push(point);
        }
        return points;
    }

    function getRoutes(xml) {
        var routes = [];
        var rte_elements = xml.getElementsByTagName('rte');
        for (var i = 0; i < rte_elements.length; i++) {
            var rte_points = getRoutePoints(rte_elements[i]);
            if (rte_points.length) {
                routes.push(rte_points);
            }
        }
        return routes;
    }

    function getWaypoints(xml) {
        var waypoint_elements = xml.getElementsByTagName('wpt');
        var waypoints = [];
        for (var i = 0; i < waypoint_elements.length; i++) {
            var waypoint_element = waypoint_elements[i];
            var waypoint = {};
            waypoint.lat = parseFloat(waypoint_element.getAttribute('lat'));
            waypoint.lng = parseFloat(waypoint_element.getAttribute('lon'));
            if (isNaN(waypoint.lat) || isNaN(waypoint.lng)) {
                error = 'CORRUPT';
                continue;
            }
            let wptName = xmlGetNodeText(waypoint_element.getElementsByTagName('name')[0]) || '';
            try {
                wptName = utf8_decode((wptName));
            } catch (e) {
                error = 'CORRUPT';
                wptName = '__invalid point name__';
            }
            waypoint.name = wptName;
            waypoint.symbol_name = xmlGetNodeText(waypoint_element.getElementsByTagName('sym')[0]);
            waypoints.push(waypoint);
        }
        return waypoints;
    }

    txt = stripBom(txt);
    // remove namespaces
    txt = txt.replace(/<([^ >]+):([^ >]+)/ug, '<$1_$2');
    let dom;
    try {
        dom = (new DOMParser()).parseFromString(txt, "text/xml");
    } catch (e) {
        return null;
    }
    if (dom.documentElement.nodeName === 'parsererror') {
        return null;
    }
    if (dom.getElementsByTagName('gpx').length === 0) {
        return null;
    }
    if (preferNameFromFile) {
        for (let trk of [...dom.getElementsByTagName('trk')]) {
            let trkName = trk.getElementsByTagName('name')[0];
            if (trkName) {
                try {
                    trkName = utf8_decode(xmlGetNodeText(trkName));
                } catch (e) {
                    error = 'CORRUPT';
                }
                if (trkName.length) {
                    name = trkName;
                    break;
                }
            }
        }
    }
    return [{
        name: name,
        tracks: getTrackSegments(dom).concat(getRoutes(dom)),
        points: getWaypoints(dom),
        error: error
    }];
}

export default parseGpx;
