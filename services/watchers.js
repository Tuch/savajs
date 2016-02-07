import * as h from '../helpers';

export default ['$eval', '$log', function ($eval, $log) {
    var watchersList = [];
    var supportOO = !!Object.observe;

    function Watchers(context){
        this._list = [];
        this._context = context;
        this.$phase = 'idle';
    }

    var key = 0;
    function getNextKey(){
        return ++key;
    }

    Watchers.prototype = {
        _createWatchFunction: function (expression) {
            var self = this;

            return function () {
                return $eval(self._context, expression);
            };
        },

        _cloneObject: function(isArray, obj){
            return h.extend(true, isArray ? [] : {}, obj);
        },

        _initOO: function (obj, listener) {
            var self = this;
            var isArray = obj instanceof Array;
            var lastObj = this._cloneObject(isArray, obj);

            Object.observe(obj, function(changes){
                listener.call(self._context, changes[0].object, lastObj);
                lastObj = self._cloneObject(isArray, obj);
            });
        },

        _applyTotalStrategy: function(item, val, force){
            if (!force && h.isEqual(item.lastVal, val)) {
                return;
            }

            if (h.isObject(val)) {
                var obj = val instanceof Array ? [] : {};

                val = h.extend(obj, val);
            }

            item.listener.call(this._context, val, item.lastVal);

            item.lastVal = val;
        },

        _applyCollectionStrategy: function(item, val, force){
            if(!h.isObject(val) || val === null){
                return;
            }

            var changed = false;
            var lastValIsArray = item.lastVal instanceof Array;
            var newValIsArray = val instanceof Array;
            var obj = newValIsArray ? [] : {}, key;

            if(!force && lastValIsArray === newValIsArray && item.lastVal !== undefined && !(newValIsArray && val.length !== item.lastVal.length)) {

                for (key in val) {
                    if (val.hasOwnProperty(key) && val[key] !== item.lastVal[key]) {
                        changed = true;
                        break;
                    }
                }

                if(!changed) {
                    for (key in item.lastVal){
                        if(item.lastVal.hasOwnProperty(key) && val[key] !== item.lastVal[key]){
                            changed = true;
                            break;
                        }
                    }
                }

                if(!changed) {
                    return;
                }
            }

            item.lastVal = h.extend(obj, val);
            item.listener.call(this._context, val);
        },

        $apply: function (force) {
            this.$phase == 'inprogress';

            for (var i = 0, length = this._list.length; i < length; i++) {
                var item = this._list[i];
                var val = item.fn.apply(this._context);

                item.isCollection ? this._applyCollectionStrategy(item, val, force) : this._applyTotalStrategy(item, val, force);
            }

            this.$phase == 'idle';
        },

        _createHandle: function(watchObj){
            var self = this;

            return {
                destroy: function(){
                    if(!watchObj) {
                        return;
                    }

                    self._destroy(watchObj);
                }
            };
        },

        add: function (watchFunction, listener, isCollection) {
            var self = this;
            var type = typeof watchFunction;

            // object observe работает только, если следить нужно за объектом.
            // Когда следить нужно за свойством контекста, данная возможность не работает т.к. свойство может быть переопределено другим объектом
            if(type === 'object' && supportOO){
                this._initOO(watchFunction, listener);

                return this._createHandle(); //пустой объект для заглушки
            } else if(type !== 'function') {
                watchFunction = this._createWatchFunction(watchFunction);
            }

            var watchObj = {
                fn: watchFunction,
                listener: listener,
                lastVal: undefined,
                isCollection: isCollection
            };

            this._list.push(watchObj);

            return this._createHandle(watchObj);
        },

        _destroy: function(watchObj){
            var index = this._list.indexOf(watchObj);

            if (index === -1) {
                return;
            }

            this._list.splice(index, 1);
        }
    };

    function getWatcher(context){
        for(var i = 0, length = watchersList.length; i < length; i++){
            var obj = watchersList[i];

            if(obj.context === context){
                return obj.watchers;
            }
        }

        var watchers = new Watchers(context);

        watchersList.push({
            context: context,
            watchers: watchers
        });

        return watchers;
    }

    var self = this;

    return function(context){
        return getWatcher(context);
    };
}];
