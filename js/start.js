var animationSpeed = 'fast';
var options = {
	"selectedTable" : null,
	"selectedDb" : null,
	"count" : null,
	"lastEntry" : null,
	"limit" : 30,
	"truncateData" : 50, //0 = no trucate
	"queryInProgress" : false,
	"animationSpeed" : "fast"
}
var spinnerOpts = {
  lines: 16, // The number of lines to draw
  length: 6, // The length of each line
  width: 5, // The line thickness
  radius: 0, // The radius of the inner circle
  color: '#555', // #rbg or #rrggbb
  speed: 1, // Rounds per second
  trail: 70, // Afterglow percentage
  shadow: false // Whether to render a shadow
};
function mySort (node)
{
	return node.getAttribute('data-size');
};

function getDatabases ()
{
	$('#spinner').show();
	$('#databaseHeader').next().hide().children().children().remove();
	$('#tableHeader').next().hide(animationSpeed);
	$('nav').find('a').removeClass('active').addClass('inactive');
	$('#content').find('div[data-role="data-container"]').hide().children().remove();
	$('#path').find('span').text('');
	
	$.ajax({
		url: "service.php?cmd=getDatabases&mode=json",
	    global: false,
	    type: "POST",
	    dataType: "json",
	    async:true,
	    success: function(data)
	    {
	    	for(i in  data['result']['data'])
	    	{
	    		var elem = $('<li>', {
	    			"id": data['result']['data'][i].Database,
	    			"text" : data['result']['data'][i].Database,
	    			"data-database" : data['result']['data'][i].Database, 
	    		});
	    		$('#selector #databases').append(elem);
	    	};
	    	
	    	$('#databaseHeader').next().show(options.animationSpeed);
	    	$('#spinner').hide();
	    }
	});
};

function getTables (elem)
{
	elem = $(elem.target);
	$('#spinner').show();
	$('nav').find('a[id!=showTable]').removeClass('inactive');
	$('#showStructure').addClass('active');

	$.ajax(
	{
		url: "service.php?cmd=selectDatabase&mode=json",
		global: false,
		type: "POST",
		data: {db: elem.data('database')},
		async:true,
		dataType: "json",
		success: function(data)
		{
			options.selectedDb = elem.data('database');
			options.selectedTable = false;
			window.history.pushState(new Object(), "", "?db=" + options.selectedDb);
			
			$('#tableHeader a').html('Tables ( ' + options.selectedDb + ' )');
			$('#selector #tables li').remove();
			
			$('#content').find('div[data-role="data-container"]').hide().children().remove();

			var datas = data['result'];
			
			$('#content #path span').html(options.selectedDb);
			$('#content #head').hide();
			$('#content #show_structure').html(datas.html);
			$('#content #show_structure thead').html(datas.tableHead);
			
			var tableRow = 0;
			
			if (data.result.info.count > 0)
			{
				$.each(data.result.data, function(key,value){
					var li = $('<li>', {
						"id" : value.name,
						"data-table" : value.name,
						"text" : value.name,
					});
					$('#selector').find('#tables').append(li);
				})
			}
			$('#tableHeader').next().show(options.animationSpeed);
			$('#databaseHeader').next().hide(options.animationSpeed);
				
			paintData(data.result, 'show_structure');
	    	
	    	$('#databaseHeader').next().hide(animationSpeed);
	    	$('#tableHeader').next().show(animationSpeed);
			$('.tablesort').tablesorter({textExtraction: mySort}); 
			$('#content #show_structure').fadeIn(animationSpeed);
			$('#spinner').hide();
		}

	});
};

function paintData (data, target)
{
	var tHead = $('<thead></thead>');
	var row = $('<tr>');
	$.each(data.header, function(key,value){
		var th = $('<th>', {
			"text" : value
		});
		row.append(th);
	});
	var table = $('<table>', {
		"class" : "tablesort"
	});
	tHead.append(row);
	table.append(tHead);
	var tBody = $('<tbody>', {
		"id" : "contentBody",
	});

	if (data.info.count > 0)
	{
		//TODO : auto append if table exists
		
		for(i in data.data)
		{
			var key = data.header[i];
			var row = $('<tr>');
			for (j in data.data[i])
			{
				var td = $('<td>', {
					//TODO : check if blob or size field and use MakeSize here instead of in PHP
					"text" :   data.data[i][j],
				});
				row.append(td);
			};
			
			tBody.append(row);
		};
	}
	table.append(tBody);
	$('#' + target).show().append(table);
};

