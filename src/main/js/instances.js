/* Generates a set of new instance file from a set of parameters values
 * datDirPath is the (relative) root of the dat files directory
 * infoFile is the filePath of the file describing stations informations
 * statsFile is the filePath of the file describing stations status
 * w is the selected maintenance workshop
 * it is the average inspectiontime time
 * ni is the number of inspectors
 * p is the period_length
 * s is the average urban speed
 */ 
function generate_instances_files(datDirPath,infoFile,statusFile,ws,its,nis,ps,ss) {
	// Checking parameters .dat file existance
	// NB : workshops are assumed to be declared in constants_velib.mod
	for (it in its) 
			check_or_create_parameter_File(datDirPath,"it",it);
	for (ni in its) 
			check_or_create_parameter_File(datDirPath,"ni",ni);
	for (p in ps) 
			check_or_create_parameter_File(datDirPath,"p",p);
	for (s in ss) 
			check_or_create_parameter_File(datDirPath,"p",p);
	// Creating the set of instances files relative to infoFile + statusFile and parameter sets
	for (w in ws) 
		for (it in its) 
			for (ni in nis) 
				for (p in ps) 
					for (s in ss) 
						generate_instance_file(datDirPath,infoFile,statusFile,w,it,ni,p,s);
}


/* Generates one new instance file from a set of parameters
 * infoFile is the filePath of the file describing stations informations
 * statusFile is the filePath of the file describing stations status
 * w is the selected maintenance workshop
 * it is the average inspectiontime time
 * ni is the number of inspectors
 * p is the period_length
 * s is the average urban speed
 */ 
function generate_instance_file(datDirPath,infoFile,statusFile,w,it,ni,p,s) {
	var instance_name = 
		instance_prefix_from_status_file_name(statusFile) + w + "_" + it + "_"+ ni + "_" + p + "_"+ s + ".dat"
		var infoFileBase = file_base_name(infoFile);
		var statusFileBase = file_base_name(statusFile)
	var instance_content = 
		  "// Instance name\n"
		+ "instance_name = \""+ instance_name + "\";\n"
		+ "\n"
		+ "// Instance files \n"
		+ "instance_files = {\n" 
		+ "\t\"" + datDirPath + "stations_info/" + infoFileBase + "\",\n"
		+ "\t\"" + datDirPath + "stations_status/" + statusFileBase + "\",\n"
		+ "\t\"" + datDirPath + "partitioning_parameters/w_" + w + ".dat\",\n"
		+ "\t\"" + datDirPath + "partitioning_parameters/it_" + it + ".dat\",\n"
		+ "\t\"" + datDirPath + "partitioning_parameters/ni_" + ni + ".dat\",\n"
		+ "\t\"" + datDirPath + "partitioning_parameters/p_" + p + ".dat\",\n"
		+ "\t\"" + datDirPath + "partitioning_parameters/s_" + s + ".dat\"\n"
		+ "};\n";
	var filePath = datDirPath + "partitioning_instances/" + instance_name;
	save_string_to_file(filePath,instance_content);	
	writeln("INFO: instance ", filePath, " generated");
	return filePath;
}

/* creates an instance name prexix from statusFilePath
 * If statusFilePath is of the form 'station_status_YYMMDD-HHMM.dat'
 *    prefix will be of the form 'instance_YYMMDD-HHMM_'
 * Otherwise it will be of the form 'instance_'+ instance_file_name+'_';
 * where instance_file_name is the original file name (without extension)
 */ 
function instance_prefix_from_status_file_name(statusFilePath) {
	var pos_suffix = statusFilePath.lastIndexOf(".dat");
	if (pos_suffix == -1) {
		writeln("ERROR : file is not a .dat file :", statusFilePath);
		fail();
	}
	var instance_file_name = file_base_name_without_extension(statusFilePath);		
		writeln("DEBUG : instance_file_name :", instance_file_name);
	var status_file_prefix = "stations_status_";
	var pos_prefix = statusFilePath.indexOf(status_file_prefix);
		writeln("DEBUG : pos_prefix :", pos_prefix);
	var instance_prefix = "instance_";
	if (pos_prefix != 0){// file is not of the form
		instance_prefix = instance_prefix + instance_file_name.substring(status_file_prefix.length ) + "_"; 
	}
	else
		instance_prefix + instance_file_name + "_"; 
	return instance_prefix;
}

function check_or_create_parameter_File(datDirPath, parameter,value) {
	var partitioning_dir = datDirPath + "partitioning_parameters/";
	var filePath = partitioning_dir + parameter + "_" + value + ".dat";
	var file = new IloOplOutputFile(filePath);

    if (! file.exists) {
      var content;
      writeln("\nWARNING : creating parameter file ", filePath);
      if (parameter == "w" && value != "al" && value != "vil") {
      		writeln("\n WARNING : missing workshop ", filePath);
      	writeln(" 		 whorkshops must be declared in constants_velib.mod and files");
      	writeln(" 		 and created manually in ",partitioning_dir); 
      	fail();   	      
      } 
      else if (parameter == "it") {
      	content = "// Average time to check a dock/bike (expressed in mn)\n"
      			  + "averageInspectionTime = " + value + ";\n";      
      } 
      else if (parameter == "ni") {
      	content = "// Number of inspectors sent by the maintenance workshop\n"
      			  + "numberOfInspectors = " + value + ";\n";      
      } 
      else if (parameter == "p") {
      	content = "// Service Period length (in mn) \n"
      			  + "periodLength = " + value + ";\n";      
      }
      else if (parameter == "s") {
      	content = "// Average Urban Driving Speed (in km/h) \n"
      			  + "speed = " + value + ";\n";      
      } 
      file.writeln(aString);
    }
    file.close();
}


 
 


