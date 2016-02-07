let e = {};

e['$bootstrap'] = require('./bootstrap.js').default;
e['$compile'] = require('./compile.js').default;
e['$controller'] = require('./controller.js').default;
e['$defer'] = require('./defer.js').default;
e['$error'] = require('./error.js').default;
e['$eval'] = require('./eval.js').default;
e['$http'] = require('./http.js').default;
e['$log'] = require('./log.js').default;
e['$parse'] = require('./parse.js').default;
e['$rootScope'] = require('./root-scope.js').default;
e['$templateUrl'] = require('./template-url.js').default;
e['$watchers'] = require('./watchers.js').default;

export default e;
