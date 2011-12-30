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
};
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

function hideContents ()
{
	$('nav').find('a').each(function(){
		$('#' + $(this).data('content')).hide();
	});
};

function getDatabases ()
{
	$('#spinner').show();
	$('#databaseHeader').next().hide().children().children().remove();
	$('#tableHeader').next().hide(animationSpeed);
	$('nav').find('a').removeClass('active').addClass('inactive');
	$('#content').find('div[data-role="data-container"]').hide().find('table').remove();
	$('#loadEntries').remove();
	$('#path').find('span').text('');
	$('#showDesign').removeClass('active').addClass('hidden');
	
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
	    			"data-database" : data['result']['data'][i].Database
	    		});
	    		$('#selector #databases').append(elem);
	    	};
	    	
	    	$('#databaseHeader').next().show(options.animationSpeed);
	    	$('#spinner').hide();
	    	
	    	$('#quicksearch').find('h4').find('span').removeClass('active');
	    },
		statusCode: {
			403: function () {
				relogin(this);
			}
		}
	});
};

function getTables (elem)
{
	elem = $(elem.target);
	$('#spinner').show();
	$('nav').find('a[id!=showTable]').removeClass('inactive');
	$('#showStructure').addClass('active');
	$('#showDesign').removeClass('hidden');

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
			
			$('#content').find('div[data-role="data-container"]').find('table').remove();
			$('#loadEntries').remove();

			var datas = data['result'];
			
			$('#content #path span').html(options.selectedDb);
			$('#content #head').hide();
			hideContents();
			
			var searchField = $('<input>', {
				"id" : 'searchField',
				"type" : 'text',
				"style" : 'width: 80%; height: 100%; border: 1px solid black;'
			});
			
			var li = $('<li>', {
				"id" : 'searchLi'
			});
			li.append(searchField);
			$('#selector').find('#tables').append(li);
			
			$("#searchField").live('keyup', function(event) {
			    
				searchString = $(this).val();

				$.each($('#tables li'), function(key, value)
			    {
			    	if($(value).attr('id') != 'searchLi')
			    	{
			    		if($(value).attr('id') != 'searchLi')
			    	{
			    		if($(value).attr('id').search(searchString) != -1)
			    		{
			    			var replace = $(value).attr('id').match(searchString)[0];
			    			$(value).show();
			    			$(value).html($(value).attr('id').replace(replace, '<span style="color:#FF4422; font-weight: bold;">' + replace + '</span>'));
			    		}
			    		else
			    		{
			    			$(value).hide();
			    		}
			    	}
			    	}
			    });
			});

			
			if (data.result.info.count > 0)
			{
				$.each(data.result.data, function(key,value){
					var li = $('<li>', {
						"id" : value.name,
						"data-table" : value.name,
						"text" : value.name
					});
					$('#selector').find('#tables').append(li);
				});
			}
			$('#tableHeader').next().show(options.animationSpeed);
			$('#databaseHeader').next().hide(options.animationSpeed);
				
			paintData(data.result, 'show_structure');
	    	
	    	$('#databaseHeader').next().hide(animationSpeed);
	    	$('#tableHeader').next().show(animationSpeed);
			$('.tablesort').tablesorter({textExtraction: mySort}); 
			$('#content #show_structure').fadeIn(animationSpeed);
			$('#spinner').hide();
			
			$('#quicksearch').find('h4').find('span').removeClass('active');
		},
		statusCode: {
			403: function () {
				relogin(this);
			}
		}
	});
};

function selectTable (elem)
{
	$('#showDesign').removeClass('active').addClass('hidden');
//	elem = $(elem.target);
	$('#spinner').show();

	if (elem.parent().attr('id') == 'tables')
	{
		$('#content #show_table').find('table').remove();
		$('#content #show_structure').find('table').remove();
		$('#loadEntries').remove();
		$('#qs_cols').children().remove();
	};
	
	options.selectedTable = elem.data('table');
	$('#selector #tables li').css('fontWeight', 'normal');
	elem.css('fontWeight', 'bold');
	
	$.ajax({
		url: "service.php?cmd=selectTable&mode=json",
		global: false,
		type: "POST",
		dataType: "json",
		data: {db: options.selectedDb, table: options.selectedTable},
		async:true,
		success: function(data)
		{
			$('#showTable').removeClass('inactive'); // TODO: check if queried table has entries and remove class depending on that
			$('nav a ').removeClass('active');
			$('#showStructure').addClass('active');
			hideContents();
			
			window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable);
			
			paintData(data.result, 'show_structure');
			
	    	$('#databaseHeader').next().hide(animationSpeed);
	    	$('#tableHeader').next().show(animationSpeed);
			$('.tablesort').tablesorter({textExtraction: mySort}); 
			$('#content #show_structure').fadeIn(animationSpeed);
			$('#spinner').hide();
			
			$('#quicksearch').find('h4').find('span').removeClass('active');
		},
		statusCode: {
			403: function () {
				relogin(this);
			}
		}
	});
};

