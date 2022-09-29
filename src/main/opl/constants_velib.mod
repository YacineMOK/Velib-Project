//----------------------------------------------------
// Velib-metropole data sources
//----------------------------------------------------
include "structures_geo.mod";
// Station information url : 
string url_stations_info = "https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_information.json";

// Station status url : 
string url_stations_status = "https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json";

// Data concerning maintenance worshops

string alfortville = "Alfortville";
	// Adresse : 11 All. Jean-Baptiste Preux, 94140 Alfortville
	
string villeneuveLaGarenne = "Villeneuve-La-Garenne";
	// Adresse : 10 Rue du Commandant d'Estienne d'Orves, 92390 Villeneuve-la-Garenne


{string} workshops = {alfortville,villeneuveLaGarenne};

/* GPS coordinates of workshops
	Source : https://www.coordonnees-gps.fr/
*/


GeoCoord workshopCoord[workshops] = [
	<48.778706,2.426723>,	// Alfortville
	<48.941463,2.312745>	// Villeneuve
];

