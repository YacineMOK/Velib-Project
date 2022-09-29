
/**
*  return a string describing a date in human readable form
*  as for example : "2022-03-12_14h28m33s"  (miliseconds are ignored)
*/
function getFormattedDate(date) {
  		var year = date.getYear();

  		var month = (1 + date.getMonth()).toString();
  		month = month.length > 1 ? month : '0' + month;

  		var day = date.getDate().toString();
  		day = day.length > 1 ? day : '0' + day;
  
  		var h = date.getHours().toString();
  		var m = date.getMinutes().toString();
  		var s = date.getSeconds().toString();

  		return year +"-"+ month  +"-"+ day + "__"+ h + "h"+ m + "mn" + s + "s";
}

/**
*  return a string describing a compact form
*  as for example : 220312_1428"  (seconds and miliseconds are ignored)
*/
function getCompactFormattedDate(date) {
  		var year = date.getYear() % 100;

  		var month = (1 + date.getMonth()).toString();
  		month = month.length > 1 ? month : '0' + month;

  		var day = date.getDate().toString();
  		day = day.length > 1 ? day : '0' + day;
  
  		var h = date.getHours().toString();
  		h = h.length > 1 ? h : '0' + h;
  		
  		var m = date.getMinutes().toString();
   		m = m.length > 1 ? m : '0' + m;

  		return year + month  + day + "-"+ h + m;
}	
	
