var selectedDb = null;
var animationSpeed = 'fast';

function mySort (node)
{
	return node.getAttribute('data-size');
}

$(document).ready(function()
{     
	$('#databaseHeader').next().hide();
	$('#tableHeader').next().hide();
	
	$('#databaseHeader').click(function() 
	{
		$(this).next().show(animationSpeed);
		$('#tableHeader').next().hide(animationSpeed);
		return false;
	});
	
	$('#tableHeader').click(function() 
	{
		if(selectedDb != null)
		{
			$(this).next().show(animationSpeed);
			$('#databaseHeader').next().hide(animationSpeed);
		}
		return false;
	});
	
	$.ajax(
	{
		url: "connect.php",
	    global: false,
	    type: "POST",
		data: {host : 'localhost', user : 'jsmyadmin', pw : 'jsmyadmin'},
	    async:true,
	    success: function(data)
	    {
	    	var databases = jQuery.parseJSON(data);
	    	for(i in databases)
	    	{
	    		$('#selector #databases').append('<li id="' + databases[i] + '">' + databases[i] + '</li>');
	    	}

	    	if(trigger == null)
	    	{
	    		$('#databaseHeader').next().show(animationSpeed);
	    	}
	    	
	    	
	    	$('#selector #databases li').bind('click', function()
	    	{
	    		selectedDb = this.id;
	    		$.ajax(
	    		{
	    			url: "selectdb.php",
	    			global: false,
	    			type: "POST",
	    			data: {db: this.id},
	    			async:true,
	    			success: function(data)
	    			{
	    				window.history.pushState(new Object(), "", "?db=" + selectedDb);
	    				$('#tableHeader a').html('Tables ( ' + selectedDb + ' )');
	    				$('#selector #tables li').remove();
	    				
	    				$('#content table').remove();

	    				$('#content').hide(0);

	    				var datas = jQuery.parseJSON(data);
	    				
	    				$('#content').html('<h3>' + selectedDb + '</h3>' + datas.html);
	    				$('#content thead').html(datas.tableHead);
	    				
	    				var tables = datas.data; 
	    				
	    				var tableRow = 0;
	    				
	    		    	for(i in tables)
	    		    	{
	    		    		$('#selector #tables').append('<li id="' + tables[i].name + '" data-db="' + selectedDb + '">' + tables[i].name + '</li>');
	    		    		
	    		    		tableRow = 1 - tableRow;
	    		    		
	    		    		$('#contentBody').append(
	    		    				'<tr class="tableRow' + tableRow + '">' + 
	    		    				'<td data-size="' + tables[i].name + '">' + tables[i].name  + '</td>' +
	    		    				'<td data-size="' + tables[i].records + '">' + tables[i].records  + '</td>' + 
	    		    				'<td data-size="' + tables[i].engine + '">' + tables[i].engine  + '</td>' + 
	    		    				'<td data-size="' + tables[i].collation + '">' + tables[i].collation  + '</td>' + 
	    		    				'<td data-size="' + tables[i].realSize + '">' + tables[i].size  + '</td>' + 
	    		    				'</tr>'
	    		    		);
	    		    	}
	    		    	
	    		    	$('#databaseHeader').next().hide(animationSpeed);
	    		    	$('#tableHeader').next().show(animationSpeed);
						$('.tablesort').tablesorter({textExtraction: mySort}); 
						$('#content').fadeIn(animationSpeed);
	    			}

	    		});
	    	});
			
	    	$('#selector #tables li').live('click', function()
	    	{
	    		selectedDb = this.getAttribute('data-db');
				selectedTable = this.id;
				$('#selector #tables li').css('fontWeight', 'normal');
				$(this).css('fontWeight', 'bold');
	    		$.ajax(
	    		{
	    			url: "selecttable.php",
	    			global: false,
	    			type: "POST",
	    			data: {db: selectedDb, table: selectedTable},
	    			async:true,
	    			success: function(data)
	    			{
	    				window.history.pushState(new Object(), "", "?db=" + selectedDb + '&table=' + selectedTable);
	    				$('#content table').remove();

	    				$('#content').hide(0);

	    				var datas = jQuery.parseJSON(data);
	    				
	    				$('#content').html('<h3>' + selectedDb + ' &gt; ' + selectedTable + ' &gt; <a href="#" id="showTable" data-db="' + selectedDb + '" data-table="' + selectedTable + '">[show table]</a></h3>' + datas.html);
	    				$('#content thead').html(datas.tableHead);
	    				
	    				var tables = datas.data; 
	    				
	    				var tableRow = 0;
	    				
	    		    	for(i in tables)
	    		    	{
	    		    		tableRow = 1 - tableRow;
	    		    		
	    		    		$('#contentBody').append(
	    		    				'<tr class="tableRow' + tableRow + '">' + 
									'<td><input type="checkbox" id="checkbox_row_' + tableRow + '" value="' + tables[i].field  + '" /></td>' +
	    		    				'<td data-size="' + tables[i].field + '">' + tables[i].field  + '</td>' +
	    		    				'<td data-size="' + tables[i].type + '">' + tables[i].type  + '</td>' + 
	    		    				'<td data-size="' + tables[i].collation + '">' + tables[i].collation  + '</td>' + 
	    		    				'<td data-size="' + tables[i].attribute + '">' + tables[i].attribute  + '</td>' + 
									'<td data-size="' + tables[i].null + '">' + tables[i].null + '</td>' + 
									'<td data-size="' + tables[i].default + '">' + tables[i].default + '</td>' + 
	    		    				'<td data-size="' + tables[i].extra + '">' + tables[i].extra  + '</td>' + 
									'<td data-size=""></td>' + 
	    		    				'</tr>'
	    		    		);
	    		    	}
	    		    	
	    		    	$('#databaseHeader').next().hide(animationSpeed);
	    		    	$('#tableHeader').next().show(animationSpeed);
						$('.tablesort').tablesorter({textExtraction: mySort}); 
						$('#content').fadeIn(animationSpeed);
	    			}

	    		});
	    	});
			
			$('#showTable').live('click', function(e){
				$.ajax({
					url: 'showtable.php',
					type: "POST",
					data: {db: this.getAttribute('data-db'), table: this.getAttribute('data-table')},
					success: function(msg)
					{
						window.history.pushState(new Object(), "", "?db=" + selectedDb + '&table=' + selectedTable + '&action=show');
						var tableRow = 0;
						var th = '';
						var tableBody = '';
						$('#content table').remove();
						$('#content').append('<table class="tablesort"></table>');
						var tbody = $('<tbody id="contentBody"></tbody>');
						$(msg).each(function(i,j){
							tableBody = '';
							th = '';
							$.each(j, function(key,value)
							{
								th += '<th>' + key + '</th>';
								tableRow = 1 - tableRow;
								tableBody += '<td data-size="' + value + '">' + value + '</td>';
							})
							tbody.append('<tr class="tableRow' + tableRow + '">' + tableBody + '</tr>');
						})
						$('#content table').append('<tr>' + th + '</tr>').append(tbody);
					}
				})
				
				e.preventDefault();
			})
			
	    	
	    	if(trigger != null)
	    	{
				$('#databases #' + trigger.db).trigger('click');
				//needs work...
				if (trigger.table != null)
				{
					$('#tables #' + trigger.table).trigger('click');
				}
	    	}
	    }
	});
	
});
