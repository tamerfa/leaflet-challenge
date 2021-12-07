// Storing earthquakes query's API in a variable
var quakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Storing techtonic plates query's API in a variable
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Initializing two layerGroups: earthquakes & faultLines
var earthquakes = new L.LayerGroup();
var faultLines = new L.LayerGroup();

// Defining basemap layers
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});

var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};
// Defining overlay map layers
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLines
};

// Creating our map with initial layers
// Creating map object
var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5,
    layers: [satellite, earthquakes, faultLines]
});

// Passing map layers into layer control
// Adding the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Querying earthquakes data
d3.json(quakesUrl).then(function(data) {
    // console.log(data);
    createCircles(data.features);
});

// Defining the function that will colour the circles and legend
function chooseColor(mag) {
    if (mag >= 5){
        return "#f06b6b";
    } else if (mag >= 4){
        return "#f0a76b";
    } else if (mag >= 3){
        return "#f3ba4d";
    } else if (mag >= 2){
        return "#f3db4d";
    } else if (mag >= 1){
        return "#e1f34d";
    } else {
        return "#b7f34d"; 
    };
};
// Defining the function that will create the circles layer
function createCircles (earthquakeData) {
    function pointToLayer(feature) {
        return L.circle([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],{
            radius:(feature.properties.mag*10000)
        });
    };

    function style(feature) {
        return {
            fillColor: chooseColor(feature.properties.mag),
            color: 'black',
            fillOpacity: 0.8
        };
    };

    function onEachFeature(feature, layer) {
        layer.bindPopup(
            "<h3>" + feature.properties.place +"</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
        );
    };

    L.geoJSON (earthquakeData, {
        pointToLayer: pointToLayer,
        style: style,
        onEachFeature: onEachFeature
    }).addTo(earthquakes);

    // Sending earthquakes layer to the createMap function
    // createMap(earthquakes);
    earthquakes.addTo(myMap);
}

// Defining the function that creates the techtonic plates layer
d3.json(platesUrl).then(function(platesData){
    // console.log(platesData);
    L.geoJSON (platesData,{
        color: "orange",
        weight: 2
    }).addTo(faultLines);
    
    // Sending faultLines layer to the createMap function
    // createMap(faultLines);
    faultLines.addTo(myMap);
})

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
        magnitudes = [0, 1, 2, 3, 4, 5];

    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(magnitudes[i]) + ';"></i> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }

    return div;
};

// Adding legend to the map
legend.addTo(myMap);