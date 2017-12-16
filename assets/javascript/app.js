$(document).ready(function() {
    $("[data-toggle=tooltip]").tooltip();

    //Reload the page when modal is closed
    $("#modal-close").on("click", function(event) {
        event.preventDefault();
        location.reload();
    });

    // Check JS file linked
    console.log("Hello Meteors..your JS file is correctly linked ;) !");

    
    Today = moment(new Date()).format('MM/DD/YYYY');
    console.log("Today is: "+Today);
    $('#date-input').val(Today);
    // $('#date-input').datepicker();

    // Firebase database settings
    var config = {
        apiKey: "AIzaSyC7gyV-JALb0MsVRDMIIsDLSWNpL1U_we0",
        authDomain: "ondago-f973b.firebaseapp.com",
        databaseURL: "https://ondago-f973b.firebaseio.com",
        projectId: "ondago-f973b",
        storageBucket: "ondago-f973b.appspot.com",
        messagingSenderId: "1087050835751"
    };

    firebase.initializeApp(config);
    readFromFirebase();

    //Declaring variables
    var departureCity;
    var departureAirport;
    var arrivalCity;
    var arrivalAirport;
    var departureDate;
    var departureTime;

    //------variables for flight api:
    var departureDateFL;
    var departureTimeFL;
    var departureAPT;
    var arrivalAPT;
    var arrivalTimeFL;
    var flightNBR;
    var statusFL
    var gateFL;
    var flightResults = [];

    //Looking up the city weather
    $("#search-flight").on("click", function(event) {
        event.preventDefault();

        //Collecting data from the form
        departureCity = $("#departure-city-name").val().trim();
        departureAirport = $("#departure-city-code").val().trim();
        arrivalCity = $("#arrival-city-name").val().trim();
        arrivalAirport = $("#arrival-city-code").val().trim();
        departureDate = $("#date-input").val().trim();
        // departureTime = $("#time-input").val().trim();

        console.log("Departure: " + departureCity + " - " + departureAirport);
        console.log("Arrival: " + arrivalCity + " - " + arrivalAirport);
        console.log("Departure date: " + departureDate);

        // Openweathermap settings
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            arrivalCity + "&appid=7e0ce28483067588677241827b3bba6f";

        //Setting the cursor and form inputs to show form submitted
        $('#date-input').datepicker();
        $(":input").prop("disabled", true);

        //Making the ajax call for weather data
        $.ajax({
                url: queryURL,
                method: "GET"
            })

            // After data comes back from the request
            .done(function(response) {

                //Variables to manipulate temprature
                var tempConvertedF = Math.round(((response.main.temp - 273.15) * 1.8) + 32);
                var tempConvertedC = Math.round(response.main.temp - 273.15);
                //Building the link to the weather icon
                var apiIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

                //Replacing the data in the page/panel
                $("#destination-city").text(response.name);
                $("#date-display1").html(departureDate);
                $("#description-display").text(response.weather[0].description);
                // console.log(response.weather[0].description);
                $("#destination-temp").text(tempConvertedF + "°F" + " / " + tempConvertedC + "°C");
                $("#weather-icon").attr("src", apiIcon);
                $(":input").prop("disabled", false);
                $("#search-flight").css('cursor', 'auto');

            });

        //Add weather data to Firebase
        addToFirebase();
        //Read data from Firebase
        readFromFirebase();
        //Search for the flights
        SearchFlight();

    });

    //Function to search for flights
    function SearchFlight() {

        //Api settings
        var queryURL = "https://aviation-edge.com/api/public/timetable?key=a1abd6-425fb9-25fef7-ce828d-ede24e&iataCode=" +
            departureAirport + "&type=departure";
        console.log(queryURL);

        //Making the ajax call to flights api
        $.ajax({
                url: queryURL,
                method: "GET"
            })

            .done(function(response) {

                //Parse the result - because it's a string
                var parsedResponse = JSON.parse(response);
                console.log(parsedResponse);

                //Looping around the results
                var checkResults = false;

                for (var i = 0; i < parsedResponse.length; i++) {
                    if (arrivalAirport == parsedResponse[i].arrival.iataCode) {
                        //Formating the results & logging to the console for debugging
                        console.log("Flight from : " + parsedResponse[i].departure.iataCode + " to " + parsedResponse[i].arrival.iataCode + " : " + parsedResponse[i].flight.iataNumber + " - " + parsedResponse[i].status + " on ");
                        checkResults = true;
                        departureDateFL = moment(parsedResponse[i].departure.scheduledTime).format('MM/DD/YYYY');
                        console.log("Date : " + departureDateFL);
                        departureTimeFL = moment(parsedResponse[i].departure.scheduledTime).format('HH:MM A');
                        console.log("Time : " + departureTimeFL);
                        arrivalTimeFL = moment(parsedResponse[i].arrival.scheduledTime).format('HH:MM A');
                        gateFL = parsedResponse[i].arrival.gate;

                        //Replae with TBD if Gate is undefined
                        if (gateFL === undefined) {
                            console.log("Not Assigned");
                            gateFL = "TBD";
                        } else {
                            console.log("Gate : " + gateFL);
                        }

                        //assignig the rest of the data to variables
                        departureAPT = parsedResponse[i].departure.iataCode;
                        arrivalAPT = parsedResponse[i].arrival.iataCode;
                        flightNBR = parsedResponse[i].flight.iataNumber;
                        statusFL = parsedResponse[i].status;

                        //Pushing the results to a clean array of objects
                        flightResults.push({
                            "Date": departureDateFL,
                            "Flight#": flightNBR,
                            "Departure": departureAPT,
                            "TimeD": departureTimeFL,
                            "Arrival": arrivalAPT,
                            "TimeA": arrivalTimeFL,
                            "Status": statusFL,
                            "Gate": gateFL
                        });

                        console.log(flightResults);
                    }
                }

                //Condition checking for no results
                if (!checkResults) {
                    //Show modal with error message
                    $("#myModal").modal({ show: true });
                    console.log("No results found for this route");
                }
                //If there are results, build the flights result table
                else {
                    BuildFlightResultTable();
                };
            });
    };

    BuildFlightResultTable();

    //Function to add search input to firebase
    function addToFirebase() {

        firebase.database().ref().set({
            departureCity: departureCity,
            departureAirport: departureAirport,
            arrivalCity: arrivalCity,
            arrivalAirport: arrivalAirport,
            departureDate: departureDate
        });
    };

    //Function to read from firebase and populate page
    function readFromFirebase() {

        firebase.database().ref().on("value", function(snapshot) {

            var departureDateFormatted = moment(snapshot.val().departureDate).format('MM/DD/YYYY');

            $("#departure-display").text(snapshot.val().departureCity + " (" + snapshot.val().departureAirport + ")");
            $("#arrival-display").text(snapshot.val().arrivalCity + " (" + snapshot.val().arrivalAirport + ")");
            $("#date-display").text(departureDateFormatted);

        });
    };

    //Function to build the flight result table
    function BuildFlightResultTable() {

        table = $('#myTable').DataTable();

        table.destroy();

        table = $('#myTable').DataTable({
            data: flightResults,
            columns: [
                { data: 'Date' },
                { data: 'Flight#' },
                { data: 'Departure' },
                { data: 'TimeD' },
                { data: 'Arrival' },
                { data: 'TimeA' },
                { data: 'Status' },
                { data: 'Gate' }
            ]
        });
    }

    // Auto complete function
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