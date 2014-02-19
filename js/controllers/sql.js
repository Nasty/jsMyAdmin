angular.module('jsMyAdmin')
	.controller('sql', function ($scope, db) {
		$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			theme:'solarized',
			mode: 'text/x-mysql',
			extraKeys: {"Ctrl-Space": "autocomplete"}
		};


		$scope.$watch(function () {
			return db.data.selectedTableStructure;
		}, function (tableData) {
			if (tableData) {
				var tables = {};
					tables[db.data.selectedTable.name] = tableData.map(function (val) {
						return val.field;
					});
				CodeMirror.commands.autocomplete = function(cm) {
					CodeMirror.showHint(cm, CodeMirror.hint.sql, {
						tables: tables
					});
				}
			}
		}, true);

	});