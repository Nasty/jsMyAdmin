<?php
include('functions.php');

ConnectDb();

if(isset($_POST['db']))
{
	$db = mysql_escape_string($_POST['db']);
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

echo Json_encode($tables);
