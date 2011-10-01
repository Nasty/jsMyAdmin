<?php
session_start();
function ConnectDb()
{
	try
	{

		$link = mysql_connect($_SESSION['host'], $_SESSION['user'], $_SESSION['pw']);

		if (!$link)
		{
			header("Location: index.php");
			exit();
		}

	}
	catch (Exception $e)
	{
		header("Location: index.php");	
	}

	return $link;
}

function MakeSize($size)
{
	$value = "b";

	$size = number_format($size, 2, '.', '');

	if($size > 1024)
	{
		$size = round($size / 1024, 2);
		$value = "KiB";
	}

	if($size > 1024)
	{
		$size = round($size / 1024, 2);
		$value = "MiB";
	}

	if($size > 1024)
	{
		$size = round($size / 1024, 2);
		$value = "GiB";
	}

	if($size == 0)
	{
		$size = '-';
		$value = '';
	}

	return $size . $value;
}
