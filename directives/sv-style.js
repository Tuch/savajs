import * as h from '../helpers';

export default [function(){

    function link(scope, node, attrs){
        var $node = h.$(node);
        var model = attrs['sv-style'];

        if(!model){
            return;
        }

        scope.$watch(model, function(n){
            $node.css(n);
        });
    }

    return {
        link: link
    };
}];
