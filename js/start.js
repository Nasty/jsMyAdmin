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
		url: "service.php?cmd=getDatabases&mode=json",
	    global: false,
	    type: "POST",
		//data: {host : 'localhost', user : 'jsmyadmin', pw : 'jsmyadmin'},
	    async:true,
	    success: function(data)
	    {
	    	var result = jQuery.parseJSON(data);
	    	var databases = result['result'];
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
	    			url: "service.php?cmd=selectDatabase&mode=json",
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

	    				var result = jQuery.parseJSON(data);
	    				var datas = result['result'];
	    				
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
	    			url: "service.php?cmd=selectTable&mode=json",
	    			global: false,
	    			type: "POST",
	    			data: {db: selectedDb, table: selectedTable},
	    			async:true,
	    			success: function(data)
	    			{
	    				window.history.pushState(new Object(), "", "?db=" + selectedDb + '&table=' + selectedTable);
	    				$('#content table').remove();

	    				$('#content').hide(0);

	    				var result = jQuery.parseJSON(data);
	    				var datas = result['result'];
	    				
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
				var selectedDb = this.getAttribute('data-db');
				var selectedTable = this.getAttribute('data-table');
				$.ajax({
					url: 'service.php?cmd=showTable&mode=json',
					type: "POST",
					data: {db: this.getAttribute('data-db'), table: this.getAttribute('data-table')},
					success: function(data)
					{
						var result = jQuery.parseJSON(data);
	    				var msg = result['result'];
	    				
						window.history.pushState(new Object(), "", "?db=" + selectedDb + '&table=' + selectedTable + '&action=show');
						var tableRow = 0;
						var th = '';
						var tableBody = '';
						$('#content table').remove();
						$('#content').append('<table class="tablesort"></table>');
						var tbody = $('<tbody id="contentBody"></tbody>');
						$(msg.data).each(function(i,j)
						{
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
						if (parseInt(msg.info.count) > parseInt(msg.info.last))
						{
							$('#content table').after('<a href="#" id="loadEntries" data-db="' + selectedDb + '" data-table="' + selectedTable + '" data-last="' + msg.info.last + '">[load more entries...]</a>');
						}
					}
				})
				
				e.preventDefault();
			})
			
			$('#loadEntries').live('click', function(e){
				var selectedDb = this.getAttribute('data-db');
				var selectedTable = this.getAttribute('data-table');
				$.ajax({
					url: 'service.php?cmd=showTable&mode=json',
					type: "POST",
					data: {db: this.getAttribute('data-db'), table: this.getAttribute('data-table'), offset: this.getAttribute('data-last')},
					success: function(data)
					{
						var result = jQuery.parseJSON(data);
	    				var msg = result['result'];
	    				
						window.history.pushState(new Object(), "", "?db=" + selectedDb + '&table=' + selectedTable + '&action=show');
						var tableRow = 0;
						$(msg.data).each(function(i,j){
							tableBody = '';
							th = '';
							$.each(j, function(key,value)
							{
								th += '<th>' + key + '</th>';
								tableRow = 1 - tableRow;
								tableBody += '<td data-size="' + value + '">' + value + '</td>';
							})
							$('#contentBody').append('<tr class="tableRow' + tableRow + '">' + tableBody + '</tr>');
						})
						if (parseInt(msg.info.count) == parseInt(msg.info.last))
						{
							$('#content table ~ a').remove();
						} else
						{
							$('#content table ~ a').attr('data-last', msg.info.last);
						}
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
