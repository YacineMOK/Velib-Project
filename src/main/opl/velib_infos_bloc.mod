

// ------------------- Data ---------------------------
{StationInfo} stations_info;

{StationStatus} stations_status;

execute {  
	// Libraries
	includeScript("../../libs/files.js");
	includeScript("../../libs/simpleJSONParser.js");
	includeScript("../../libs/dates.js");
	
	// Project ecmascript functions
	includeScript("../js/velib.js");
}

// dat files made explicit 
string infoDatFile;
string statusDatFile;

execute {  
	// Retreives velib station informations and generates corresponding .dat files
	var jsonBasePath = json_data_path + "bikes/";
	writeln("INFO Getting current station informations... ");
	infoDatFile = extract_current_stations_info_and_save_dat(jsonBasePath,url_stations_info,stations_info,dat_data_path);
	writeln("INFO ... done.\n Saved in dat file : ",infoDatFile,"\n");

	// Retreives velib station statuse and generates corresponding .dat files
	writeln("INFO Getting current status of station... ");
	statusDatFile = extract_current_stations_status_and_save_dat(jsonBasePath,url_stations_status,stations_status,dat_data_path);
	writeln("INFO ... done.\n Saved in dat file : ",statusDatFile,"\n");
}


