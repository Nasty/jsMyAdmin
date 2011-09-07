<?php
include('functions.php');

$ressource = ConnectDb();

if(isset($_POST['db']) && isset($_POST['table']))
{
	$table = mysql_escape_string($_POST['table']);
	$db = mysql_escape_string($_POST['db']);
	mysql_select_db($db, $ressource);
}

$offset = isset($_POST['offset']) ? mysql_escape_string($_POST['offset']) : 0;
$limit = isset($_POST['limit']) ? mysql_escape_string($_POST['limit']) : 30;

$query = "SELECT * " . 
		 "FROM `" . $table . "` " . 
		 "LIMIT " . $offset . " , " . $limit;

$result = mysql_query($query);
$data = array();
$tables = array();

while($row = mysql_fetch_assoc($result))
{
	$data = array();
	foreach ($row as $key => $value)
	{
		$data[$key] = $value;
	}
	$tables['data'][] = $data;	
}

$query = "SELECT COUNT(*) AS count FROM `" . $table . "`";
$result = mysql_query($query);
$row = mysql_fetch_assoc($result);

$tables['info']['count'] = $row['count'];
$tables['info']['last'] = count($tables['data']) + $offset;

header('Content-Type: text/json');
echo json_encode($tables);

?>