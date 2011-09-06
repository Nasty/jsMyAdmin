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
	    	
	    	
	    	$('#selector li').bind('click', function()
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
	    				
	    				$('#content').html(datas.html);
	    				$('#content thead').html(datas.tableHead);
	    				
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
						$('#content').fadeIn(animationSpeed);
	    			}

	    		});
	    	});
	    	
	    	if(trigger != null)
	    	{
	    		$('#databases #' + trigger).trigger('click');
	    	}
	    }
	});
	
});
