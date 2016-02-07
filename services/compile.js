import * as h from '../helpers';

export default ['$app', '$rootScope', '$watchers', '$controller', '$templateUrl', '$error', function ($app, $rootScope, $watchers, $controller, $templateUrl, $error) {
    var error = $error('$compile');

    function Attributes(attrs){
        if(!attrs) {
            return;
        }

        for(var i = 0, length = attrs.length; i < length; i++){
            var attr = attrs[i], name = attr.name.replace(/^(data-)|(data:)/ig, '');

            this.add(name, attr.value);
        }

    }

    Attributes.prototype = {
        add: function(key, value){
            if(this[key] === undefined) {
                this[key] = value;
            }
        }
    };

    function prepareDirectives(node) {
        var attrs = new Attributes(node.attributes);
        var possibleDirectives = [];
        var directives = [];
        var scopeProp = false;
        var transclude = false;
        var replace = false;
        var template = null;
        var templateUrl = null;
        //var terminalProp = false;

        if(node.nodeType === 3 && /{{([^}}]+)}}/gi.test(node.nodeValue)) {
            attrs.add('sv-bind',  '\'' + node.nodeValue.replace(/('|")/gi,'\\$1').replace(/{{([^}}]+)}}/gi, '\' + ($1) + \'') + '\'');
        }

        for(var key in attrs){
            possibleDirectives.push({
                type: 'A',
                name: key
            });
        }

        possibleDirectives.push({
            type: 'E',
            name: node.nodeName.toLowerCase()
        });

        for(var i = 0, length = possibleDirectives.length; i < length; i++) {
            var possible = possibleDirectives[i];

            if (!$app.checkDirective(possible.name)) {
                continue;
            }


            var directive = $app.directive(possible.name);
            var restrict = directive.restrict || 'A';
            var name = possible.name;
            var priority = priority || 0;

            if (restrict.indexOf(possible.type) === -1) {
                continue;
            }

            if (h.isFunction(directive)) {
                directives.push({
                    name: name,
                    link: directive,
                    require: undefined,
                    priority: priority,
                    terminal: false
                });

                continue;
            }

            if(directive.scope === true || typeof directive.scope === 'object') {
                if (scopeProp === true || typeof scopeProp === 'object') {
                    throw error('01', 'Multiple directives asking for isolated scope on: {0}', node.cloneNode().outerHTML);
                } else {
                    scopeProp = directive.scope;
                }
            }

            if(directive.transclude) {
                if (transclude === true || transclude === 'element') {
                    throw error('02', 'Multiple directives asking for transclusion on: {0} - {1}', name, directive.transclude.toString());
                } else {
                    transclude = directive.transclude;

                    if(transclude === 'element') {
                        node.attributes.removeNamedItem(name);
                    }
                }
            }

            //if(directive.terminal) {
            //    if (terminalProp) {
            //        throw error('03', 'Multiple directives asking for terminal status on: {0}', name);
            //    } else {
            //        terminalProp = directive.terminal;
            //    }
            //}

            if(directive.template) {
                if (template || templateUrl) {
                    throw error('04', 'Multiple directives asking for template on: {0}', name);
                } else {
                    template = directive.template;
                    replace = directive.replace;
                }
            } else if(directive.templateUrl) {
                if (templateUrl || template) {
                    throw error('04', 'Multiple directives asking for template on: {0}', name);
                } else {
                    templateUrl = directive.templateUrl;
                    replace = directive.replace;
                }
            }

            directives.push({
                name: name,
                link: directive.link,
                require: directive.require,
                priority: directive.transclude ? Infinity : priority,
                controller: directive.controller,
                controllerAs: directive.controllerAs,
                terminal: directive.transclude ? true : !!directive.terminal,
                transclude: directive.transclude
            });
        }

        return {
            list: directives,
            template: template,
            templateUrl: templateUrl,
            replace: replace,
            attrs: attrs,
            transclude: transclude,
            scopeProp: scopeProp
            //terminalProp: terminalProp
        };
    }

    function getControllers(directives, attrs, childScope, linkElement, transcludeFn){
        var ret = {};

        for(var j = 0, length = directives.length; j < length; j++) {
            var directive = directives[j];

            if (directive.controller) {
                ret[directive.name] = $controller(
                    directive.controller === '@' ? attrs[directive.name] : directive.controller,
                    directive.controllerAs,
                    childScope,
                    linkElement,
                    attrs,
                    transcludeFn
                );
            }
        }

        return ret;
    }

    function getChildScope(scope, scopeProp){
        var ret;

        if(scopeProp === true) {
            ret = scope.$new();
        } else if(typeof scopeProp === 'object') {
            ret = scope.$new(scopeProp);
        } else {
            ret = scope;
        }

        return ret;
    }

    function applyDirectiveLinking(directives, ctrls, childScope, linkNode, attrs, transcludeFn){
        for(var j = 0, jLength = directives.length; j < jLength; j++) {
            var directive = directives[j];
            var requires;

            if(!directive.link) {
                continue;
            }

            if(directive.require) {
                requires = [];

                for(var k = 0, kLength = directive.require.length; k < kLength; k++) {
                    var require = directive.require[k];
                    requires.push(ctrls[require]);
                }
            }

            directive.link.call($app, childScope, linkNode, attrs, requires, transcludeFn);

            if(directive.terminal) {
                break;
            }
        }
    }

    function applyDirectivesToNode(element, inheritedTranscludeFn) {
        var node = element[0];
        var preapredDirectives = prepareDirectives(node);
        var directives = preapredDirectives.list;
        var template = preapredDirectives.template;
        var templateUrl = preapredDirectives.templateUrl;
        var replace = preapredDirectives.replace;
        var attrs = preapredDirectives.attrs;
        var transclude = preapredDirectives.transclude;
        var scopeProp = preapredDirectives.scopeProp;
        var childElement = element.contents();
        var linkElement = element;
        var transcludeElement = null;
        var defferedLinkingParams = null;
        var templateLinkingFn = null;
        var templateElement = null;
        var returnFn = linkingFn;

        if(transclude === true) {
            childElement.remove();

            transcludeElement = childElement;
        } else if(transclude === 'element') {
            linkElement = h.$(document.createComment(' ' + node.cloneNode().outerHTML + ' '));
            element.before(linkElement);
            element.remove();

            transcludeElement = element;
        }

        var transcludeFn = (transclude ? createTranscludeFunction(transcludeElement) : null) || inheritedTranscludeFn;
        var linkChildsFn = !transclude && childElement.length ? compileNodes(childElement, transcludeFn) : null;

        if(template) {
            childElement.remove();
            template = h.isFunction(template) ? template.call($app, node, attrs) : template;
            templateElement = h.$(template);
            element.append(templateElement);
            templateLinkingFn = compileNodes(templateElement, transcludeFn);
        } else if(templateUrl) {
            templateUrl = h.isFunction(templateUrl) ? templateUrl.call($app, node, attrs) : templateUrl;

            defferedLinkingParams = [];

            $templateUrl(templateUrl).done(function(data){
                childElement.remove();
                templateElement = h.$(data);
                element.append(templateElement);
                templateLinkingFn = compileNodes(templateElement, transcludeFn);
                defferedLinkingParams[0] && linkingFn(defferedLinkingParams[0]);
            });

            returnFn = function defferedLinkingNodeFn(parentScope) {
                defferedLinkingParams.push(parentScope);
            };
        }

        directives.sort(function(dir1,dir2) {
            return dir1.priority < dir2.priority;
        });

        function linkingFn(scope) {
            var childScope = getChildScope(scope, scopeProp);
            var ctrls = getControllers(directives, attrs, childScope, linkElement, transcludeFn);

            templateLinkingFn && templateLinkingFn(childScope);
            applyDirectiveLinking(directives, ctrls, childScope, linkElement, attrs, transcludeFn);

            linkChildsFn && linkChildsFn(childScope);
        }

        return returnFn;
    }

    function createTranscludeFunction(element){
        return function(scope, cloneConnectFn){
            var cloneElement = element.clone(true);

            for(var i = 0, length = cloneElement.length; i < length; i++){
                cloneConnectFn(cloneElement.eq(i), scope);
            }
        };
    }

    function compileNodes(element, transcludeFn) {
        var linkingFns = [];

        for(var i = 0, length = element.length; i < length; i++) {
            var linkingFn = applyDirectivesToNode(element.eq(i), transcludeFn);

            linkingFn && linkingFns.push(linkingFn);
        }

        return function linkElementToScope(scope) {
            for(var i = 0, length = linkingFns.length; i < length; i++) {
                linkingFns[i](scope);
            }
        };
    }

    function compile(node) {
        node = node || document;

        var element = h.$(node);
        var linkingFn = compileNodes(element, false, null);

        return function(scope){
            linkingFn(scope);
            scope.$digest();

            return node;
        };
    }

    return compile;
}];
