export default ['$parse', function($parse){
    Controller.$inject = ['$scope', '$eval'];

    function Controller($scope, $eval){
        //console.log('controller constructed:', $scope, $eval);
    }

    function link(scope, element, attrs, ctrls){
        //для примера получение доступа к контроллеру:
        var ctrl = ctrls[0];
        var model = attrs['sv-model'];
        var node = element[0];
        var value;

        if(!model){
            return;
        }

        var getter = $parse(model), setter = getter.assign;
        scope.$watch(model, function(n, o){
            if(n === value){
                return;
            }

            value = node.value = n;
        });

        element.on('input', function(event){
            value = event.target.value;
            setter(scope, value);
            scope.$apply();
        });

        value = node.value = getter(scope) || '';
    }

    return {
        controller: Controller,
        controllerAs: 'input',
        link: link,
        restrict: 'E',
        require: ['input']
    };
}];
