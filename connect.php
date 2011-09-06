<?php

include("functions.php");

if(isset($_POST['host']))
{
	$host = mysql_escape_string($_POST['host']);
}
else
{
	die('Host fehlt!');
}

if(isset($_POST['user']))
{
	$user = mysql_escape_string($_POST['user']);
}
else
{
	die('User fehlt!');
}

if(isset($_POST['pw']))
{
	$password = mysql_escape_string($_POST['pw']);
}
else
{
	die('Passwort fehlt!');
}

$_SESSION['host'] = $host;
$_SESSION['user'] = $user;
$_SESSION['pw'] = $password;

ConnectDb();

$result = mysql_query("SHOW DATABASES;");
$table = array();

while($row = mysql_fetch_array($result))
{
	$databases[] = $row['Database'];
}

echo Json_encode($databases);