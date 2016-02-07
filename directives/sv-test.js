export default [function(){
    function link(scope, element, attrs, ctrls, transcludeFn){
        transcludeFn(scope, function(cloneNode){



        });

    }

    return {
        link: link,
        transclude: true,
        //template: '<div>test direct template <span sv-transclude></span></div>'
        templateUrl: '/templates/test/test.html'
    };
}];
