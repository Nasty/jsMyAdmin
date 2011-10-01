<?php
/**
 * Katharsis Database Class
 * A mysql query class, that is based on native php functionality (PHP5)
 *
 * @author Karl Pannek <info@katharsis.in>
 * @version 0.5.2
 * @package Katharsis
 */
class Katharsis_Db5
{
	/**
	 * @var string
	 */
	const FETCHMODE_ASSOC = 'ASSOC';
	
	/**
	 * @var string
	 */
	const FETCHMODE_ARRAY = 'ARRAY';

	/**
	 * @var Mysql Resource
	 */
	private $_connection = null;

	/**
	 * @var string
	 */
	private $_host = null;

	/**
	 * @var string
	 */
	private $_user = null;

	/**
	 * @var string
	 */
	private $_password = null;

	/**
	 * @var string
	 */
	private $_database = null;

	/**
	 * @var string
	 */
	private $_lastStatement = "";

	/**
	 * @var array
	 */
	private $_lastResult = array();

	/**
	 * @var array
	 */
	private $_lastError = array();

	/**
	 * @var int
	 */
	private $_lastRowCount = 0;

	/**
	 * Create a connection
	 *
	 * @param $host
	 * @param $user
	 * @param $password
	 * @param $database
	 *
	 * @return KatharsisDbConnector
	 */
	public function __construct($host = null, $user = null, $password = null, $database = null)
	{
		$this->setHost($host);
		$this->setUser($user);
		$this->setPassword($password);
		$this->setDatabase($database);

		if($host !== null && $user !== null && $password !== null && $database !== null)
		{
			$this->connect();
		}
	}

	/**
	 * Sets the value of $_host
	 *
	 * @param string $host
	 * @author Karl Pannek
	 */
	public function setHost($value)
	{
		$this->_host = $value;
	}

	/**
	 * Sets the value of $_user
	 *
	 * @param string $user
	 * @author Karl Pannek
	 */
	public function setUser($value)
	{
		$this->_user = $value;
	}

	/**
	 * Sets the value of $_password
	 *
	 * @param string $password
	 * @author Karl Pannek
	 */
	public function setPassword($value)
	{
		$this->_password = $value;
	}

	/**
	 * Sets the value of $_database
	 *
	 * @param string $database
	 * @author Karl Pannek
	 */
	public function setDatabase($value)
	{
		$this->_database = $value;
		$this->_selectDatabase();
	}

	/**
	 * Returns the value of $_host
	 *
	 * @return string
	 * @author Karl Pannek
	 */
	public function getHost()
	{
		return $this->_host;
	}

	/**
	 * Returns the value of $_user
	 *
	 * @return string
	 * @author Karl Pannek
	 */
	public function getUser()
	{
		return $this->_user;
	}

	/**
	 * Returns the value of $_password
	 *
	 * @return string
	 * @author Karl Pannek
	 */
	public function getPassword()
	{
		return $this->_password;
	}

	/**
	 * Returns the value of $_database
	 *
	 * @return string
	 * @author Karl Pannek
	 */
	public function getDatabase()
	{
		return $this->_database;
	}

	/**
	 * Connect to database
	 *
	 *
	 * @return void
	 */
	public function connect()
	{
		$this->_connection = @mysql_connect(
			$this->getHost(),
			$this->getUser(),
			$this->getPassword(),
			true
		);

		if(!$this->_connection)
		{
			throw new KatharsisDb5_Exception('Could not connect to "' . $this->getHost() . '" with user "' . $this->getUser() . '".');
		}

		$this->_selectDatabase();
	}

	/**
	 * Disconnect database connection
	 * @return bool
	 */
	public function disconnect()
	{
		$this->_connection = null;
		return (bool) mysql_close($this->_connection);
	}

/**
	 * Checks connection to database
	 *
	 * @return bool
	 */
	public function isConnected()
	{
		if($this->_connection !== null && $this->_connection !== false)
		{
			return true;
		} else
		{
			return false;
		}
	}

	/**
	 * Returns mysql connection link resource
	 *
	 * @return mysql link resource
	 */
	public function getMysqlResource ()
	{
		return $this->_connection;
	}

	/**
	 * Executes a Sql statement
	 *
	 * @param $statement
	 * @return bool
	 */
	public function run ($statement)
	{
		if($this->_execute($statement))
		{
			return true;
		} else
		{
			return false;
		}
	}

	/**
	 * Returns Result set for incremental fetching
	 *
	 * @param $statement
	 * @return KatharsisDb5_ResultSet
	 */
	public function runForIncrementalFetch ($statement)
	{
		$resultSet = $this->_execute($statement);
		return new KatharsisDb5_ResultSet($resultSet);
	}

