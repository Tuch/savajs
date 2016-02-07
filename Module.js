import * as h from './helpers';
import error from './error';
import services from './services';
import directives from './directives';

var modules = {};

export default function Module(name, deps){
    this._name = name;
    this._components = { directives: {}, services: {}, controllers: {} };
    this._deps = deps;

    modules[name] = this;

    deps = h.extend([], deps);

    for(var i = 0, length = deps.length; i < length; i++){
        var module = modules[deps[i]];

        h.extend(this._components, module._components);
    }

    this.error = error('module');

    this._defineDefaultServices()
        ._defineDefaultDirectives();
}

Module.prototype = {
    controller: function (){
        return this.component('controllers', arguments[0], arguments[1]);
    },

    checkController: function(name){
        return this.checkComponent('controllers', name);
    },

    directive: function (){
        return this.component('directives', arguments[0], arguments[1]);
    },

    checkDirective: function(name){
        return this.checkComponent('directives', name);
    },

    service: function(){
        return this.component('services', arguments[0], arguments[1]);
    },

    checkService: function(name){
        return this.checkComponent('services', name);
    },

    invoke: function(fn, locals, chain) {
        var deps = fn.$inject instanceof Array ? fn.$inject.slice() : [];

        locals = locals || {};
        locals.$app = this;
        chain = chain instanceof Array ? chain.slice() : [];
        chain.push(name);

        for(var i = 0, length = deps.length; i < length; i++){
            var depName = deps[i];
            var local = locals[depName];

            if(chain.indexOf(depName) !== -1){
                throw this.error('01', 'Service "{0}" fixated in "{1}"', depName, name);
            }

            deps[i] = local ? local : this._getComponent('services', depName, chain);

            if(!deps[i]){
                throw this.error('02', 'Unknown service: {0}', depName);
            }
        }

        return new function Constructor(){
            return fn.apply(this, deps);
        };
    },

    component: function(type, components){
        if(arguments[2]) {
            this._setComponent(type, arguments[1], arguments[2]);
        } else if(h.isObject(components)) {
            for(var name in components){
                var body = components[name];
                this._setComponent(type, name, body);
            }
        } else {
            return this._getComponent(type, arguments[1]);
        }
    },

    _setComponent: function(type, name, body){
        body = body || [];

        this._components[type][name] = {
            fn: body[body.length - 1],
            deps: body.splice(0, body.length - 1)
        };
    },

    checkComponent: function(type, name) {
        return !!this._components[type][name];
    },

    _getComponent: function(type, name, chain) {
        if(!this.checkComponent(type, name)) {
            this.error('03', 'undefined component {0} "{1}"', type, name);

            return;
        }

        var component = this._components[type][name];

        if(!component.getFn) {
            component.fn.$inject = component.deps;
            component.getFn = (type === 'controllers') ? component.fn : this.invoke(component.fn, null, chain);
        }

        return component.getFn;
    },

    _defineDefaultServices: function () {
        this.service(services);

        return this;
    },

    _defineDefaultDirectives: function () {
        this.directive(directives);

        return this;
    }
};
