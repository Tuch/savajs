export default ['$compile', function($compile){
    function link(scope, element, attrs, ctrls, transcludeFn){
        transcludeFn(scope, function(cloneNode, scope){
            element.empty();
            cloneNode = $compile(cloneNode)(scope);
            element.append(cloneNode);
        });
    }

    return {
        link: link
    };
}];
