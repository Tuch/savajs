export default ['$app', function($app){
    var CTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;

    return function(controller, identifier, scope, element, attrs, transcludeFn){
        if (typeof controller === 'string') {
            var match = controller.match(CTRL_REG);
            var constructor = match[1];
            identifier = identifier || match[3];
            controller = $app.checkController(constructor) ? $app.controller(constructor) : window[constructor];
        }

        var instance = $app.invoke(controller, {
            '$scope': scope,
            '$element': element,
            '$attrs': attrs,
            '$transclude': transcludeFn
        });

        if (identifier) {
            scope[identifier] = instance;
        }
    };
}];
