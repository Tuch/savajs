export default [function(){
    function link(scope, element, attrs){
        var model = attrs['sv-show'];

        if(!model){
            return;
        }

        scope.$watch(model, function(n){
            n ? element.show() : element.hide();
        });
    }

    return {
        link: link
    };
}];
