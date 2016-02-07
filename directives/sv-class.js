export default [function(){
    function link(scope, element, attrs) {
        var model = attrs['sv-class'];

        if(!model){
            return;
        }

        scope.$watch(model, function(n){
            for(var key in n){
                if(key) {
                    element.toggleClass(key, n[key]);
                }
            }
        });
    }

    return {
        link: link
    };
}];
