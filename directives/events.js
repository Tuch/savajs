import * as h from '../helpers';

let events = {};
'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup'.split(' ').forEach(function(name) {
    var directiveName = 'sv-' + name;

    events[directiveName] = ['$parse', '$watchers', function($parse, $watchers) {
        return function(scope, node, attrs) {

            h.$(node).on(name, function(event) {
                var fn = $parse(attrs['sv-' + name]);

                fn && fn(scope, {$event:event});
                scope.$apply();
            });

        };
    }];
});

export default events;