function showTable (elem)
{
	elem = $(elem.target);
	if (!($(this).hasClass('inactive')) && $('#content #show_table').find('table').length == 0)
	{
		$('#spinner').show();
		$.ajax({
			url: 'service.php?cmd=showTable&mode=json',
			type: "POST",
			dataType : "json",
			data: {db: options.selectedDb, table:  options.selectedTable},
			success: function(data)
			{
				options.queryInProgress = true;
				window.history.pushState(new Object(), "", "?db=" + options.selectedDb + '&table=' + options.selectedTable + '&action=show');
				hideContents();
				
				paintData(data.result, 'show_table');
				
				$('#qs_cols').children().remove();
				$('#qs_submit').unbind('click');
				if ($('#qs_cols').children().length == 0)
				{
					$.each(data.result.header.cols, function(key,value){
						var li = $('<li>');
						var label = $('<label>').html(value).appendTo(li);
						var input = $('<input>', {
							"type" : "checkbox",
							"value" : value,
							"name" : "fields[]"
						}).appendTo(label);
						label.append(input);
						$('#qs_cols').append(li);
						$('#quicksearch').find('h4').find('span').addClass('active');
					});
					$('#qs_submit').click(function(e){
						$('#spinner').show();
						var data = $(this).parent().serialize() + '&db=' + options.selectedDb + '&table=' + options.selectedTable;
						$.ajax({
							url: "service.php?cmd=qsearchTable&mode=json",
							global: false,
							type: "POST",
							dataType: "json",
							data: data,
							async:true,
							success: function(msg){
								$('#show_table').find('table').remove();
								$('#loadEntries').remove();
								paintData(msg.result, 'show_table');
								$('#spinner').hide();
							}
						});
					});
				}
				
				options.count = parseInt(data.result.info.count);
				
				if (options.count > parseInt(data.result.info.last))
				{
					$('#content #show_table table').after('<a href="#" id="loadEntries" class="button">load more entries...</a>');
					options.lastEntry = parseInt(data.result.info.last);
				}
				options.queryInProgress = false;
				$('#spinner').hide();
				
				if ( ( $('#show_table').find('.tablesort').height() - $('#show_table').scrollTop() < ($('#show_table').height()+300) ) && options.count > parseInt(data.result.info.last) && options.queryInProgress == false)
				{
					options.queryInProgress = true;
					$('#loadEntries').click();
				}
				$('#content #show_table').show();
			},
			statusCode: {
				403: function () {
					relogin(this);
				}
			}
		});
	};
	return false;
};


function paintData (data, target)
{
	var tHead = $('<thead></thead>');
	var row = $('<tr>');
	$.each(data.header.cols, function(key,value){
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
		"id" : "contentBody"
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
					// @flo: are u sure? So we had to send ALL image data from the server to the client. 
					// I think, we should do this in PHP. Text fields or varchar yes.
					"text" :   limitChars(data.data[i][j]),
					"value":   data.data[i][j]
				});
				row.append(td);
			};
			
			tBody.append(row);
		};
	}
	table.append(tBody);
	$('#' + target).show().prepend(table);
};

