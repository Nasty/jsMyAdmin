<?php
	session_start ();
	if (isset($_SESSION['auth']) && $_SESSION['auth'] !== 'true')
	{
		include 'login.html';
		die();
	}
?>

<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>jsMyAdmin</title>

  <link rel="stylesheet/less" type="text/css" href="style/styles.less">

  <script type="text/javascript" src="js/jquery.js"></script>
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
  		var trigger = {db:'<?=$_GET['db']?>',
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
	  }
	  else
	  {
	  	?>
	  	var trigger = null;
	  	<?php
	  }
	  ?>
 	</script>
</head>
<body>
	<header>
		<div id="headline">
			jsMyAdmin
		</div>
		<a href="logout.php" class="button" id="logout">Logout</a>
		<div id="loggedIn" class="button">Logged in as: <?php echo $_SESSION['user']; ?>
			<div>
				<br />
				since <?php echo date('d.m.Y H:i:s', $_SESSION['loginTime']); ?> <br />
				last action: <?php echo date('d.m.Y H:i:s', $_SESSION['lastAction']); ?>
			</div>
		</div>
		<br class="cleardiv" />
	</header>
  <div id="wrapper">
    <div id="selector">
      <h3 id="databaseHeader"><a href="#">Database</a></h3>
      <div>
	      <ul id="databases">
	      </ul>
      </div>
      <h3 id="tableHeader"><a href="#">Tables</a></h3>
      <div>
	      <ul id="tables">
	      </ul>
      </div>
    </div>
    <div id="content">
		<h3 id="path"><span style="float:left;"></span></h3>
		<nav>
			<a href="#" class="inactive" id="showTable" data-content="show_table">Show</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_structure">Structure</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_sql">SQL</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_search">Search</a>
			<a href="#" class="inactive" id="showExport" data-content="show_export">Export</a>
			<a href="#" class="hidden" id="showDesign" data-content="show_design">Design</a>
		</nav>

		<div id="show_table" data-role="data-container" style="display: none;"></div>
		<div id="show_structure" data-role="data-container" style="display: none;"></div>
		<div id="show_sql" data-role="container" style="display: none;">
			<textarea id="sqlQuery" cols="70" rows="30" style="border: 1px solid #000;"></textarea><br />
			<input type="button" id="submitQuery" value="abschicken (keine Selects)"  style="border: 1px solid #000;" />
		</div>
		<div id="show_search" data-role="container" style="display: none;">Suche</div>
		<div id="show_export" data-role="container" style="display: none;">Export</div>
		<div id="show_design" data-role="container" style="display: none;"></div>

			<div id="quicksearch">
				<h4>
					<span>Quicksearch</span>
				</h4>
				<div>
					<form action="service.php?cmd=qsearchTable&mode=json" method="POST">

						<ul id="qs_cols">

						</ul>
						<label><input type="radio" name="qs_type" value="like" />Like</label>
						<label><input type="radio" name="qs_type" value="equals" />Equals</label>
						<input type="text" name="qs_search" id="qs_search" />
						<input type="button" value="search" id="qs_submit" class="button" />

					</form>
				</div>
			</div>
    </div>
    <div class="clearDiv"><!--  --></div>
  </div>
</body>
</html>
