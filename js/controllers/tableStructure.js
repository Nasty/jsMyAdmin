/**
 * Created by floriano on 19.02.14.
 */
angular.module('jsMyAdmin')
	.controller('tableStructure', function ($scope, db) {
		$scope.data = db.data;
	});