import * as h from './helpers';
import Module from './Module';

export default {
    error: require('./error'),
    element: h.$,
    module: function(name, deps){
        return new Module(name, deps);
    },

    bootstrap: function(dom, app){
        app.service('$bootstrap')(dom);
    },

    h: h
};
