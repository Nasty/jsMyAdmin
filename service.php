<?php
require_once 'lib/functions.php';
require_once 'lib/Service.php';
require_once 'lib/Service/Core.php';

$_SESSION['lastAction'] = time();

$command = $_GET['cmd'];
$mode = $_GET['mode'];
$auth = $_SESSION['auth'];
$params = $_POST;

$service = new Service($mode);

if($service->authenticate($auth))
{
		ConnectDb();
    $core = new Service_Core();
    echo $service->run($core, $command, $params);
}
else
{
	header('HTTP/1.1 403 Forbidden');
    echo 'access denied';
}
