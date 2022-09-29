/*
*********************************************************************
* 					Devoir IALC2 2021-22 							*
*																	*
* 	Izri Lilia - Mokhtari yacine												*
*********************************************************************
*/
using CP;

// ------------------ Data Structures -------------------------
include "structures_velib.mod";
//include "structures_tour.mod";

// ------------------ Constants -------------------------

// Constants relative to Velib-Metroole
include "constants_velib.mod";

// Constants relative to data paths
include "constants_data_paths.mod";

// ------------------- Instance Data ---------------------------
// Data extracted from velib open data services
{StationInfo} stations_info = ...;
{StationStatus} stations_status = ...;

// Partitioning parameters
string maintenanceWorkshop = ...;	//"Alfortville" or ""
int averageInspectionTime = ...;	//Average time to check a single dock/bike
int numberOfInspectors = ...;		//Number of Inspectors (i.e. size of the partition)
int periodLength = ...;				// Length (in mn) of the inspection period
int averageDrivingSpeed = ...;		// Average driving seed in town (in km/h) 


// -------------------  ecmaScript Librairies ---------------------------
execute {  
	includeScript("../../libs/files.js");
	includeScript("../../libs/geoServices.js");
	includeScript("../../libs/dates.js");
}

// ------------------- your ecmaScript functions definitions ar---------------------------
execute {  
	includeScript("../js/velib.js");
	//includeScript("../js/geo.js");
}

// ----------------------  instance data preprocessing  ---------------

{string} stationsNoms = union (s in stations_info) {s.name};
{string} stationsIds = union (s in stations_info) {s.stationId};

// Tableau pour enregistrer l'appartenance ou non d'une station à l'atelier du model
// 0 --> la station ny est pas rattachée
// 1 --> la station y est rattachée
int stations_appartenance[stationsIds];


// tuple pour associer les stations aux taux/nb d'anomalies
tuple tupleAnomalies  {float  taux; int nb; string stationId;};
// Set triés pour enregistrer id des stations et leurs anomalies 
reversed {tupleAnomalies} stationsAnomalies;


// Version array
float stations_tauxAnomalies_array[stationsIds]; // Tableau initialisé à 0 !
int stations_nbAnomalies_array[stationsIds]; // Tableau initialisé à 0 !


// Tableau/Matrice pour garder les distances déjà calculées
int distanceMatrice[stationsIds][stationsIds]; // Pour s1, s2 in stationsIds : distanceMatrice[s1][s2] = N <=> dist(s1,s2) = N mètres
int distanceAtelierStations[stationsIds]; // Pour s in stationsIds : distanceAtelierStations[s] = N <=> dist(atelier, s) = N mètres



int nombreStationsAffectees = 0;
int nombreStationsAvecAnomalies = 0;
int nombreAnomalieMoyen;
int distanceMoyenneVersAtelier = 0; 
int distanceMoyenneEntreStations = 0;

int tempsMoyenVersAtelier = 0;
int k = 0;  // Nombre de stations que l'on pourrait éventuellement traiter en une journée de travail
			// k est un estimateur que nous allons estimer dans la partie préprocessing.

// Index code station -> station status
StationStatus  index[stationsIds] = [s.stationId : s | s in stations_status];
// Index code station -> station info
StationInfo  indexToInfo[stationsIds] = [s.stationId : s | s in stations_info];


// L'ensemble des stations que l'on peut traiter
{string} kstations;

