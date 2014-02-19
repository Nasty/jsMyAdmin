<?php
session_start();
if (isset($_SESSION['auth']) && $_SESSION['auth'] !== 'true') {
	include 'login.html';
	die();
}
?>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>jsMyAdmin</title>

	<link rel="stylesheet/less" type="text/css" href="style/styles.less" />
	<link rel="stylesheet/less" type="text/css" href="style/codemirror.css" />
	<link rel="stylesheet/less" type="text/css" href="style/solarized.css" />
	<link rel="stylesheet/less" type="text/css" href="style/show-hint.css" />

	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.ui.js"></script>
	<script type="text/javascript" src="js/jquery.accordion.js"></script>
	<script type="text/javascript" src="js/start.js"></script>
	<script type="text/javascript" src="js/jquery.tablesort.js"></script>
	<!-- <script type="text/javascript" src="js/spin.js"></script> -->
	<script type="text/javascript" src="js/less-1.1.3.min.js"></script>

	<script type="text/javascript">
		<?php
			if(isset($_GET['db']))
			{
		?>
		var trigger = {db: '<?=$_GET['db']?>',
			<?php
				if (isset($_GET['table']))
				{
			?>
			table: '<?=$_GET['table']?>'
		}
		<?php
			} else
			{
		?>
		table: null
		}
		<?php
			}
			} else
			{
		?>
		var trigger = null;
		<?php
			}
		?>
	</script>
</head>
<body ng-app="jsMyAdmin" ng-cloak>
	<header>
		<div id="headline">
			jsMyAdmin
		</div>
		<a href="logout.php" class="button" id="logout">Logout</a>

		<div id="loggedIn" class="button">Logged in as: <?php echo $_SESSION['user']; ?>
			<div>
				<br/>
				since <?php echo date('d.m.Y H:i:s', $_SESSION['loginTime']); ?> <br/>
				last action: <?php echo date('d.m.Y H:i:s', $_SESSION['lastAction']); ?>
			</div>
		</div>
		<br class="cleardiv"/>
	</header>
	<div id="wrapper" ng-controller="main">
		<div id="selector">
			<h3 id="databaseHeader">
				<a href="#" ng-click="hideDatabases=false;">Database</a>
			</h3>
			<div ng-hide="hideDatabases">
				<ul id="databases">
					<li ng-class="{active: data.selectedDatabase == db}" ng-repeat="db in data.databases" ng-click="selectDb(db); view='showStructure'; $parent.hideDatabases=!$parent.hideDatabases">
						{{db.Database}}
					</li>
				</ul>
			</div>
			<h3 id="tableHeader">
				<a href="#">Tables<span ng-show="data.selectedDatabase"> ({{data.selectedDatabase.Database}})</span></a>
			</h3>
			<div ng-show="data.tables.length">
				<input type="text" ng-model="filterTables.name" style="width: 80%; height: 100%; border: 1px solid black;" />
				<ul id="tables">
					<li ng-class="{active: data.selectedTable == table}" ng-repeat="table in data.tables | filter:filterTables" ng-click="selectTable(table, (view=='showData'));" ng-bind-html="table.name | highlight:filterTables.name">
					</li>
				</ul>
			</div>
		</div>

		<div id="content" ng-init="view='showStructure';">

			<h3 id="path">
				<span ng-show="data.selectedDatabase">{{data.selectedDatabase.Database}}</span>
				<span ng-show="data.selectedTable"> / {{data.selectedTable.name}}</span>
			</h3>

			<nav>
				<a href="#" ng-class="{inactive: !data.selectedTable, active: view=='showData'}" id="showTable" ng-click="showTable(); view='showData';">
					Show
				</a>
				<a href="#" ng-class="{inactive: !data.selectedDatabase, active: view=='showStructure' && data.selectedDatabase}" id="showStructure" ng-click="showTable(); view='showStructure';">
					Structure
				</a>
				<a href="#" ng-class="{inactive: !data.selectedDatabase, active: view=='showSql'}" ng-click="view='showSql';">
					SQL
				</a>
				<a href="#" ng-class="{inactive: !data.selectedTable, active: view=='showSearch'}" ng-click="view='showSearch';">
					Search
				</a>
				<a href="#" ng-class="{inactive: !data.selectedDatabase, active: view=='showExport'}" ng-click="view='showExport';">
					Export
				</a>
				<a href="#" ng-class="{inactive: !data.selectedDatabase, active: view=='showDesign'}" ng-click="view='showDesign';">
					Design
				</a>
			</nav>

			<div id="show_table" ng-hide="view != 'showData'" ng-include src="'views/tableData.html'"></div>
			<div id="show_structure" ng-hide="view != 'showStructure'" ng-include src="data.selectedTable ? 'views/tableStructure.html' : 'views/databaseStructure.html'"></div>
			<div id="show_sql" ng-hide="view != 'showSql'" ng-include src="'views/sql.html'"></div>
			<div id="show_search" ng-hide="view != 'showSearch'" ng-include src="'views/search.html'"></div>
			<div id="show_export" ng-hide="view != 'showExport'" ng-include src="'views/export.html'"></div>
			<div id="show_design" ng-hide="view != 'showDesign'" ng-include src="'views/design.html'"></div>

			<div id="quicksearch">
				<h4>
					<span>Quicksearch</span>
				</h4>

				<div>
					<form action="service.php?cmd=qsearchTable&mode=json" method="POST">
						<ul id="qs_cols"></ul>
						<label><input type="radio" name="qs_type" value="like"/>Like</label>
						<label><input type="radio" name="qs_type" value="equals"/>Equals</label>
						<input type="text" name="qs_search" id="qs_search"/>
						<input type="button" value="search" id="qs_submit" class="button"/>
					</form>
				</div>
			</div>

		</div>
		<div class="clearDiv"><!--  --></div>
	</div>

	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.13/angular.min.js"></script>
	<script src="js/angular-sanitize.min.js"></script>
	<script src="js/codemirror.js"></script>
	<script src="js/sql.js"></script>
	<script src="js/show-hint.js"></script>
	<script src="js/sql-hint.js"></script>
	<script src="js/ui-codemirror.min.js"></script>
	<script src="js/ng-infinite-scroll.min.js"></script>
	<script src="js/highlight.js"></script>
	<script src="js/controllers/main.js"></script>
	<script src="js/controllers/databaseStructure.js"></script>
	<script src="js/controllers/tableStructure.js"></script>
	<script src="js/controllers/tableData.js"></script>
	<script src="js/controllers/sql.js"></script>
	<script src="js/services/db.js"></script>
</body>
</html>
