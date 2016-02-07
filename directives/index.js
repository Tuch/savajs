let e = {};

e['input'] = require('./input.js').default;
e['sv-bind'] = require('./sv-bind.js').default;
e['sv-class'] = require('./sv-class.js').default;
e['sv-controller'] = require('./sv-controller.js').default;
e['sv-repeat'] = require('./sv-repeat.js').default;
e['sv-show'] = require('./sv-show.js').default;
e['sv-style'] = require('./sv-style.js').default;
e['sv-transclude'] = require('./sv-transclude.js').default;

let events = require('./events').default;

Object.keys(events).forEach(function (directiveName) {
    e[directiveName] = events[directiveName];
});

export default e;