function makeSize (size)
{
	var value = "b";

	if(parseInt(size) >= 1024)
	{
		size = Math.round(size / 1024).toFixed(2);
		value = "KiB";
	}
	if(parseInt(size) >= 1024)
	{
		size = Math.round(size / 1024).toFixed(2);
		value = "MiB";
	}
	if(parseInt(size) >= 1024)
	{
		size = Math.round(size / 1024).toFixed(2);
		value = "GiB";
	}
	if(parseInt(size) == 0)
	{
		size = '-';
		value = '';
	}
	return size + value;
};




$(document).ready(function()
{     
	$('<div id="spinner">').css({'float':'left', 'marginLeft':'20px', 'marginTop':'8px'}).spin(spinnerOpts).appendTo('#path').hide().after('<br class="clear" />');
	getDatabases();
	
	$('#databaseHeader').next().hide();
	$('#tableHeader').next().hide();
	
	$('#databaseHeader').click(function() 
	{
		getDatabases();
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
	    	
	    	
	    	$('#selector #databases li').live('click', function(e)
	    	{
	    		getTables(e);
	    	});
			
	    	$('#selector #tables li').live('click', function()
	    	{
				if ($(this).parent().attr('id') == 'tables')
				{
					$('#content #show_table').html('');
					$('#content #show_structure').html('');
				}
				$('#spinner').show();
				options.selectedTable = this.getAttribute('id');
				$('#selector #tables li').css('fontWeight', 'normal');
				$(this).css('fontWeight', 'bold');
	    		$.ajax(
	    		{
	    			url: "service.php?cmd=selectTable&mode=json",
	    			global: false,
	    			type: "POST",
	    			data: {db: options.selectedDb, table: options.selectedTable},
	    			async:true,
	    			success: function(data)
	    			{
	    				$('#showTable').removeClass('inactive'); // TODO: check if queried table has entries and remove class depending on that
					//	options.selectedDb = selectedDb;
						//options.selectedTable = selectedTable;
						
						$('nav a ').removeClass('active');
						$('#showStructure').addClass('active');
						$('#content #show_structure').show();
						$('#content #show_table').hide();
	    				window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable);
	    				$('#content #show_structure table').remove();

	    				$('#content #show_structure').hide(0);

	    				var result = jQuery.parseJSON(data);
	    				var datas = result['result'];
	    				
	    				$('#content #path span').html(options.selectedDb + ' &gt; ' + options.selectedTable);
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
				if (!($(this).hasClass('inactive')))
				{
					if ($('#content #show_table').children().length == 0)
					{
						$('#spinner').show();
						$.ajax({
							url: 'service.php?cmd=showTable&mode=json',
							type: "POST",
							data: {db: options.selectedDb, table:  options.selectedTable},
							success: function(data)
							{
								options.queryInProgress = true;
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
								options.queryInProgress = false;
								$('#spinner').hide();
								if ( ( $('#show_table').find('.tablesort').height() - $('#show_table').scrollTop() < ($('#show_table').height()+300) ) && options.count > parseInt(msg.info.last) && options.queryInProgress == false)
								{
									options.queryInProgress = true;
									$('#loadEntries').click();
								}
							}
						})
					}
					$('#content #show_table').show();
					$('#content #show_structure').hide();
				}
				e.preventDefault();
				return false;
			})
			
			
			$('#show_table').scroll(function(){
				if ( ($(this).find('.tablesort').height() - $(this).scrollTop() < ($(this).height()+300) ) && options.queryInProgress == false )
				{
					options.queryInProgress = true;
					$('#loadEntries').click();
				}
			})
			
			$('#loadEntries').live('click', function(e){
				$('#spinner').show();
				$.ajax({
					url: 'service.php?cmd=showTable&mode=json',
					type: "POST",
					data: {db: options.selectedDb, table: options.selectedTable, offset: options.lastEntry},
					success: function(data)
					{
						options.queryInProgress = true;
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
						options.queryInProgress = false;
					}
				})
				e.preventDefault();
			})
			
			$('nav a[class!="inactive"]').live('click', function(e){
				$('nav a ').removeClass('active');
				$(this).addClass('active');
				//$('#content div[id!="head"]').hide().removeClass('active');
				$('nav a ').each(function(i){
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
	
});
