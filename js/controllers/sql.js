angular.module('jsMyAdmin')
	.controller('sql', function ($scope, db) {
		$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			theme:'solarized',
			mode: 'text/x-mysql'
		};
	});