function relogin (xhr)
{
	var login = $('<div>', {
		"id" : "login"
	}).css({
		"position" : "relative",
		"top" : "20%",
		"margin" : "0 auto",
		"zIndex" : "999",
		"width":"320",
		"height":"200",
		"backgroundColor":"transparent",
		"backgroundImage":"none"
	});
	var container = $('<div>').css({'height':"180","background":"rgba(224, 224, 224, 0.9)"});
	var header = $('<header>').append($('<div>',{"id":"headline","text":"jsMyAdmin"}));
	var h3 = $('<h3>',{
		"text" : "Your login session has expired."
	}).css({"padding":"3px 5px","color":"#FF0000"});
	var form = $('<form>', {"method":"post", "action":"login.php"});
	var label1 = $('<label>', {"for":"rl_user", "text":"User:"});
	var label2 = $('<label>', {"for":"rl_pw", "text":"Password:"});
	var input1 = $('<input>', {"id":"rl_user", "type":"text"});
	var input2 = $('<input>', {"id":"rl_pw", "type":"password"});
	var that = xhr;
	var input3 = $('<input>', {"id":"rl_pw", "type":"submit","value":"login"}).click(function(e){
		$.ajax({
			url : 'login.php',
			type: "POST",
			data: {user: $('#rl_user').val(), pw:$('#rl_pw').val(), relog:true},
			success: function(){
				$('#overlay').remove();
				$('#login').remove();
				$.ajax(that);
			}
		});
		e.preventDefault();
	});
	container.append(header);
	form.append(label1).append(input1).append(label2).append(input2).append(input3);
	container.append(h3);
	container.append(form);
	login.append(container);
	
	var overlay = $('<div>',{"id":"overlay"});
	$('html').append(overlay);
	$('html').append(login);	
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

function showPopup (e, elem)
{
	var caller = $(e.target);
	var popupValue = '';
	
	if(caller.attr('value') != null)
	{
		popupValue = caller.attr('value');
	}
	
	var popup = $('<p>', {
		"class" : "triangle-isosceles",
		"text" : popupValue
	}).css({
			'display':'none',
			'top':e.layerY,
			'float':'left',
			'white-space': 'normal'
		});
	var event = e;
	$(document).bind('mousemove', function(e){
		var scrollPos = $('#' + elem).scrollLeft();
		var position = event.pageX -45-$('#' + elem).offset().left;
		var pageX = e.pageX -45+$('#' + elem).scrollLeft()-$('#' + elem).offset().left;
		var pageY = e.pageY+$('#' + elem).scrollTop();
		if (e.pageX-$('#' + elem).offset().left+280 > $('#' + elem).width())
		{
			popup.addClass('l');
			popup.css({
				"right":($('#' + elem).width()-pageX-110),
				"top" : pageY-$('#' + elem).offset().top+15
				});
		} else
		{
			popup.addClass('r');
			popup.css({
				"left":pageX,
				"top" : pageY-$('#' + elem).offset().top+15
				});
		};
	});
	popup.appendTo(caller).delay(500).show(250, function(){
		$(document).unbind('mousemove');
	});	
}

function getExportData(elem)
{
}

$(document).ready(function()
{     
//	$('<div id="spinner">').css({'float':'left', 'marginLeft':'20px', 'marginTop':'8px'}).spin(spinnerOpts).appendTo('#path').hide().after('<br class="clear" />');
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
	
	$('#selector #tables li').live('mousedown', function(e)
	{
		var elem = $(e.target);
		
		if(elem.attr('id') == undefined)
		{
			elem = $(e.target).parent();
		}
		
		if(elem.attr('id') == 'searchLi' || elem.attr('id') == 'searchField')
		{
			elem.focus();
			return false
		}

		switch (e.which)
		{
			case 2:
				console.log('middle');
				e.preventDefault();
				break;
			case 3:
				console.log('right');
				break;
			case 1:
				//omitted
			default:
				console.log('left');
				selectTable(elem);
				e.preventDefault();
				break;
		}
	});
	
	$('#showTable').live('click', function(e){
		showTable(e);
	});

	$('#showDesign').live('click', function(e){
		getDesignData(e);
	});
	
	$('#showExport').live('click', function(e){
		getExportData(e);
	});
	
	$('#quicksearch').find('h4').find('span').toggle(function(){
		$(this).parent().next().animate({'height': 180},250);
		$('#content').find('div[data-role="data-container"]').animate({'bottom':202}, 250);
	},function(){
		$(this).parent().next().animate({'height': 0},250);
		$('#content').find('div[data-role="data-container"]').animate({'bottom':22}, 250);
	});
	
	$('#show_table').find('table').find('tr').find('td').live('mouseenter', function(e){
		showPopup(e, 'show_table');
	}).live('mouseleave', function(){
		$(this).find('.triangle-isosceles').remove();
	});
	$('#show_structure').find('table').find('tr').find('td').live('mouseenter', function(e){
		showPopup(e, 'show_structure');
	}).live('mouseleave', function(){
		$(this).find('.triangle-isosceles').remove();
	});
	/*-----------*/
	
	$('#submitQuery').click(function(e){
		e.preventDefault();
		$.ajax({
			url: "service.php?cmd=executeQuery&mode=json",
			global: false,
			type: "POST",
			async:true,
			data: {query: $('#sqlQuery').val(), db:options.selectedDb},
			success: function(msg){
				console.log(msg);
			}
		})
	})
			
			
			
			$('#show_table').scroll(function(){
				if ( ($(this).find('.tablesort').height() - $(this).scrollTop() < ($(this).height()+300) ) && options.queryInProgress == false )
				{
					options.queryInProgress = true;
					$('#loadEntries').click();
				}
			});
			
			
			$('#loadEntries').live('click', function(e){
//				$('#spinner').show();
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
									tableBody += '<td data-size="' + value + '" value="' + value + '">' + value.substr(0,options.truncateData) + '<span class="hidden">' + value.substr(options.truncateData) + '</span><span class="showMore">&hellip;</span></td>';
								} else
								{
									tableBody += '<td data-size="' + value + '" value="' + value + '">' + value + '</td>';
								}
							});
							$('#content #show_table table tbody').append('<tr class="tableRow' + tableRow + '">' + tableBody + '</tr>');
						});
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
				});
				e.preventDefault();
			});
			
			$('nav a[class!="inactive"]').live('click', function(e){
				$('nav a ').removeClass('active');
				$(this).addClass('active');
				//$('#content div[id!="head"]').hide().removeClass('active');
				$('nav a ').each(function(i){
					$('#' + $(this).attr('data-content')).hide().removeClass('active');
				});
				$('#' + $(this).attr('data-content')).show();
				e.preventDefault();
				return false;
			});
			
			$('.showMore').live('click', function(e){
				$(this).prev().toggle(300);
				e.preventDefault();
				return false;
			});
			
	    	if(trigger != null)
	    	{
				setTimeout("TriggerDb()", 200);
	    	}
	
});



