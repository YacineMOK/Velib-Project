
//-----------------------------------------------------------------
// Functions related to OSM
//-----------------------------------------------------------------

/* requests transport times (for a car) on an osrm server for a serie of points
 The serie is a sequence of pairs of lon,lat point coordinates, separated by ";"
 * the answer returned is returned as a json string
 */
function osrm_table(serie, server) {
	// Query construction
	var service = "http://" + server + "/table/v1/driving/";
	var options = "";
	var query = service + serie + options;
	var answer_tmp_file = "answer_osrm.json";
	var fullquery = "curl '" + query + "' >" + answer_tmp_file;
	 writeln("INFO : fullquery = ", fullquery);
	// Calls a subprocess 
	IloOplExec("curl '" + query + "' >" + answer_tmp_file);
	// Reads the result 
	var answerString = file_to_string(answer_tmp_file);
	// Parse the JSON string into an script Object
	var answer = parseSimpleJSON(answerString);
	if (typeof answer == "undefined") {
		writeln("ERROR : unable to convert OSMR answer.");
			// toto - wait for a while and try again
	} else if (answer["code"] != "Ok") {
		writeln("WARNING : unable to retrieve durations from OSMR answer");		
			// toto - wait for a while and try again
	} 
	return answer;

}

//-----------------------------------------------------------------
// Distance on earth wrt  to geographic coordinates
//-----------------------------------------------------------------

/* Computes distance between two points p1 and p2 on earth by haversine formula
 * whose respective geographic coordinates (expressed as latitude/longitude)
 * and are respectively lat1,lon1  and lat2,lon2
 * returned distance is expressed in meters
 * (Source :    https://www.movable-type.co.uk/scripts/latlong.html)
 */
function mdistance(lat1,lon1,lat2,lon2) {
	var R = 6371e3;  								// earth radius in meters
	var phi_1 = lat1 * Math.PI/180; 				// φ1 in radians
	var phi_2 = lat2 * Math.PI/180; 				// φ2 in radians
	var Delta_Phi = (lat2-lat1) * Math.PI/180;  	// Δφ
	var Delta_Lambda = (lon2-lon1) * Math.PI/180;	// Δλ
	//
	var a = Math.sin(Delta_Phi/2) * Math.sin(Delta_Phi/2) +
            Math.cos(phi_1) * Math.cos(phi_2) *
            Math.sin(Delta_Lambda/2) * Math.sin(Delta_Lambda/2);
    //            
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	//
	return d = R * c; 								// in meters
}
