/**
 * Created by floriano on 19.02.14.
 */
angular.module('jsMyAdmin')
	.factory('db', function ($http) {

		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

		this.data = {};
		var preventLoadingTableData = false;
		var lastEntry = 0;

		this.getDatabases = function () {
			$http.get('http://localhost:8080/jsMyAdmin/service.php?cmd=getDatabases&mode=json').then(function (result) {
				this.data.databases = result.data.result.data;
				this.data.tables = null;
				this.data.selectedDatabase = null;
				this.data.selectedTableData = null;
				this.data.selectedTable = null;
			}.bind(this));
		};

		this.selectDatabase = function (database) {
			$http.post('service.php?cmd=selectDatabase&mode=json', $.param({db: database.Database})).then(function (result) {
				this.data.tables = result.data.result.data;
				this.data.selectedDatabase = database;
				this.data.selectedTableData = null;
				this.data.selectedTable = null;
			}.bind(this));
		};

		this.selectTable = function (table, execShowTable) {
			$http.post('service.php?cmd=selectTable&mode=json', $.param({db: this.data.selectedDatabase.Database, table: table.name})).then(function (result) {
				this.data.selectedTableStructure = result.data.result.data;
				this.data.selectedTable = table;
				this.data.selectedTableData = null;
				preventLoadingTableData = false;
				lastEntry = 0;
				if (execShowTable) {
					this.showTable();
				}
			}.bind(this));
		};

		this.showTable = function () {
			var offset = this.data.selectedTableData ? this.data.selectedTableData.length : 0;
			if (!preventLoadingTableData) {
				preventLoadingTableData = true;
				$http.post('service.php?cmd=showTable&mode=json', $.param({db: this.data.selectedDatabase.Database, table: this.data.selectedTable.name, offset: offset}))
					.then(function (result) {
						if (this.data.selectedTableData && angular.isArray(this.data.selectedTableData)) {
							this.data.selectedTableData = this.data.selectedTableData.concat(result.data.result.data);
						} else {
							this.data.selectedTableData = result.data.result.data;
						}
						lastEntry = +result.data.result.info.last;
						if (+result.data.result.info.count === lastEntry) {
							preventLoadingTableData = true;
						} else {
							preventLoadingTableData = false;
						}
					}.bind(this));
			}
		};

		return this;
	});