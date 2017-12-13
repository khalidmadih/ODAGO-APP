$(document).ready(function() {
    $("[data-toggle=tooltip]").tooltip();

    // Check JS file linked
    console.log("Hello Meteors..your JS file is correctly linked ;) !");


    // Firebase database settings
    var config = {
        apiKey: "AIzaSyCkWRZNjvxfnZGrUWsh4pMTvf6QQ-KYDfY",
        authDomain: "weatherport-1234.firebaseapp.com",
        databaseURL: "https://weatherport-1234.firebaseio.com",
        projectId: "weatherport-1234",
        storageBucket: "weatherport-1234.appspot.com",
        messagingSenderId: "727567112121"
    };

    firebase.initializeApp(config);

    //Declaring variables
    var departureCity;
    var departureAirport;
    var arrivalCity;
    var arrivalAirport;
    var departureDate;
    var departureTime;


    //Looking up the city weather
    $("#search-flight").on("click", function(event) {
        event.preventDefault();
        departureCity = $("#departure-city-name").val().trim();
        departureAirport = $("#departure-city-code").val().trim();
        arrivalCity = $("#arrival-city-name").val().trim();
        arrivalAirport = $("#arrival-city-code").val().trim();
        departureDate = $("#date-input").val().trim();
        departureTime = $("#time-input").val().trim();

        console.log("Departure: " + departureCity + " - " + departureAirport);
        console.log("Arrival: " + arrivalCity + " - " + arrivalAirport);

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            arrivalCity + "&appid=7e0ce28483067588677241827b3bba6f";

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            // After data comes back from the request
            .done(function(response) {
                // console.log(queryURL);
                // console.log(response);
                var tempConvertedF = Math.round(((response.main.temp - 273.15) * 1.8) + 32);
                var tempConvertedC = Math.round(response.main.temp - 273.15);
                // console.log("C= " + tempConvertedC);
                var apiIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
                // console.log("this is icon :" +apiIcon);

                $("#destination-city").text(response.name);
                $("#date-display").text(response.departureDate);
                $("#description-display").text(response.weather[0].description);
                // console.log(response.weather[0].description);
                $("#destination-temp").text(tempConvertedF + "°F" + " / " + tempConvertedC + "°C");
                $("#weather-icon").attr("src", apiIcon);

            });

            SearchFlight ();

    });

    function SearchFlight () {

    	var queryURL = "https://aviation-edge.com/api/public/timetable?key=a1abd6-425fb9-25fef7-ce828d-ede24e&iataCode=" +
            departureAirport + "&type=departure";

            console.log(queryURL);

            $.ajax({
                url: queryURL,
                method: "GET"
            })

            .done(function(response) {
            	for (var i = response.length - 1; i >= 0; i--) {
            		console.log(response[i].status);
            	};
            	

            	});


    };


    // Auto complete code

    $(function() {
        $('.autocomplete').each(function() {
            var apca = new apc('autocomplete', {
                key: '1ee2b93fe0',
                secret: '86b8fa1526010db',
                limit: 7
            });

            var currentElement = $(this);

            var dataObj = {
                source: function(request, response) {
                    // make the request
                    apca.request(request.term);

                    // this builds each line of the autocomplete
                    itemObj = function(airport, isChild) {
                        var label;

                        if (isChild) { // format children labels
                            label = '&rdsh;' + airport.iata + ' - ' + airport.name;

                        } else { // format labels
                            label = airport.city;
                            if (airport.state.abbr) {
                                label += ', ' + airport.state.abbr;
                            }
                            label += ', ' + airport.country.name;
                            label += ' (' + airport.iata + ' - ' + airport.name + ')';
                        }
                        return {
                            label: label,
                            value: airport.iata + ' - ' + airport.name,
                            code: airport.iata,
                            city: airport.city
                        };

                    };

                    // this deals with the successful response data
                    apca.onSuccess = function(data) {
                        var listAry = [],
                            thisAirport;
                        if (data.status) { // success
                            for (var i = 0, len = data.airports.length; i < len; i++) {
                                thisAirport = data.airports[i];
                                listAry.push(itemObj(thisAirport));
                                if (thisAirport.children) {
                                    for (var j = 0, jLen = thisAirport.children.length; j < jLen; j++) {
                                        listAry.push(itemObj(thisAirport.children[j], true));
                                    }
                                }
                            }
                            response(listAry);
                        } else { // no results
                            response();
                        }
                    };
                    apca.onError = function(data) {
                        response();
                        console.log(data.message);
                    };
                },
                select: function(event, ui) {
                    // Assign city & code to hidden input elements
                    $("#" + currentElement.data("name") + "-name").val(ui.item.city);
                    $("#" + currentElement.data("name") + "-code").val(ui.item.code);


                }
            }

            // this is necessary to allow html entities to display properly in the jqueryUI labels
            $(this).autocomplete(dataObj).data("ui-autocomplete")._renderItem = function(ul, item) {
                return $('<li></li>').data('item.autocomplete', item).html(item.label).appendTo(ul);
            };
        });
    });

});