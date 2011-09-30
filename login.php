<?php
require_once 'lib/functions.php';

if(isset($_POST['user']))
{
	$user = mysql_escape_string($_POST['user']);
}
else
{
	header("Location: login.html");
	die('User fehlt!');
}

if(isset($_POST['pw']))
{
	$password = mysql_escape_string($_POST['pw']);
}
else
{
	header("Location: login.html");
	die('Passwort fehlt!');
}

$_SESSION['host'] = 'localhost';
$_SESSION['user'] = $user;
$_SESSION['pw'] = $password;

try
{
	ConnectDb();
}
catch (Exception $e)
{
	header("Location: login.html");
}

$_SESSION['auth'] = 'true';
header("Location: index.php");