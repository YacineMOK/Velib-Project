/*
*********************************************************************
* 					Devoir IALC2 2021-22 							*
*********************************************************************
*/
using CP;

// ------------------ Constants -------------------------
// Constants relative to data paths
include "constants_data_paths.mod";

// ------------------- Instance Data ---------------------------
string   instance_name = ...;
{string} instance_files = ...;

// ------------------- Instance Data ---------------------------

// Main-bloc - loading .dat files describing the instance
main {
	// Model file for the partitioning problem
	var modelFile = "partitioning.mod";
	var modelSource = new IloOplModelSource(modelFile);
    var modelDefinition = new IloOplModelDefinition(modelSource);

    var cpSolver = new IloCP();
    var partitioningModel = new IloOplModel(modelDefinition,cpSolver);


    writeln("INFO Solving instance : ", thisOplModel.instance_name, " with model : ", modelFile);

	
	// Adding instance (dat) files as data sources for the model
	for (f in thisOplModel.instance_files) {
		var filePath = f;
		writeln("INFO loading dat file : ", filePath);
		var dataSource = new IloOplDataSource(filePath);
		partitioningModel.addDataSource(dataSource) ;		
	}
// 	writeln("DEBUG partitioningModel.stations_info = ", partitioningModel.stations_info);
// 	writeln("DEBUG partitioningModel.stations_status = ", partitioningModel.stations_status);
// 	writeln("DEBUG partitioningModel.maintenanceWorkshop = ", partitioningModel.maintenanceWorkshop);

	var path_out = "../../../data/dat/results/partioning/";
	IloOplExec("rm -r " + path_out);
	IloOplExec("mkdir " + path_out);

	// Solving instance
	partitioningModel.generate();
	if (cpSolver.solve()) {
		var obj = cpSolver.getObjValue();
		partitioningModel.postProcess();

		// 1 er fichier on enregistre un tableau pour tester  
		var f2 = new IloOplOutputFile(path_out + "output.dat");
		f2.writeln("[");
		for (var i = 1; i<=partitioningModel.numberOfInspectors; i++){
			f2.writeln("\t{");
			for (var stationId in partitioningModel.kstations){
				if (partitioningModel.repartitions[i][stationId] == 1){
					f2.writeln("\t\t(",  partitioningModel.stations_tauxAnomalies_array[stationId],", ",
									 partitioningModel.stations_nbAnomalies_array[stationId],", ",
									 stationId, ", ", 
									 partitioningModel.indexToInfo[stationId].lat, ", ",
									 partitioningModel.indexToInfo[stationId].lon, ", ",
									 partitioningModel.indexToInfo[stationId].name, "),");
				}	
			}
			
			f2.writeln("\t},");
		}
		f2.writeln("]");
		f2.close();


		// 2eme fichier pour le modele 2
		var path_out = "../../../data/dat/results/partitionnement/";
		IloOplExec("rm -r " + path_out);
		IloOplExec("mkdir " + path_out);
		path_instance = path_out + "instance" + "/";
		IloOplExec("mkdir " + path_instance);
		for (var i = 1; i<=partitioningModel.numberOfInspectors; i++){
			var f2 = new IloOplOutputFile(path_instance + "partition-" + i +".dat");
			f2.writeln("partitionnement={");
			for (var stationId in partitioningModel.kstations){
				if (partitioningModel.repartitions[i][stationId] == 1){
					f2.writeln("<",  partitioningModel.stations_nbAnomalies_array[stationId],", ",
									 stationId,", ",
									 partitioningModel.indexToInfo[stationId].lat, ", ",
									 partitioningModel.indexToInfo[stationId].lon, ", ",
									 partitioningModel.indexToInfo[stationId].stationCode, ", ",
									 partitioningModel.indexToInfo[stationId].name,">" );

				}	
			}
			f2.write("}");
			f2.close();
		}
	}
	else {
		writeln("INFO No solution found ");
	}
	writeln("INFO clearing partition Model ");
	// Closing 
	partitioningModel.end();
	cpSolver.end();
	modelDefinition.end();
	modelSource.end();
	
}