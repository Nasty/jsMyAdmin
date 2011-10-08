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
		 
		$this->serviceResult->setHeader(array('Table', 'Records', 'Type', 'Collation', 'Size'), 'cols');
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
		
		$statement = "SELECT * FROM information_schema.COLUMNS " . 
			//	"LEFT JOIN KEY_COLUMN_USAGE ON COLUMNS.TABLE_NAME=KEY_COLUMN_USAGE.TABLE_NAME " .
				"WHERE COLUMNS.TABLE_SCHEMA = '" . $params['db'] . "' AND COLUMNS.TABLE_NAME = '" . $params['table'] . "';";
		$result = $this->db->fetchAll($statement);
		//die(var_dump($result));
		$this->serviceResult->setHeader(array('Field', 'Type', 'Collation', 'Attribute', 'Null', 'Standard', 'Extra', 'Aktion'), 'cols');
		$count = count($result);
		$this->serviceResult->setInfo($count, 'count');

		$table = array();
		$tables = array();
		if ($count > 0)
		{
			foreach ($result as $row)
			{
				$table = array();
				$table['field'] = $row['COLUMNS.COLUMN_NAME'];
				$table['type'] = $row['COLUMS.COLUMN_TYPE'];
				$table['collation'] = $row['COLUMNS.COLLATION_NAME'];
				$table['attribute'] = $row['COLUMNS.DATA_TYPE'];
				$table['null'] = $row['COLUMNS.IS_NULLABLE'];
				//$table['key'] = $row['COLLATION_NAME'] == null ? '---' : $row['COLLATION_NAME'];
				$table['default'] = $row['COLUMNS.COLUMN_DEFAULT'];
				$table['extra'] = $row['COLUMNS.EXTRA'];
				$table['aktion'] = ''; //?
				$table['index'] = $row['COLUMNS.COLUMN_KEY'];
			//	$table['referenced_table'] = $row['KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME'];
			//	$table['referenced_column'] = $row['KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME'];
				$tables[] = $table;
			}
			$this->serviceResult->setData($tables);
		}
		return $this->serviceResult->format();
    }

    public function showTable($params)
    {
    	if(!isset($params['db']) || !isset($params['table']))
		{
			die();
		}
		$this->db->setDatabase($params['db']);
		$serviceResult = new Service_Result();
		$data = $this->selectTable($params);

		$lengthArray = array();
		$columns = "";
		$headers = array();
		foreach($data['data'] as $key => $column)
		{
			$headers[] = $column['field'];
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
		$serviceResult->setHeader($headers, 'cols');
		$columns = substr($columns, 0, -2) . " ";

		$offset = isset($params['offset']) ? mysql_escape_string($params['offset']) : 0;
		$limit = isset($params['limit']) ? mysql_escape_string($params['limit']) : 30;
		
		$statement = "SELECT " . $columns .
					 "FROM `" . $params['table'] . "` " .
					 "ORDER BY 1 " .
					 "LIMIT " . $offset . " , " . $limit;
		$result = $this->db->fetchAll($statement);
		

		$data = array();
		$tables = array();
		foreach ($result as $row)
		{
			$data = array();
			foreach ($row as $key => $value)
			{
				if(in_array($key, $lengthArray))
				{
					$data[$key] = MakeSize($value);
				}
				else 
				{
					$data[$key] = utf8_encode($value);	
				}
			}
			$tables['data'][] = $data;
		}
		
		$serviceResult->setData($tables['data']);

		$statement = "SELECT COUNT(*) AS count FROM `" . $params['table'] . "`";
		$count = $this->db->fetchOne($statement);

		$serviceResult->setInfo($count['count'], 'count');
		$serviceResult->setInfo(count($tables['data']) + $offset, 'last');
		$serviceResult->setInfo($offset, 'offset');
		$serviceResult->setInfo($limit, 'limit');
		
		return $serviceResult->format();
    }
    
    public function qsearchTable ($params)
    {
        if(!isset($params['db']) || !isset($params['table']))
		{
			die();
		}
		$this->db->setDatabase($params['db']);
		$data = $this->selectTable($params);
		$headers = array();
		foreach($data['data'] as $key => $column)
		{
			$headers[] = $column['field'];
		}
		$this->serviceResult->setHeader($headers, 'cols');
		
		$statement = "SELECT * ";
		$statement .= "FROM " . $params['table'] . " WHERE "; 
		foreach ($params['fields'] as $field)
		{
			$statement .= "`" . $field . "` ";
			switch (strtoupper($params['qs_type']))
			{
				case 'LIKE':
					$statement .= "LIKE '%" . urldecode($params['qs_search']) . "%' OR ";
					break;
				case 'EQUALS':
					$statement .= "= '" . urldecode($params['qs_search']) . "' OR ";
					break;
			}
		}
		
		$statement = substr($statement, 0, -4) .";";
		
		$result = $this->db->fetchAll($statement);
		
		if (count($result) > 0)
		{
			$this->serviceResult->setData($result);
		}
		$this->serviceResult->setInfo(count($result), 'count');
		
		return $this->serviceResult->format();
    }
    
    public function getDesignData($params)
    {
    	if(!isset($params['db']))
		{
			die();
		}
		
		$this->db->setDatabase($params['db']);
		$data = $this->selectDatabase($params);
		
		$result = array();
		
		foreach($data['data'] as $table)
		{
			$params['table'] = $table['name'];
			$tableData = $this->selectTable($params);
			
			$result[$table['name']] = $tableData['data'];
		}
		
		//print_r($result);
		//die();
		if (count($result) > 0)
		{
			$this->serviceResult->setData($result);
		}
		$this->serviceResult->setInfo(count($result), 'count');
		
		return $this->serviceResult->format();
    }
}
