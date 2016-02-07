export default ['$rootScope', '$compile', '$log', function ($rootScope, $compile, $log) {
    return function(dom){
        try {
            $compile(dom)($rootScope);
        } catch (e) {
            $log.error(e);
        }
    };
}];
