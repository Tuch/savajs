import * as h from '../helpers';

export default [function (){
    var log = console || h.noop;

    function formatError(arg) {
        if (arg instanceof Error) {
            if (arg.stack) {
                arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
                    ? 'Error: ' + arg.message + '\n' + arg.stack
                    : arg.stack;
            } else if (arg.sourceURL) {
                arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
            }
        }
        return arg;
    }

    return {
        error: function(e) {
            log.error(formatError(e));
        },
        warning: function(){
            log.warning.apply(log, arguments);
        }
    };
}];