function TriggerDb()
{
	$('#databases #' + trigger.db).trigger('click');
	clearTimeout();
	//needs work...
	if (trigger.table != null)
	{
		options.selectedDb = trigger.db;
		setTimeout("TriggerTable()", 500);
	}
}

function TriggerTable()
{
	console.log(trigger);
	options.selectedTable = trigger.table;
	$('#tables #' + trigger.table).trigger('mousedown');
}























function getDesignData ()
{
	$('#spinner').show();

	$.ajax({
		url: "service.php?cmd=getDesignData&mode=json",
		global: false,
		type: "POST",
		dataType: "json",
		data: {db: options.selectedDb},
		async:true,
		success: function(data)
		{
			$('#content #show_design .table').remove();
			
			$('#content #show_design').fadeIn(animationSpeed);
			$('#spinner').hide();
			
			var canvas = $('<canvas>', {
				"id" : "stage"
			}).css({
				"position" : "absolute",
				"height" : $('#show_design').height(),
				"width" : $('#show_design').width(),
			});
			
			$('#show_design').append(canvas);
			
			for(i in  data['result']['data'])
	    	{
				var table = $('<div>', {
	    			"class" : "table",
	    			"data-name" : i
	    		});
				
				var tableName = $('<p>', {
	    			"text" : i
	    		}).appendTo(table);
				
				var list = $('<ul>', {
					
				}).appendTo(table);
				
				for(j in  data['result']['data'][i])
		    	{
					var fieldName = data['result']['data'][i][j]['field'];
					var referencedTable = data['result']['header']['keys'][i][fieldName]['referenced_table'];
					var referencedColumn = data['result']['header']['keys'][i][fieldName]['referenced_column'];
					var listItem = $('<li>', {
						"text" : fieldName,
						"data-name": fieldName
					}).data({"column-name": fieldName}).appendTo(list);
					if (referencedTable != null && referencedColumn != null)
					{
						listItem.data({"ref-table": referencedTable, "ref-column": referencedColumn})
							.hover(function(){
								$('#show_design').find('div[data-name="' + $(this).data("ref-table") + '"]').addClass('referenced');
								$('#show_design').find('div[data-name="' + $(this).data("ref-table") + '"]').find('li:contains("' + $(this).data("ref-column") + '")').addClass('referenced');
								$(this).addClass('referenced');
							}, function(){
								$('#show_design').find('div[data-name="' + $(this).data("ref-table") + '"]').removeClass('referenced')
									.find('li:contains("' + $(this).data("ref-column") + '")').removeClass('referenced');
								$(this).removeClass('referenced');
							})
					}
					
					
					if(data['result']['data'][i][j]['index'] == 'PRI')
					{
						listItem.addClass('primaryKey');
					}
					if(data['result']['data'][i][j]['index'] == 'MUL')
					{
						listItem.addClass('indexKey');
					}
		    	}
				
	    		$('#show_design').append(table);
	    	}

			$('#show_design .table').draggable(
			{
				draggable: true,
				opacity: 0.8,
				cursor: 'crosshair',
				zIndex: 2000,
				revert: false,
				scroll: false,
				copy: false,
				delay: 0,
				containment: 'parent'
			});
		}
	});
};

function drawTableConnections ()
{
    var canvas = document.getElementById("stage");
    var context = canvas.getContext("2d");
    
    context.moveTo(100, 150);
    context.lineTo(450, 50);
    context.lineWidth = 1;
    context.stroke();
}

function limitChars(string)
{
	if(string != null && string.length > 30)
	{
		string = string.substring(0, 30) + '...';
	}
	
	return string;
}