// ---------------------- Preprocessing ----------------------
execute{
	//periodLength = 300;
	/**
     * Fonction qui boucle sur les stations et qui affecte chaque station à l'un des deux ateliers
     * Modification de la variable OPL "stations_appartenance"
     */
    function affectationStations(stations){
        var dist1 = 0.;
        var dist2 = 0.;
		var sommeDistancesAtelierStations = 0;
		var nombreTotaleAnomalies = 0;
		var sommeDistancesStations = 0;
		var dist = 0;

		// On recupere les coordonnees de l'atelier que l'on traite dans ce modele 
		// et celles de l'autre modele
		if (maintenanceWorkshop == "Alfortville"){
			lat_atelier = workshopCoord["Alfortville"].lat;
			lon_atelier = workshopCoord["Alfortville"].lon;
			lat_autre_atelier = workshopCoord["Villeneuve-La-Garenne"].lat;
			lon_autre_atelier =  workshopCoord["Villeneuve-La-Garenne"].lon;
		} else {
			lat_atelier = workshopCoord["Villeneuve-La-Garenne"].lat;
			lon_atelier = workshopCoord["Villeneuve-La-Garenne"].lon;
			lat_autre_atelier = workshopCoord["Alfortville"].lat;
			lon_autre_atelier =  workshopCoord["Alfortville"].lon;
		}

        for (var s in stations){
            // Calculer les distances entre la station et nos deux ateliers
            // Faire en sorte de mettre dist1  la distance avec l'atelier maintenanceWorkshop
			dist1 = Math.ceil(mdistance(s.lat, s.lon, lat_atelier, lon_atelier));
            dist2 = Math.ceil(mdistance(s.lat, s.lon, lat_autre_atelier, lon_autre_atelier));

			// Enregistre distance atelier <-> station
			distanceAtelierStations[s.stationId] = dist1;
			
            if (dist1 < dist2 && index[s.stationId].is_returning == 1){	// On vérifie que la station est atice et qu'elle appartient bien au workshop
                // Mettre à jour le tableau des affectations
                stations_appartenance[s.stationId] = 1;
                // Compter le nombre de stations affectées à cet atelier (avec et sans anomalies)   
                nombreStationsAffectees+=1;

                // Mettre à jour le tableau des anomalies 
                if (s.capacity > 0){
					// Calcule le nb d'anomlies 
                    var available = index[s.stationId].numBikesAvailable + index[s.stationId].numDocksAvailable;
                    var nbAnomalies = (s.capacity - available);

                    if (nbAnomalies > 0){
						
						// Sert surtout pour ecrire les resultats dans fichiers
						stations_nbAnomalies_array[s.stationId] = nbAnomalies;
						stations_tauxAnomalies_array [s.stationId] = nbAnomalies*1./s.capacity;

						// Sommer les distances entre les stations que nous allons traiter et l'atelier
						sommeDistancesAtelierStations += dist1;

						// enregistre les anomalies
						stationsAnomalies.add( nbAnomalies*1. / s.capacity, nbAnomalies, s.stationId);
						
						// et compter le nombre d'anomalies ainsi que le nombre de stations ayant des anomalies
                        nombreTotaleAnomalies += nbAnomalies;
                        nombreStationsAvecAnomalies+=1;
                    }
                }
            }
        }

		// Double boucle pour calculer les distances entre chaque stations
		for (var s in stationsAnomalies){
			for (var s2 in stationsAnomalies){
				// On calcule la distance et on remplie nos matrices
				if (s2.stationId!= s.stationId){
					distanceMatrice[s.stationId][s2.stationId] = Math.ceil(mdistance(indexToInfo[s.stationId].lat, indexToInfo[s.stationId].lon, indexToInfo[s2.stationId].lat, indexToInfo[s2.stationId].lon));
					sommeDistancesStations += mdistance(indexToInfo[s.stationId].lat, indexToInfo[s.stationId].lon, indexToInfo[s2.stationId].lat, indexToInfo[s2.stationId].lon);distanceMatrice[s.stationId][s2.stationId]
				}
			}
		}

		// Enregistre les valeurs pour les vars opl
		distanceMoyenneVersAtelier = Math.ceil(sommeDistancesAtelierStations/nombreStationsAvecAnomalies); // Cette variable calcule la distance moyenne entre l'atelier et les stations rencontrant des anomalies
 		nombreAnomalieMoyen = Math.ceil(nombreTotaleAnomalies/nombreStationsAvecAnomalies);
		distanceMoyenneEntreStations = Math.ceil(sommeDistancesStations/((nombreStationsAffectees-1)*nombreStationsAffectees));
		
		// Des variables locales, utiles pour estimer K mais pas très intérressantes à garder pour la suite
		var vitesseMoyenne = Math.ceil((averageDrivingSpeed*1000)/60); // averageDrivingSpeed (Km/h) 
		var tempsMoyenEntreStation = Math.ceil(distanceMoyenneEntreStations/vitesseMoyenne); // distanceMoyenneEntreStations (min)
		var tempsMoyenAllerRetour = (distanceMoyenneVersAtelier/vitesseMoyenne)*2;
		
		// Approximation k
		/* Une petite précision par rapport aux unités : 
		 * ---------------------------------------------
		 * Nous avons fait en sorte que toutes les variables de distances soient converties en metre/minute 
		 * et que toutes les variables de temps soient exprimées en minutes pour des questions d'homogénéité
		 */

		// Une approximation de la valeur de k, qui est la valeur du nombre totale de stations à inspecter.
		// Plus de détails dans le rapport 
		k = Math.ceil((periodLength * numberOfInspectors - tempsMoyenAllerRetour + tempsMoyenEntreStation)/(averageInspectionTime*nombreAnomalieMoyen + tempsMoyenEntreStation));

	}


	affectationStations(stations_info);
    
	writeln("-- nombreAnomalieMoyen: ", nombreAnomalieMoyen);
	writeln("-- distanceMoyenneVersAtelier: ", distanceMoyenneVersAtelier);
	writeln("-- distanceMoyenneEntreStations: ", distanceMoyenneEntreStations);
	writeln("-- k = ", k);

	//Selectionne les k stations avec les pires taux d'anomalies
	var i = 0;
	for (var station in stationsAnomalies){
		if (i<k){
			kstations.add(station.stationId);
			i++;
		}
	}


	writeln("-- ids des k stations: ", kstations);

}

