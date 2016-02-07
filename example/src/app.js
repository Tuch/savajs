import sava from '../../index.js';
import index from './templates/index.html';
import bootstrap from './bootstrap-module.js';

var app = sava.module('app', []);

app.controller('Main', ['$scope', function ($scope) {
    //debugger

    this.model = 'test56566';

    this.collection = {
        key1: {field:'field1'},
        key2: {field:'field2'},
        key3: {field:'field3'},
        key4: {field:'field4'}
    };

    this.array = [
        {field:'field1'},
        {field:'field2'},
        {field:'field3'},
        {field:'field4'}
    ];

    this.callback = function(event) {
        alert('click');
    };

    this.format = function(val){
        return val === undefined ? '' : val;
    };

    window.scope = $scope;
}]);

sava.bootstrap(document, app);
