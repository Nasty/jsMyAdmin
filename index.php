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

  <link rel="stylesheet" type="text/css" href="style/style.css" />

  <script type="text/javascript" src="js/jquery.js"></script>
  <script type="text/javascript" src="js/jquery.accordion.js"></script>
  <script type="text/javascript" src="js/start.js"></script>
  <script type="text/javascript" src="js/jquery.tablesort.js"></script>
  <script type="text/javascript" src="js/spin.js"></script>

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
		<h3 id="path"></h3>
		<div id="head">
			<button id="showTable" data-content="show_table" />Anzeigen</button>
			<button id="showStructure" data-content="show_structure" class="active" />Struktur</button>
			<button id="showStructure" data-content="show_sql" />SQL</button>
			<button id="showStructure" data-content="show_search" />Suche</button>
		</div>
		<div id="show_table" style="display:none;"></div>
		<div id="show_structure"></div>
		<div id="show_sql" style="display:none;">SQL</div>
		<div id="show_search" style="display:none;">Suche</div>
    </div>
    <div class="clearDiv"><!--  --></div>
  </div>
</body>
</html>