/************************
* Devoir IALC 2021-22 
* File : velib_infos.mod
* Description : 
************************/
using CP;

// ------------------ Structures -------------------------
include "structures_velib.mod";


// ------------------ Constants -------------------------
include "constants_velib.mod";
include "constants_data_paths.mod";

// ------------------- Getting data from Velib servers ---------------------------
include "velib_infos_bloc.mod";

// ------------------- Generation of instance files ---------------------------

// ------------------- Data Parameters sets ---------------------------
{string} workshopsAbrev = ...;
{int} inspectionTimes = ...;
{int} numberOfInspectors = ...;
{int} periodLengths = ...;
{int} speeds = ...;

execute {  
	// Project ecmascript functions
	includeScript("../js/instances.js");
	
	generate_instances_files(dat_data_path,infoDatFile,statusDatFile,
			workshopsAbrev,inspectionTimes,numberOfInspectors,periodLengths,speeds);
}


// ------------------- Main Bloc ---------------------------
main {
	// Nothing to solve -- Juste genererate
}
