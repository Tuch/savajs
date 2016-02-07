export default [function () {
    function link(scope, element, attrs){
        var node = element[0];
        var model = attrs['sv-bind'];

        if(!model){
            return;
        }

        var setterKey = node.nodeType === 3 ? 'nodeValue' : 'innerHTML';

        scope.$watch(model, function(n){
            n = typeof n === 'string' ? n : JSON.stringify(n);

            node[setterKey] = n;
        });
    }

    return {
        link: link
    };
}];
