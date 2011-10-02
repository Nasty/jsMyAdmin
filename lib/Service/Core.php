<?php
class Service_Core
{
	protected $db;
	protected $serviceResult;

	public function __construct()
	{
		$this->db = new Katharsis_Db5($_SESSION['host'], $_SESSION['user'], $_SESSION['pw']);
		$this->db->connect();
		$this->serviceResult = new Service_Result();
	}
	
	public function isConntected ()
	{
		if (! $this->db->isConnected() )
		{
			header("Location: index.php");
			exit();
		}
	}
	
    public function getDatabases()
    {
    	$statement = "SHOW DATABASES;";
    	$result = $this->db->fetchAll($statement);

    	$this->serviceResult->setData($result);
    	$this->serviceResult->setInfo(count($result), 'count');
		
    	return $this->serviceResult->format();
    }

    public function selectDatabase($params)
    {
    	if(!isset($params['db']))
		{
				die();
		}

		$statement = "SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . $params['db'] . "';";
		$result = $this->db->fetchAll($statement);
		 
		$this->serviceResult->setHeader(array('Table', 'Records', 'Type', 'Collation', 'Size'));
		$count = count($result);
		$this->serviceResult->setInfo($count, 'count');
		
		if ($count > 0)
		{
			foreach ($result as $row)
			{
				$table = array();
				$table['name'] = $row['TABLE_NAME'];
				$table['records'] = $row['TABLE_ROWS'] == null ? '-' : $row['TABLE_ROWS'];
				$table['engine'] = $row['ENGINE'] == null ? 'View' : $row['ENGINE'];
				$table['collation'] = $row['TABLE_COLLATION'] == null ? '---' : $row['TABLE_COLLATION'];
				$table['size'] = MakeSize($row['DATA_LENGTH']);
			//	$table['realSize'] = $row['DATA_LENGTH'];
				$tables[] = $table;
			}
			
			$this->serviceResult->setData($tables);

		}
		return $this->serviceResult->format();
    }

    public function selectTable($params)
    {
	   	if(! isset($params['db']) || !isset($params['db']))
		{
			die();
		}
		
		$statement = "SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '" . $params['db'] . "' AND TABLE_NAME = '" . $params['table'] . "';";
		$result = $this->db->fetchAll($statement);

		$this->serviceResult->setHeader(array('Table','Field', 'Type', 'Collation', 'Attribute', 'Null', 'Standard', 'Extra', 'Aktion'));
		$count = count($result);
		$this->serviceResult->setInfo($count, 'count');

		$table = array();
		$tables = array();
		if ($count > 0)
		{
			foreach ($result as $row)
			{
				$table = array();
				$table['field'] = $row['COLUMN_NAME'];
				$table['type'] = $row['COLUMN_TYPE'];
				$table['collation'] = $row['COLLATION_NAME'];
				$table['attribute'] = $row['DATA_TYPE'];
				$table['null'] = $row['IS_NULLABLE'];
				$table['key'] = $row['COLLATION_NAME'] == null ? '---' : $row['COLLATION_NAME'];
				$table['default'] = $row['COLUMN_DEFAULT'];
				$table['extra'] = $row['EXTRA'];
				$table['aktion'] = ''; //?
				$tables[] = $table;
			}
			$this->serviceResult->setData($tables);
		}
		return $this->serviceResult->format();
    }

    public function showTable($params)
    {
		$startTime = microtime (true);
    	if(isset($params['db']) && isset($params['table']))
		{
			$table = mysql_escape_string($params['table']);
			$db = mysql_escape_string($params['db']);
			mysql_select_db($db);

			$data = $this->selectTable($params);
		}

		$serviceResult = new Service_Result();


		$offset = isset($params['offset']) ? mysql_escape_string($params['offset']) : 0;
		$limit = isset($params['limit']) ? mysql_escape_string($params['limit']) : 30;

		$serviceResult->setInfo($offset, 'offset');
		$serviceResult->setInfo($limit, 'limit');

		$columns = "";

		$lengthArray = array();
		
		foreach($data['data'] as $key => $column)
		{
			switch ($column['attribute'])
			{
				case 'longblob':
				case 'blob':
				case 'tinyblob':
				case 'mediumblob':
					$columns .= " LENGTH(`" . $column['field'] . "`) AS `" . $column['field'] . "`, ";
					$lengthArray[] = $column['field'];
					break;
				case 'varchar':
				case 'text':
					$columns .= " `" . $column['field'] . "`, ";
					break;

				case 'tinyint':
				case 'int':
					$columns .= " `" . $column['field'] . "`, ";
					break;

				default:
					$columns .= " `" . $column['field'] . "`, ";
			}
		}

		$columns = substr($columns, 0, -2) . " ";

		$query = "SELECT " . $columns .
				 "FROM `" . $table . "` " .
				 "ORDER BY 1 " .
				 "LIMIT " . $offset . " , " . $limit;

		$result = mysql_query($query);
		$data = array();
		$tables = array();

		$headers = array();
		$i = 0;
		while($row = mysql_fetch_assoc($result))
		{
			$data = array();
			foreach ($row as $key => $value)
			{
				if ($i == 0)
				{
					if(in_array($key, $lengthArray))
					{
						$headers[] = $key;
					}
					else 
					{
						$headers[] = $key;
					}
				}
				if(in_array($key, $lengthArray))
				{
					$data[$key] = MakeSize($value);
				}
				else 
				{
					$data[$key] = utf8_encode($value);	
				}
			}
			$i++;
			$tables['data'][] = $data;
		}
		
		$serviceResult->setHeader($headers);

		$serviceResult->setData($tables['data']);

		$query = "SELECT COUNT(*) AS count FROM `" . $table . "`";
		$result = mysql_query($query);
		$row = mysql_fetch_assoc($result);

		$tables['info']['count'] = $row['count'];
		$tables['info']['last'] = count($tables['data']) + $offset;

		$serviceResult->setInfo($row['count'], 'count');
		$serviceResult->setInfo(count($tables['data']) + $offset, 'last');
		
		$endTime = microtime (true);
		$serviceResult->setInfo(($endTime - $startTime), 'execTime');
		
		$format = $serviceResult->format();
		return $format;
		//return $tables;
    }
}