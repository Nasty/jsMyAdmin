<?php
session_start();

function ConnectDb()
{
	$link = mysql_connect($_SESSION['host'], $_SESSION['user'], $_SESSION['pw']);
	if (!$link)
	{
	    die('keine Verbindung möglich: ' . mysql_error());
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