// ---------------------- Solver Parameters ----------------------
execute {
    cp.param.searchType = "DepthFirst"; 
    cp.param.workers = 1;
    cp.param.logVerbosity="Quiet";
}

// ---------------------- Model ----------------------
range range_inspectors = 1..numberOfInspectors;	// Un ensemble allant de 1 au nombre d'inspecteurs de cet atelier
int maxDistanceStations = max(s1, s2 in stationsIds) distanceMatrice[s1][s2]; // La distance max entre 2 stations
int maxDistanceAtelier = max(s in stationsIds) distanceAtelierStations[s]; // La distance max entre une station et un atelier

		/* Variables de décision*/
dvar int repartitions[range_inspectors][kstations] in 0..1;	 // rappel : kstations est un {string} contenant les k stations à visitée, triée suivant le taux d'anomalies
/** Explication:
 *  ------------
 *  Ici nous avons une matrice de taille NbrInspecteur(int) X lesKStations(String).
 *  Par ex : repartition[2]["2929292"] = 1 <=> la station dont l'id est 2929292 sera visitée par l'inspecteur '2'
 *  Par ex : repartition[1]["3737373"] = 0 <=> la station dont l'id est 2929292 ne sera pas visitée par l'inspecteur '1'
 */

dvar int distMoyEntreStations[range_inspectors] in 0..maxDistanceStations;
dvar int distMoyAtelier[range_inspectors] in 0..maxDistanceAtelier;
/** Explication:
 *  ------------
 *  On garde des varibles de decision pour calculer la distance moyenne entre les stations
 *  de chaque partition ainsi que les distances moy entre l'atelier et les stations des partitions.
 *  Ici nous avons une matrice de taille NbrInspecteur(int) 
 *  Par ex : distMoyAtelier[2] = 1000 <=> la distance moy entre l'atelier et les stations de la partition de l'inspecteur 2 est égale à 1000m
 *  Par ex : distMoyEntreStations[1] = 550 <=> la distance moy entre les stations de la partition de l'inspecteur 1 est égale à 550m
 */

		/* Variable d'accomodité*/
// Permettent de déduire le temps moyen entre les stations et l'atelier 
// à partir de la distance précedente et la vitesse
dvar int tempsMoyEntreStations[range_inspectors] in  0..periodLength;	// Temps moyen pour parcourir toutes les stations de la partition
dvar int tempsMoyVersAtelier[range_inspectors] in  0..periodLength;     // Temps en moyenne pour faire un aller a l'atelier


	/* Variable à maximiser : le nombre de station à visiter parmis les k stations */
// le nombre k étant qu'une (sur)estimation, il se peut que nos inspecteurs ne puissent pas toutes les inspecter 
// nous chercherons ainsi à maximiser le nombre de stations à inspecter parmis les k premières/plus urgentes !
dvar int nombre_stations_a_traiter in 0..k;

	/* Variable à minimiser : diametres partitions de chaque employeur*/
