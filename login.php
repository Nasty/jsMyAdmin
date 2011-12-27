<?php
require_once 'lib/functions.php';

if(isset($_POST['user']))
{
	$user = $_POST['user'];
}
else
{
	header("Location: login.html");
	die('User fehlt!');
}

if(isset($_POST['pw']))
{
	$password = $_POST['pw'];
}
else
{
	header("Location: login.html");
	die('Passwort fehlt!');
}

$_SESSION['host'] = 'localhost';
$_SESSION['user'] = $user;
$_SESSION['pw'] = $password;
$_SESSION['loginTime'] = time();
$_SESSION['lastAction'] = time();

try
{
	$connection = ConnectDb();
}
catch (Exception $e)
{
	header("Location: login.html");
}

$_SESSION['auth'] = 'true';
if ($_POST['true'] != 'true')
{
	header("Location: index.php");
}