	/**
	 * Inserts a row into a specified table
	 *
	 * @param $table
	 * @param $values
	 * @return bool
	 */
	public function insert ($table, $values = array())
	{
		$sets = array();

		foreach($values as $key => $value)
		{
			if(is_string($value))
			{
				$value = "'" . mysql_real_escape_string($value, $this->_connection) . "'";
			}
			$sets[] = "`" . $key . "` = " . $value;
		}

		$sql = 'INSERT INTO ' . $table;

		if($values !== array())
		{
			$sql .= ' SET ' . implode(',', $sets);
		} else
		{
			$sql .= ' () VALUES () ';
		}

		return $this->run($sql);
	}

	/**
	 * Executes Query and returns number of rows
	 *
	 * @param $statement
	 * @return int
	 */
	public function count ($statement)
	{
		$result = $this->_execute($statement);
		$this->_lastRowCount = mysql_num_rows($result);
		return $this->_lastRowCount;
	}

	/**
	 * Returns a fetched result set (All rows)
	 *
	 * @param $statement
	 * @param $fetchmode
	 * @return array
	 */
	public function fetchAll($statement, $fetchmode = self::FETCHMODE_ASSOC)
	{
		return $this->_fetch($statement, $fetchmode, false);
	}

	/**
	 * Returns a fetched result (One rows)
	 *
	 * @param $statement
	 * @param $fetchmode
	 * @return array
	 */
	public function fetchOne($statement, $fetchmode = self::FETCHMODE_ASSOC)
	{
		return $this->_fetch($statement, $fetchmode, true);
	}

	public function fetchField ($statement, $field = null)
	{
		if($field === null)
		{
			$result = $this->_fetch($statement, self::FETCHMODE_ARRAY, true);
			return $result[0];
		} else
		{
			$result = $this->_fetch($statement, self::FETCHMODE_ASSOC, true);
			if(array_key_exists($field, $result))
			{
				return $result[$field];
			}
			return null;
		}
	}

	/**
	 * Prints out details of the last query (Html formatted)
	 *
	 * @return void
	 */
	public function analyseLast ()
	{
		$debug = debug_backtrace();
		$file = explode("/", str_replace("\\", "/", $debug[0]['file']));
		$file = $file[count($file)-1];


		echo '<pre style="margin: 10px; padding: 0px; background-color: #eee">';

		echo '<table style="width: 100%"><tr><td style="font-size: 0.9em; padding-left: 10px; color: #aaa;">QUERY ANALYSIS | from ' . $file . ' on line ' . $debug[0]['line'] . '</td>';
		echo '<td align="right" style="padding: 5px;">';
		echo '<button style="background-color: #ddd; border: 0px solid #bbb;" onclick="parentNode.parentNode.parentNode.parentNode.parentNode.style.display=\'none\';">X</button></td></tr></table>';
		echo '<div style="margin: 1px; background-color: #FFFCE6; padding: 5px; color: #3F0808;">';
		echo '<b>Statement:</b><br/>';
		echo '<p style="margin-left: 15px;">';
		print_r((string) $this->_lastStatement);
		echo '</p>';
		echo '</div>';

		echo '<div style="margin: 1px; background-color: #EFFFEF;padding: 5px; color: #3F0808;">';
		echo '<b>Result:</b><br/>';
		echo '<p style="margin-left: 15px;">';
		print_r($this->_lastResult);
		echo '</p>';
		echo '</div>';

		if($this->_lastError)
		{
			echo '<div style="margin: 1px; background-color: #FFEEEE; padding: 5px; color: #3F0808;">';
			echo '<b>Error:</b><br/>';
			echo '<p style="margin-left: 15px;">';
			echo '<table>';
			echo '<tr><td><b>Number:</b></td><td>' . $this->_lastError['number'] . '</td></tr>';
			echo '<tr><td style="vertical-align:top;"><b>Message:</b></td><td>' . $this->_lastError['message'] . '</td></tr>';
			echo '</table>';
			echo '</p>';
			echo '</div>';
		}
		echo '</pre>';
	}

