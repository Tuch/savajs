import * as h from '../helpers';

export default ['$http', '$defer', function($http, $defer) {
    function getFromHtml(id) {
        var node = document.getElementById(id);

        return node ? node.innerHTML.replace(/\s/gi,'') : null;
    }

    function getFromUrl(id) {
        var defer = new $defer();

        $http.get(id).always(function(data){
            if (h.isStringe(data)) {
                defer.resolve(data);
            } else {
                defer.reject('');
            }
        });

        return defer.promise();
    }

    return function(id){
        var defer = new $defer();
        var data = getFromHtml(id);

        if(data) {
            defer.resolve(data);
        } else {
            getFromUrl(id).always(function(data){
                defer.resolve(data);
            });
        }

        return defer.promise();
    };
}];
