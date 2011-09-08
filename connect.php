<?php
include("functions.php");

ConnectDb();

$result = mysql_query("SHOW DATABASES;");
$table = array();

while($row = mysql_fetch_array($result))
{
	$databases[] = $row['Database'];
}

echo Json_encode($databases);