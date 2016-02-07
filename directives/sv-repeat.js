import * as h from '../helpers';

export default ['$parse', '$compile', '$error', function($parse, $compile, $error){
    var error = $error('sv-repeat');

    function updateScope (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
        scope[valueIdentifier] = value;

        if (keyIdentifier) {
            scope[keyIdentifier] = key;
        }

        scope.$index = index;
        scope.$first = (index === 0);
        scope.$last = (index === (arrayLength - 1));
        scope.$middle = !(scope.$first || scope.$last);
        scope.$odd = !(scope.$even = (index & 1) === 0);
    }

    function hashKey (value){
        return JSON.stringify(value);
    }

    function link(parentScope, markElement, attrs, ctrls, transcludeFn){
        var expression = attrs['sv-repeat'] || '';
        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

        if (!match) {
            throw error('01', 'Expected expression in form of "_item_ in _collection_[ track by _id_]" but got "{0}".', expression);
        }

        var lhs = match[1];
        var rhs = match[2];
        var aliasAs = match[3];
        var trackByExp = match[4];

        match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);

        if (!match) {
            throw error('02', '"_item_" in "_item_ in _collection_" should be an identifier or "(_key_, _value_)" expression, but got "{0}".', lhs);
        }

        var valueIdentifier = match[3] || match[1];
        var keyIdentifier = match[2];

        if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent)$/.test(aliasAs))) {
            throw error('03', 'alias "{0}" is invalid --- must be a valid JS identifier which is not a reserved name.', aliasAs);
        }

        if (trackByExp) {
            var trackByExpGetter = $parse(trackByExp);
            var trackByIdExpFn = function(key, value, index) {
                var locals = {};
                if (keyIdentifier) {
                    locals[keyIdentifier] = key;
                }

                locals[valueIdentifier] = value;
                locals.$index = index;

                return trackByExpGetter(parentScope, locals);
            };
        } else {
            var trackByIdArrayFn = function(key, value) {
                return hashKey(value);
            };

            var trackByIdObjFn = function(key) {
                return key;
            };
        }


        var lastMap = {};

        function watchListener(collection){
            var collectionIsArray = h.isArray(collection);
            var getTrackByKey = trackByIdExpFn || (collectionIsArray ? trackByIdArrayFn : trackByIdObjFn);
            var nextMap = {};
            var orderList = [];
            var collectionLength = collectionIsArray ? collection.length : Object.keys(collection).length;

            h.forEach(collection, function forEachCollection(val, key) {
                var scope = null;
                var element = null;
                var prevIndex = null;
                var index = orderList.length;
                var trackByKey = getTrackByKey(key, val, index);
                var lastObj = lastMap[trackByKey];

                if(nextMap[trackByKey]) {
                    throw error('04',
                        'Duplicates in a repeater are not allowed. Use "track by" expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}',
                        expression,
                        trackByKey,
                        JSON.stringify(val)
                    );
                }

                if(lastObj) {
                    element = lastObj.element;
                    scope = lastObj.scope;
                    prevIndex = lastObj.index;
                    scope[valueIdentifier] = val;

                    delete lastMap[trackByKey];
                }

                if (!scope) {
                    scope = parentScope.$new();
                }

                updateScope(scope, index, valueIdentifier, val, keyIdentifier, key, collectionLength);

                if(!element) {
                    transcludeFn(scope, function(cloneElement, scope) {
                        element = $compile(cloneElement)(scope);
                    });
                }

                var item = {
                    val: val,
                    element: element,
                    scope: scope,
                    prevIndex: prevIndex,
                    index: index
                };

                nextMap[trackByKey] = item;
                orderList.push(item);
            });

            //for (var key in nextMap){
            //    if(nextMap[key].prevIndex === null){
            //        console.log('enter:', nextMap[key].val);
            //    }
            //}

            for (var key in lastMap){
                //console.log('leave:', lastMap[key].val);
                lastMap[key].element.remove();
            }

            for(var i = 0, length = orderList.length; i < length; i++) {
                markElement.before(orderList[i].element);
            }

            lastMap = nextMap;
        }

        parentScope.$watchCollection(rhs, watchListener);
    }

    return {
        link: link,
        transclude: 'element'
    };
}];
