<?php
	session_start ();
	if ($_SESSION['auth'] !== 'true')
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
  <script type="text/javascript" src="js/jquery.accordion.js"></script>
  <script type="text/javascript" src="js/start.js"></script>
  <script type="text/javascript" src="js/jquery.tablesort.js"></script>
  <script type="text/javascript" src="js/spin.js"></script>
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
		<div id="loggedIn" class="button">Eingeloggt als: <?php echo $_SESSION['user']; ?>
			<div>
				<br />
				seit <?php echo date('d.m.Y H:i:s', $_SESSION['loginTime']); ?> Uhr<br />
				Letzte Aktion: <?php echo date('d.m.Y H:i:s', $_SESSION['lastAction']); ?> Uhr
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
			<a href="#" class="inactive" id="showTable" data-content="show_table">Anzeigen</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_structure">Struktur</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_sql">SQL</a>
			<a href="#" class="inactive" id="showStructure" data-content="show_search">Suche</a>
		</nav>
		
		<div id="show_table" data-role="data-container" style="display: none;"></div>
		<div id="show_structure" data-role="data-container" style="display: none;"></div>
		<div id="show_sql" data-role="container" style="display: none;">SQL</div>
		<div id="show_search" data-role="container" style="display: none;">Suche</div>
			
			<div id="quicksearch" style="display:none;position: absolute; right:10px;left:10px;background: #ddd;z-index:10;bottom:0;padding:3px 10px;">
				<h3>Quicksearch</h3>
				<div>
					<input type="radio" id="qsType" value="like" />Like<br />
					<input type="radio" id="qsType" value="equals" />Equals<br />
					
					<ul id="qs_cols">
					
					</ul>
					
				</div>
			</div>
    </div>
    <div class="clearDiv"><!--  --></div>
  </div>
</body>
</html>