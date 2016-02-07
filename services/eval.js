export default ['$parse', function ($parse){
    return function(scope, expression, locals){
        return $parse(expression)(scope, locals);
    };
}];