dvar int diametresPartitions[range_inspectors] in 0..maxDistanceStations;

// On crée donc une var qui va regrouper les 2 critères à minimiser
dvar int objectifAMinimiser in 0..maxDistanceStations;


minimize 
	objectifAMinimiser;

subject to {
		/**** Definition du critere d'optimisation ****/
	// On veut que l'on traite le plus de stations possibles et que les diametres des partitions soient petits
	// nb de stations que l'on traite
	nombre_stations_a_traiter == sum (station in kstations, insp in range_inspectors) ( repartitions[insp][station]) ;
	objectifAMinimiser == (sum (i in range_inspectors) diametresPartitions[i]/numberOfInspectors)*0.001 - nombre_stations_a_traiter;
		
		/**** Contraintes de différences:****/
		// Une station ne doit être visitée au plus que par un seul inspecteur 
	forall(station in kstations) {
		sum (insp in range_inspectors) repartitions[insp][station] <= 1;
	}

		/****  Contraintes pour retrouver les temps en moyenne pour chaque partition ET le diametre ! ****/
		// Pour chaque partition on calcule la distance moyenne entre les stations et entre l'atelier et
		//  les stations puis on divise par la vitesse pour retrouver les temps moyens
	forall(insp in range_inspectors){
		// Calculs des distances moy entre chaque 2 stations d'une partition, puis on divise par 2*nb de stations de cette partitions
		// (Le facteur 2 c'est parceque on calcule 2 fois la distance entre chaque station)
		distMoyEntreStations[insp] == ftoi(ceil((sum (s1, s2 in kstations) repartitions[insp][s1]*repartitions[insp][s2]*distanceMatrice[s1][s2])/(2 * ((sum (s in kstations) repartitions[insp][s])))));
		
		// Calculs des distances moy entre les stations et l'atelier
		// (nb stations affectees x distance moyenne) /vitesse
		distMoyAtelier[insp] == ftoi(ceil((sum (s in kstations) repartitions[insp][s]*distanceAtelierStations[s])/sum (s in kstations) repartitions[insp][s]));
		
		// Calculs des temps a partir des var precedentes et la vitesse
		tempsMoyEntreStations[insp] == ftoi(ceil(((distMoyEntreStations[insp]*((sum (s in kstations) repartitions[insp][s])-1))/(averageDrivingSpeed*1000/60))));
		tempsMoyVersAtelier[insp] == ftoi(ceil(distMoyAtelier[insp]/(averageDrivingSpeed*1000/60)));
		
		// Calcule du diametre (distance max dans une partition)
		diametresPartitions[insp] == (max (s1, s2 in kstations) repartitions[insp][s1]*repartitions[insp][s2]*distanceMatrice[s1][s2]);
	}
		/**** Contraintes sur le temps ****/
		// Un employé ne doit pas travailler plus de periodLength dans la journée
	forall(insp in range_inspectors){
			tempsMoyEntreStations[insp]
			+ tempsMoyVersAtelier[insp]*2
			+ sum (station in kstations) (repartitions[insp][station]* averageInspectionTime*stations_nbAnomalies_array[station])
			<= periodLength;
	}
}

		
// ---------------------- Display of solutions ----------------------
execute {
	writeln(" -------------- ");
	writeln("Le planning : ");
	for (var insp in range_inspectors){
		writeln(" ------- ");
		writeln(" -- Inspecteur n° ", insp, " - Sa Répartition: \n", repartitions[insp]);

		var tempsTotalInspection = 0;
		for(var station in kstations) {
			tempsTotalInspection += (repartitions[insp][station]*(averageInspectionTime*stations_nbAnomalies_array[station]));
		}
		writeln("- Distance moyenne entre les stations de sa partition : ", distMoyEntreStations[insp], "m.");
		writeln("- Distance moyenne entre l'atelier et ses stations : ", distMoyAtelier[insp], "m.");
		writeln("- Temps d'inspection: ", tempsTotalInspection, "min.");
		writeln("- Temps moyen entre pour parcourir toutes les stations de sa partition :",tempsMoyEntreStations[insp], "min.");
		writeln("- Temps moyen entre une station et l'atelier : ", tempsMoyVersAtelier[insp], "min.");
		writeln(" ------- ");
	}
}