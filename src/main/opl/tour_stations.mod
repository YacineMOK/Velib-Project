/************************
* Devoir IALC 2021-22 
* Optimal tour for velib-stations inspection
* Yacine Mokhtari - Lilia Izri
************************/
using CP;

// ------------------ Data Structures -------------------------
include "structures_tour.mod";
// ------------------ Constants -------------------------
include "constants_velib.mod";
include "constants_openstreetmap.mod";

// ------------------- Librairies and JsCode ---------------------------
execute {  
	includeScript("../../libs/files.js");
	includeScript("../../libs/simpleJSONParser.js");
	includeScript("../../libs/geoServices.js");
}
// ------------------ Velib-metropole data sourcees -------------------------

// A faire

// ------------------- Instance Data ---------------------------
string maintenanceWorkshop = ...;

// Use this structure to describe  the partitions elements
// and as input of the tour_station.mod model

{StationTour} stations_info = ...;
{string} stationsIds = union (s in stations_info) {s.stationId};
{string} lieux = stationsIds union {maintenanceWorkshop};
int matriceTemps [lieux][lieux] = [[1000,    10,     1,     10,   10],
								   [  10,  1000,    10,     10,   10],
								   [  10,     1,  1000,     10,   10],
							 	   [   1,    10,    10,   1000,   10],
							       [  10,    10,    10,      1, 1000]]; 
								 // On choisit de mettre un grand temps si c'est la même station
								 // On devrait retrouver donc WS -> 4 -> 1 -> 3 -> 2 -> WS 

// --------------------Preprocessing------------------
	
// A faire

// --------------------Model------------------

int n = card(lieux);	// Nb stations +  workshop
range ordre = 0..n;		// range pour representer l'ordre dans lequel on va parcourir nos dist
int maxTemps = max(id1, id2  in stationsIds) matriceTemps[id1][id2];

// represente l'ordre dans le quel on va parcourir les stations:
dvar int matriceOrdre[ordre][lieux] in 0..1;

/**
[[  A  B  C  D  Workshop
0   0, 0, 0, 0, 1
1	0, 0, 1, 0, 0
2	0, 1, 0, 0, 0
3	1, 0, 0, 0, 0
4	0, 0, 0, 1, 0
5   0, 0, 0, 0, 1
]]

--- On va parcourir les stations dans l'ordre C, B, A, D
**/


// Va reprepresenter le temps de trajet total (en comptant le l'aller retour vers le workshop)
dvar int tempsTrajet in 0..maxTemps*n;

minimize 
	tempsTrajet;

constraints{
	// Contrainte 1
	// Avoir un seul 1 par ligne 
	forall(o in ordre){
		sum (l in lieux) matriceOrdre[o][l] == 1;
	}
	// Avoir un seul 1 par colonne (sauf pour le workshop)
	forall(id in stationsIds){
		sum (o in ordre) matriceOrdre[o][id] == 1;
	}
	// Le workshop a 2x un dans sa colonne
	sum (o in ordre) matriceOrdre[o][maintenanceWorkshop] == 2;

	// Contrainte 2
	// fixer les val pour workshop
	matriceOrdre[0][maintenanceWorkshop] == 1;
	matriceOrdre[n][maintenanceWorkshop] == 1;

	// Contraine 3
	// On calcule le temps de trajet qui est la somme des temps entre 2 points/lieux (station, atelier)
	tempsTrajet == (sum (i in 0..n-1, l1, l2 in lieux) matriceOrdre[i][l1]*matriceOrdre[i+1][l2]*matriceTemps[l1][l2]);
}
execute{
	writeln("L'ordre pour parcourir: ");
	write("Workshop --> ");
	for (var o in ordre){
		for (var id in stationsIds){
			if (matriceOrdre[o][id] == 1){
				write(id, " --> ");
			}
		}
	}
	write("Workshop.");
}