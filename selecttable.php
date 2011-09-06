<?php
include('functions.php');

ConnectDb();

if(isset($_POST['db']) && isset($_POST['db']))
{
	$table = mysql_escape_string($_POST['table']);
	$db = mysql_escape_string($_POST['db']);
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

echo Json_encode($tables);
?>