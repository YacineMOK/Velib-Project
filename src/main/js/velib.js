

// ------- Functions for getting (and saving) informations about velib-metropole stations -----

/**
* Retrieves current stations information from url 
* and stores the json file in jsonBasePath
* returns the path of the saved file
* Stations ids (expressed as int) are converted into strings 
*   (because some ids are bigger than Opl maxint) 
*/ 
function get_current_stations_info_file(jsonBasePath,url){
	var currentDate = new Date();
	var currentDateString = getCompactFormattedDate(currentDate);
	var jsonFileName = jsonBasePath + "stations_info_" + currentDateString + ".json";
	IloOplExec("curl '" + url + "' | sed -r -f ../sed/stringify_station_code.sed >" + jsonFileName);
	return jsonFileName;
}

/**
* Retrieves stations information from url 
* and stores the json file in data cache
* and fills the stations set with tuples describing stations informations
*/ 
function extract_current_stations_info(jsonBasePath,url,stations){
	var jsonFile = get_current_stations_info_file(jsonBasePath,url);
	extract_stations_info(stations,jsonFile);
}

/**
* Get Stations information from url 
* - stores the json file in data cache
* - fill the stations set describing stations informations
* - saves corresponding dat file the same base name in datBasePath/stations_info/ dir
*/ 
function extract_current_stations_info_and_save_dat(jsonBasePath,url,stations,datBasePath){
	var jsonFile = get_current_stations_info_file(jsonBasePath,url);
	extract_stations_info(stations,jsonFile);
	var base_file_name = file_base_name_without_extension(jsonFile);
	var dat_file_name = datBasePath + "stations_info/" + base_file_name + ".dat";
	var stringToSave = "stations_info = \n" + stations + ";\n";
	save_string_to_file(dat_file_name,stringToSave);
	return  dat_file_name;
}





/**
* Extracts stations information from json file
* and fill the stations set describing stations informations
*/ 
function extract_stations_info(stations,jsonFile){
	var stationsInfoString = file_to_string(jsonFile);			// open file
	var stationsInfo = parseSimpleJSON(stationsInfoString);		// parse as a js object
	var velibStations  = stationsInfo.data.stations;			// extract useful information	
	for(var i = 0;  i < velibStations.length ; i++) {			// iterates on stations
		var s = velibStations[i];
		stations.add(s.station_id.toString(),					// adds new tuple in opl set
					 s.lat,
					 s.lon,
					 s.capacity,
					 s.stationCode,
					 s.name);
	};
}





////////// Status Files ///////////////


/**
* Retrieves current stations status from url 
* and stores the json file in jsonBasePath
* returns the path of the saved file
* Stations ids (expressed as int) are converted into strings 
*   (because some ids are bigger than Opl maxint) 
*/ 
function get_current_stations_status_file(jsonBasePath,url){
	var currentDate = new Date();
	var currentDateString = getCompactFormattedDate(currentDate);
	var jsonFileName = jsonBasePath + "stations_status_" + currentDateString + ".json";
	IloOplExec("curl '" + url + "' | sed -r -f ../sed/stringify_station_code.sed >" + jsonFileName);
	return jsonFileName;
}




/**
* Retrieves stations status from url 
* and stores the json file in data cache
* and fills the stations set with tuples describing stations informations
*/ 
function extract_current_stations_status(jsonBasePath,url,stations){
	var jsonFile = get_current_stations_status_file(jsonBasePath,url);
	extract_stations_status(stations,jsonFile);
}


/**
* Get Stations status from url 
* - stores the json file in data cache
* - fill the stations set describing stations status
* - saves corresponding dat file the same base name in datBasePath/stations_status/ dir
*/ 
function extract_current_stations_status_and_save_dat(jsonBasePath,url,stations,datBasePath){
	var jsonFile = get_current_stations_status_file(jsonBasePath,url);
	extract_stations_status(stations,jsonFile);
	var base_file_name = file_base_name_without_extension(jsonFile);
	var dat_file_name = datBasePath + "stations_status/" + base_file_name + ".dat";
	var stringToSave = "stations_status = \n" + stations + ";\n";
	save_string_to_file(dat_file_name, stringToSave);
	return  dat_file_name;
}


/**
* Extracts stations status from json file
* and fill the stations set describing stations status
*/ 
function extract_stations_status(stations,jsonFile){
	var stationsStatusString = file_to_string(jsonFile);			// open file
	var stationsStatus = parseSimpleJSON(stationsStatusString);		// parse as a js object
	var velibStations  = stationsStatus.data.stations;			// extract useful information	
	for(var i = 0;  i < velibStations.length ; i++) {			// iterates on stations
		var s = velibStations[i];
		stations.add(s.station_id.toString(),					// adds new tuple in opl set
					 s.numBikesAvailable,
					 s.numDocksAvailable,
					 s.is_returning);
	};
}