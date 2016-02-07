import jQuery from 'jquery';

export const extend = function (dst) {
    forEach(arguments, function(obj) {
        if (obj !== dst) {
            forEach(obj, function(value, key) {
                dst[key] = value;
            });
        }
    });

    return dst;
};

export const noop = jQuery.noop;

export const isString = function (val){
    return typeof val === 'string';
};

export const isObject = function (val){
    return typeof val === 'object';
};

export const isDate = function (value) {
    return toString.call(value) === '[object Date]';
};

export const isRegExp = function (value) {
    return toString.call(value) === '[object RegExp]';
};

export const isFunction = function (val){
    return typeof val === 'function';
};

export const isArray = function (val){
    return val instanceof Array;
};

export const isEqual = function (o1, o2) {
    if (o1 === o2) {
        return true;
    }

    if (o1 === null || o2 === null) {
        return false;
    }

    if (o1 !== o1 && o2 !== o2) {
        return true;
    } // NaN === NaN

    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;

    if (t1 == t2) {
        if (t1 == 'object') {
            if (isArray(o1)) {

                if (!isArray(o2)) {
                    return false;
                }

                if ((length = o1.length) == o2.length) {
                    for(key = 0; key < length; key++) {
                        if (!isEqual(o1[key], o2[key])) {
                            return false;
                        }
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() == o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() == o2.toString();
            } else {
                if (o1 === window || o2 === window || isArray(o2)) {
                    return false;
                }

                keySet = {};

                for(key in o1) {
                    if (!isEqual(o1[key], o2[key])) {
                        return false;
                    }

                    keySet[key] = true;
                }
                for(key in o2) {
                    if (!keySet.hasOwnProperty(key) && o2[key] !== undefined && !isFunction(o2[key])) {
                        return false;
                    }
                }

                return true;
            }
        }
    }

    return false;
};

export const forEach = function (obj, iterator, context) {
    if(isArray(obj)){
        for (var i = 0, length = obj.length; i < length; i++) {
            iterator.call(context, obj[i], i);
        }
    } else {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(context, obj[key], key);
            }
        }
    }

    return obj;
};

export const $ = function (nodes){
    if(isString(nodes) && nodes.indexOf('<') > -1) {
        var div = document.createElement('DIV');
        div.innerHTML = nodes;

        nodes = div.childNodes;
    }

    return jQuery(nodes);
};
