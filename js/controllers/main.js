/**
 * Created by floriano on 19.02.14.
 */
angular.module('jsMyAdmin', ['ngSanitize', 'infinite-scroll', 'ui.codemirror', 'ui.highlight'])

	.controller('main', function ($scope, db) {

		db.getDatabases();
		$scope.data = db.data;

		$scope.selectDb = db.selectDatabase;
		$scope.selectTable = db.selectTable;
		$scope.showTable = db.showTable;

	});