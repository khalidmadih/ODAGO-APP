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
    var arrivalCity;
    var departureDate;
    var departureTime;

    //Looking up the city weather
    $("#search-flight").on("click", function(event) {
        event.preventDefault();
        departureCity = $("#departure-input").val().trim();
        arrivalCity = $("#arrival-input").val().trim();
        departureDate = $("#date-input").val().trim();
        departureTime = $("#time-input").val().trim();

        console.log(departureCity, arrivalCity, departureDate, departureTime);

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            arrivalCity + "&appid=7e0ce28483067588677241827b3bba6f";

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            // After data comes back from the request
            .done(function(response) {
                console.log(queryURL);
                console.log(response);
                var tempConvertedF = Math.round(((response.main.temp - 273.15) * 1.8) + 32);
                var tempConvertedC = Math.round(response.main.temp-273.15);
                console.log("C= " + tempConvertedC);
                var apiIcon = "http://openweathermap.org/img/w/"+response.weather[0].icon+".png";
                console.log("this is icon :" +apiIcon);
                
                $("#destination-city").text(response.name);
                $("#date-display").text(response.departureDate);
                $("#description-display").text(response.weather[0].description);
                console.log(response.weather[0].description);
                $("#destination-temp").text(tempConvertedF + "°F" + " / "+ tempConvertedC + "°C");
                $("#weather-icon").attr("src", apiIcon);

            });

    });



});