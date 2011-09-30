var animationSpeed = 'fast';
var options = {
	"selectedTable" : null,
	"selectedDb" : null,
	"count" : null,
	"lastEntry" : null,
	"limit" : 30,
	"truncateData" : 50, //0 = no trucate
}
var spinnerOpts = {
  lines: 16, // The number of lines to draw
  length: 15, // The length of each line
  width: 13, // The line thickness
  radius: 0, // The radius of the inner circle
  color: '#555', // #rbg or #rrggbb
  speed: 1, // Rounds per second
  trail: 100, // Afterglow percentage
  shadow: false // Whether to render a shadow
};

function mySort (node)
{
	return node.getAttribute('data-size');
}

$(document).ready(function()
{     
	$('<div id="spinner">').css({'position':'relative','margin':'20px auto 30px 50%', 'float':'left'}).spin(spinnerOpts).appendTo('#content').hide();
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
		if(options.selectedDb != null)
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
				$('#spinner').show();
				$('#head button').each(function(i){
					$('#' + $(this).attr('data-content')).hide().removeClass('active');
				})
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
						options.selectedDb = selectedDb;
						options.selectedTable = false;
						
	    				window.history.pushState(new Object(), "", "?db=" + options.selectedDb);
	    				$('#tableHeader a').html('Tables ( ' + options.selectedDb + ' )');
	    				$('#selector #tables li').remove();
	    				
	    				$('#content #show_structure table').remove();
						$('#content #show_table table').remove();

	    				$('#content #show_structure').hide(0);

	    				var result = jQuery.parseJSON(data);
	    				var datas = result['result'];
	    				
						$('#content #path').html(options.selectedDb);
						$('#content #head').hide();
	    				$('#content #show_structure').html(datas.html);
	    				$('#content #show_structure thead').html(datas.tableHead);
	    				
	    				var tables = datas.data; 
	    				
	    				var tableRow = 0;
	    				
	    		    	for(i in tables)
	    		    	{
	    		    		$('#selector #tables').append('<li id="' + tables[i].name + '">' + tables[i].name + '</li>');
	    		    		
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
						$('#content #show_structure').fadeIn(animationSpeed);
						$('#spinner').hide();
	    			}

	    		});
	    	});
			
	    	$('#selector #tables li').live('click', function()
	    	{
				if ($(this).parent().attr('id') == 'tables')
				{
					$('#content #show_table').html('');
					$('#content #show_structure').html('');
				}
				$('#spinner').show();
				selectedTable = this.getAttribute('id');
				$('#selector #tables li').css('fontWeight', 'normal');
				$(this).css('fontWeight', 'bold');
	    		$.ajax(
	    		{
	    			url: "service.php?cmd=selectTable&mode=json",
	    			global: false,
	    			type: "POST",
	    			data: {db: options.selectedDb, table: selectedTable},
	    			async:true,
	    			success: function(data)
	    			{	
						options.selectedDb = selectedDb;
						options.selectedTable = selectedTable;
						
						$('#head button').removeClass('active');
						$('#showStructure').addClass('active');
						$('#content #show_structure').show();
						$('#content #show_table').hide();
	    				window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable);
	    				$('#content #show_structure table').remove();

	    				$('#content #show_structure').hide(0);

	    				var result = jQuery.parseJSON(data);
	    				var datas = result['result'];
	    				
	    				$('#content #path').html(options.selectedDb + ' &gt; ' + options.selectedTable);
						$('#content #head').show();
						
						$('#content #show_structure').html(datas.html);
	    				$('#content #show_structure thead').html(datas.tableHead);
	    				
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
						$('#content #show_structure').fadeIn(animationSpeed);
						$('#spinner').hide();
	    			}

	    		});
	    	});
			
			$('#showTable').live('click', function(e){
				if ($('#content #show_table').children().length == 0)
				{
					$('#spinner').show();
					$.ajax({
						url: 'service.php?cmd=showTable&mode=json',
						type: "POST",
						data: {db: options.selectedDb, table:  options.selectedTable},
						success: function(data)
						{
							var result = jQuery.parseJSON(data);
							var msg = result['result'];
							
							window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable + '&action=show');
							var tableRow = 0;
							var th = '';
							var tableBody = '';
							$('#content #show_table table').remove();
						//	$('#content #show_table').append('');
							var tbody = $('<table class="tablesort"><tbody id="contentBody"></tbody></table>');
							$(msg.data).each(function(i,j)
							{
								tableBody = '';
								th = '';
								$.each(j, function(key,value)
								{
									th += '<th>' + key + '</th>';
									tableRow = 1 - tableRow;
									if (options.truncateData > 0 && value.length > options.truncateData)
									{
										tableBody += '<td data-size="' + value + '">' + value.substr(0,options.truncateData) + '<span class="hidden">' + value.substr(options.truncateData) + '</span><span class="showMore">&hellip;</span></td>';
									} else
									{
										tableBody += '<td data-size="' + value + '">' + value + '</td>';
									}
								})
								tbody.append('<tr class="tableRow' + tableRow + '">' + tableBody + '</tr>');
							})
							tbody.prepend('<tr>' + th + '</tr>');
							$('#content #show_table').append(tbody);
							options.count = parseInt(msg.info.count);
							if (options.count > parseInt(msg.info.last))
							{
								$('#content #show_table table').after('<a href="#" id="loadEntries" class="button">load more entries...</a>');
								options.lastEntry = parseInt(msg.info.last);
							}
							$('#spinner').hide();
						}
					})
				}
				$('#content #show_table').show();
				$('#content #show_structure').hide();
				e.preventDefault();
			})
			
			$('#loadEntries').live('click', function(e){
				$('#spinner').show();
				$.ajax({
					url: 'service.php?cmd=showTable&mode=json',
					type: "POST",
					data: {db: options.selectedDb, table: options.selectedTable, offset: options.lastEntry},
					success: function(data)
					{
						var result = jQuery.parseJSON(data);
	    				var msg = result['result'];
	    				
						window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable + '&action=show');
						var tableRow = 0;
						$(msg.data).each(function(i,j){
							tableBody = '';
							th = '';
							$.each(j, function(key,value)
							{
								th += '<th>' + key + '</th>';
								tableRow = 1 - tableRow;
								if (options.truncateData > 0 && value.length > options.truncateData)
								{
									tableBody += '<td data-size="' + value + '">' + value.substr(0,options.truncateData) + '<span class="hidden">' + value.substr(options.truncateData) + '</span><span class="showMore">&hellip;</span></td>';
								} else
								{
									tableBody += '<td data-size="' + value + '">' + value + '</td>';
								}
							})
							$('#content #show_table table tbody').append('<tr class="tableRow' + tableRow + '">' + tableBody + '</tr>');
						})
						if (parseInt(msg.info.count) == parseInt(msg.info.last))
						{
							$('#content #show_table table ~ a').remove();
						} else
						{
							options.lastEntry = parseInt(msg.info.last);
							$('#content #show_table  table ~ a').attr('data-last', msg.info.last);
						}
						$('#spinner').hide();
					}
				})
				e.preventDefault();
			})
			
			$('#head button').live('click', function(e){
				$('#head button').removeClass('active');
				$(this).addClass('active');
				//$('#content div[id!="head"]').hide().removeClass('active');
				$('#head button').each(function(i){
					$('#' + $(this).attr('data-content')).hide().removeClass('active');
				})
				$('#' + $(this).attr('data-content')).show();
				e.preventDefault();
				return false;
			})
			
			$('.showMore').live('click', function(e){
				$(this).prev().toggle(300);
				e.preventDefault();
				return false;
			})
			
	    	
	    	if(trigger != null)
	    	{
				options.selectedDb = trigger.db;
				$('#databases #' + trigger.db).trigger('click');
				//needs work...
				if (trigger.table != null)
				{
					options.selectedTable = trigger.table;
					$('#tables #' + trigger.table).trigger('click');
				}
	    	}
	    }
	});
	
});
