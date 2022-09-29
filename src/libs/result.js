// Author Ph. Chatalic

// Saves the instance result in the appropriate file
function save_result(cost,steps,modelName) {
	// cost is an int
	// steps is a set of Etapes
	// modelName is a string corresponding to the main model file ("visite1.mod", "visite2.mod", "visite3.mod",...)
		var result_file = thisOplModel.instance.name + "_" + modelName + ".res";
		var path_file = "../resultats/" + result_file;
		var fo = new IloOplOutputFile(path_file);
		fo.writeln("optimum = ",cost,";");	
		fo.writeln("etapes = ",steps,";");
		fo.close();		 
	}
