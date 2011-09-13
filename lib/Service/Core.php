<?php
class Service_Core
{
    public function getDatabases()
    {
				$result = mysql_query("SHOW DATABASES;");
				$table = array();

				while($row = mysql_fetch_array($result))
				{
					$databases[] = $row['Database'];
				}

				return $databases;
    }

    public function selectDatabase($params)
    {
    	if(isset($params['db']))
			{
				$db = mysql_escape_string($params['db']);
			}

			$query = "SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . $db . "';";

			$result = mysql_query($query);

			$table = array();

			$tables = array();
			$tables['html'] = '<table class="tablesort">
			        <thead>
			        </thead>
			        <tbody id="contentBody">
			        </tbody>
			      </table>';
			$tables['tableHead'] = '<tr class="tableRow0">
			            <th>
			              Table
			            </th>
			            <th>
			              Records
			            </th>
			            <th>
			              Type
			            </th>
			            <th>
			              Collation
			            </th>
			            <th>
			              Size
			            </th>
			          </tr>';

			while($row = mysql_fetch_assoc($result))
			{
				$table[] = array();
				$table['name'] = $row['TABLE_NAME'];
				$table['records'] = $row['TABLE_ROWS'] == null ? '-' : $row['TABLE_ROWS'];
				$table['engine'] = $row['ENGINE'] == null ? 'View' : $row['ENGINE'];
				$table['collation'] = $row['TABLE_COLLATION'] == null ? '---' : $row['TABLE_COLLATION'];
				$table['size'] = MakeSize($row['DATA_LENGTH']);
				$table['realSize'] = $row['DATA_LENGTH'];
				$tables['data'][] = $table;
			}

			return $tables;
    }

    public function selectTable($params)
    {
    	if(isset($params['db']) && isset($params['db']))
			{
				$table = mysql_escape_string($params['table']);
				$db = mysql_escape_string($params['db']);
			}

			$query = "SHOW FULL COLUMNS FROM " . $table . " FROM " . $db;

			$result = mysql_query($query);

			$table = array();
			$tables = array();

			$tables['html'] = '<table class="tablesort">
			        <thead>
			        </thead>
			        <tbody id="contentBody">
			        </tbody>
			      </table>';
			$tables['tableHead'] = '<tr class="tableRow0">
						<th></th>
			            <th>
			              Field
			            </th>
			            <th>
			              Type
						</th>
			            <th>
			              Collation
			            </th>
			            <th>
			              Attribute
			            </th>
			            <th>
			              Null
			            </th>
						<th>
						  Standard
						</th>
						<th>
						  Extra
						</th>
						<th>
						  Aktion
						</th>
			          </tr>';
			while($row = mysql_fetch_assoc($result))
			{
				$table[] = array();
				$table['field'] = $row['Field'];
				$type = explode(') ', $row['Type'], 2);
				$table['type'] = $type[0];
				$table['collation'] = $row['Collation'];
				$table['attribute'] = $type[1] == null ? '' : $type[1];
				$table['null'] = $row['Null'];
				$table['key'] = $row['Null'] == null ? '---' : $row['TABLE_COLLATION'];
				$table['default'] = $row['Default'];
				$table['extra'] = $row['Extra'];
				$tables['data'][] = $table;
			}

			return $tables;
    }

    public function showTable($params)
    {
    	if(isset($params['db']) && isset($params['table']))
			{
				$table = mysql_escape_string($params['table']);
				$db = mysql_escape_string($params['db']);
				mysql_select_db($db);
			}

			$offset = isset($params['offset']) ? mysql_escape_string($params['offset']) : 0;
			$limit = isset($params['limit']) ? mysql_escape_string($params['limit']) : 30;

			$query = "SELECT * " .
					 "FROM `" . $table . "` " .
					 "LIMIT " . $offset . " , " . $limit;

			$result = mysql_query($query);
			$data = array();
			$tables = array();

			while($row = mysql_fetch_assoc($result))
			{
				$data = array();
				foreach ($row as $key => $value)
				{
					$data[$key] = $value;
				}
				$tables['data'][] = $data;
			}

			$query = "SELECT COUNT(*) AS count FROM `" . $table . "`";
			$result = mysql_query($query);
			$row = mysql_fetch_assoc($result);

			$tables['info']['count'] = $row['count'];
			$tables['info']['last'] = count($tables['data']) + $offset;

			return $tables;
    }
}