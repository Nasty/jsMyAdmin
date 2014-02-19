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
}


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
	$('#quicksearch').find('h4').find('span').toggle(function(){
		$(this).parent().next().animate({'height': 180},250);
		$('#content').find('div[data-role="data-container"]').animate({'bottom':202}, 250);
	},function(){
		$(this).parent().next().animate({'height': 0},250);
		$('#content').find('div[data-role="data-container"]').animate({'bottom':22}, 250);
	});
	
//	$('#show_table').find('table').find('tr').find('td').live('mouseenter', function(e){
//		showPopup(e, 'show_table');
//	}).live('mouseleave', function(){
//		$(this).find('.triangle-isosceles').remove();
//	});
//	$('#show_structure').find('table').find('tr').find('td').live('mouseenter', function(e){
//		showPopup(e, 'show_structure');
//	}).live('mouseleave', function(){
//		$(this).find('.triangle-isosceles').remove();
//	});
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
});


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