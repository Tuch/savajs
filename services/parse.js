export default ['$log', function ($log){
    function setter(scope, value, path){
        evalInScope(scope, 'this.' + path + ' = value;', {'value': value});
    }

    function evalInScope(scope, originalSource, locals) {
        if(originalSource === undefined) {
            return;
        }

        locals = locals || {};

        //привязываем вызов функций к контексту в два шага
        var tmpArray = [];
        var source = originalSource
            //1. вынимаем из строки все, что обернуто в кавычки
            .replace(/("(?:[^\\"]|\\.)*")|('(?:[^\\']|\\.)*')/ig, function(str, p1, p2, offset, s) {
                return '%%' + (tmpArray.push(p1 || p2) - 1) + '%%';
            })
            //2. вставляем в функциях apply метод
            .replace(/(([\w]+).[\w\s.]+)\(([a-z,\s]*)\)/ig, '$1.apply($2, [$3])')
            //3. возвращаем строки
            .replace(/%%([0-9])+%%/ig, function(str, p1, offset, s) {
                return tmpArray[p1];
            })
            //4.  убираем все переносы
            .replace(/\n/ig,'');

        var key, keys = [], values = [];

        for (key in scope) {
            keys.push(key);
            values.push(scope[key]);
        }

        for (key in locals) {
            keys.push(key);
            values.push(locals[key]);
        }

        source = '(function(' + keys.join(', ') + ') {return ' + source + '})';

        try {
            var ret = eval(source).apply(scope, values);
        } catch (e) {
            $log.error(e + ' in "' + originalSource + '"');
        }

        return ret;
    }

    return function(key){
        function getter(scope, locals){
            return evalInScope(scope, key, locals);
        }

        getter.assign = function(scope, value){
            setter(scope, value, key);
        };

        return getter;
    };
}];