	/**
	 * Prepares a statement with certain values
	 *
	 * @param $statement
	 * @param $values
	 * @return string
	 */
	public function createStatement ($statement, $values = array())
	{
		foreach($values as $key => $value)
		{
			$wasString = false;
			if(is_string($value))
			{
				$wasString = true;
			}

			if($this->_connection !== null)
			{
				$value = mysql_real_escape_string($value);
			} else
			{
				$value = mysql_escape_string($value);
			}

			// if string, or a integer, but wanting to request via LIKE
			if($wasString || preg_match('~%' . $key . '|' . $key . '%~', $statement))
			{
				$statement = preg_replace('~\:(%*)' . $key . '(%*)~', "'" . '${1}' . (string) $value . '${2}' . "'", $statement);
			} else
			{
				$statement = str_replace(":" . $key, $value, $statement);
			}
		}

		return $statement;
	}

	/**
	 * Last primary key that has been inserted
	 *
	 * @return int
	 */
	public function lastInsertId ()
	{
		return mysql_insert_id($this->_connection);
	}

	/**
	 * Returns the number of rows from the last executed statement
	 *
	 * @return int
	 */
	public function lastRowCount ()
	{
		return $this->_lastRowCount;
	}

	/**
	 * Select a database for usage
	 *
	 * @return void
	 * @throws KatharsisDb5_Exception
	 */
	protected function _selectDatabase()
	{
		if($this->isConnected() && $this->getDatabase() !== null)
		{
			if(!mysql_select_db($this->getDatabase(), $this->_connection))
			{
				throw new KatharsisDb5_Exception('Could not select database "' . $this->getDatabase() . '".');
			}
		}
	}

	/**
	 * Executes Sql statement
	 *
	 * @param $statement
	 * @return mysql resource
	 */
	protected function _execute($statement)
	{
		if(!$this->isConnected())
		{
			throw new KatharsisDb5_Exception("Not connected to database.");
		}
		if($result = mysql_query($statement, $this->_connection))
		{
			$this->_lastStatement = $statement;
			$this->_lastRowCount = mysql_affected_rows($this->_connection);
		}

		if(mysql_error($this->_connection))
		{
			$this->_lastError['number'] = mysql_errno($this->_connection);
			$this->_lastError['message'] = mysql_error($this->_connection);
		} else
		{
			$this->_lastError = array();
		}

		return $result;
	}

	/**
	 * Fetches database result
	 *
	 * @param $statement
	 * @param $fetchmode
	 * @param $fetchOne
	 * @return array
	 */
	protected function _fetch($statement, $fetchmode = self::FETCHMODE_ASSOC, $fetchOne = false)
	{
		$result = $this->_execute($statement);

		if(!$result)
		{
			$this->_lastResult = array();
			return array();
		}

		$fetchedResult = array();

		switch($fetchmode)
		{
			case self::FETCHMODE_ASSOC:
				while($row = mysql_fetch_assoc($result))
				{
					if($fetchOne)
					{
						$fetchedResult = $row;
						break;
					} else
					{
						$fetchedResult[] = $row;
					}
				}
				break;

			case self::FETCHMODE_ARRAY:
				while($row = mysql_fetch_row($result))
				{
					if($fetchOne)
					{
						$fetchedResult = $row;
						break;
					} else
					{
						$fetchedResult[] = $row;
					}
				}
				break;

			default:
				throw new KatharsisDb5_Exception('Wrong Fetchmode');
				break;
		}

		$this->_lastResult = $fetchedResult;

		return $fetchedResult;
	}
}

/**
 * KatharsisDb exception spicification
 *
 * @author Karl Pannek <info@katharsis.in>
 * @version 0.5.2
 * @package Katharsis
 */
class KatharsisDb5_Exception extends Exception {}

/**
 * KatharsisDb Result Set
 *
 * @author Karl Pannek <info@katharsis.in>
 * @version 0.5.2
 * @package Katharsis

 */
class KatharsisDb5_ResultSet
{
	/**
	 * @var Mysql Resource
	 */
	private $_resultSet;
	
	/**
	 * @var Katharsis_Db5
	 */
	private $_connection;

	/**
	 * Sets class attributes
	 * 
	 * @param Mysql Resource $resultSet
	 */
	public function __construct($resultSet)
	{
		$this->_resultSet = $resultSet;
	}

	/**
	 * Fetching next row
	 * 
	 * @param Mysql Resource $resultSet
	 */
	public function fetchNext ($fetchmode = Katharsis_Db5::FETCHMODE_ASSOC)
	{
		switch ($fetchmode)
		{
			case Katharsis_Db5::FETCHMODE_ASSOC:
				return mysql_fetch_assoc($this->_resultSet);
				break;

			case Katharsis_Db5::FETCHMODE_ARRAY:
				return mysql_fetch_row($this->_resultSet);
				break;

			default:
				throw new KatharsisDb5_Exception('Wrong Fetchmode');
				break;
		}
	}
}
?>