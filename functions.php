<?php
session_start();

function ConnectDb()
{
	try
	{

		$link = mysql_connect($_SESSION['host'], $_SESSION['user'], $_SESSION['pw']);

		if (!$link)
		{
		    throw new Exception('keine Verbindung möglich: ' . mysql_error());
		}

	}
	catch (Exception $e)
	{
		throw $e;
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