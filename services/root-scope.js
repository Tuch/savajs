export default ['$watchers', '$eval', '$parse', '$error', function($watchers, $eval, $parse, $error) {
    var error = $error('$rootScope');
    var id = 0;

    function nextUid() {
        return ++id;
    }

    function Scope(isolate, parent){
        this.$$watchers = $watchers(this);
        this.$$childScopeClass = null;

        this.$root = isolate ? $rootScope : this;
        this.$$phase = null;
        this.$parent = parent || null;
        this.$id = nextUid();
        this.$childs = [];
        this.$live = true;
    }

    Scope.prototype = {
        $watch: function(watchFunction, listener){
            return this.$$watchers.add(watchFunction, listener);
        },

        $watchCollection: function(watchFunction, listener){
            return this.$$watchers.add(watchFunction, listener, true);
        },

        $$linkToChild: function(attrs, link, key, child){
            switch (link) {
                case '=':
                    if (!attrs[key]) {
                        break;
                    }

                    var setter = $parse(key).assign;

                    this.$watch(attrs[key], function(n) {
                        setter(child,  n);
                    });

                    break;
                case '&':
                    //...
                    break;
                case '@':
                    //...
                    break;
            }
        },
        $new: function(isolateObjLinks){
            var parent = this, child;

            if(isolateObjLinks){
                child = new Scope(true, this);

                for(var key in isolateObjLinks.obj) {
                    this.$$linkToChild(isolateObjLinks.attrs, isolateObjLinks.obj[key], key, child);
                }

            } else {
                if (!this.$$childScopeClass) {
                    this.$$childScopeClass = function() {
                        this.$$childScopeClass = this.$$phase = null;
                        this.$$watchers = $watchers(this);

                        this.$id = nextUid();
                        this.$childs = [];
                        this.$parent = parent;
                        this.$live = true;
                        this.$root = $rootScope;
                    };
                    this.$$childScopeClass.prototype = this;
                }

                child = new this.$$childScopeClass();
            }

            this.$childs.push(child);

            return child;
        },

        $destroy: function() {
            //this.$broadcast('$destroy');
            //this.$$watchers.$destroy;
        },

        $apply: function $apply(){
            this.$$phase = '$apply';

            $rootScope.$digest();

            this.$$phase = null;
        },

        $digest: function(){
            if(!this.$live){
                return;
            }

            this.$$phase = '$digest';

            this.$$watchers.$apply();

            for(var i = 0, length = this.$childs.length; i < length; i++){
                this.$childs[i].$digest();
            }

            this.$$phase = null;
        },

        $eval: function(expression){
            return $eval(this, expression);
        }
    };

    var $rootScope = window.rootScope = new Scope();

    return $rootScope;
}];
