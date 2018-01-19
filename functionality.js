
// array holding auto complete tags.
var availableTags = [
    "A La Turka",
    "Abode Hotel",
    "Active Life Limited",
    "Age UK"
];

hygieneScript = "https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/hygiene.php";
ratingScript = "https://www.cs.kent.ac.uk/people/staff/lb514/hygiene/rating.php";

// Calling the method getTable() on load.
getTable(hygieneScript, {op : "retrieve", page : 1}, "");


// Retrieving the first page of results when the page loads and populating it
// as a table.
function getTable(url, params, specialCase) {
    $.ajax({
        type: "GET",
        url: url,
        data: params,
        dataType: "json",
        cache: false,
        success: function (data) {
            var ratings = $('#ratings');
            $("#ratings tr:not(:first-child)").remove();
            var trHTML = '';

            // A for each loop running through and printing all the results as a table.
            $.each(data, function (i, item) {
                trHTML += '<tr><td>' + item.business + '</td><td>'
                    + item.address + '</td><td>' + item.rating + '</td><td>'
                    + item.date + '</td><td><button onclick=\'getRating("' + item.business + '", "' + item.postcode + '")\' style="width: 100%">Get Rating</button></td></tr>';
            });

            ratings.append(trHTML);
            if(specialCase === "specialCase") {
                $.each(data, function (i, item) {
                    if($.inArray(item, availableTags) === -1) availableTags.push(item.business);
                    $( "#tags" ).autocomplete("option", { source: availableTags });
                });

            }
        },

        // alert message.
        error: function (msg) {
            alert(msg.responseText);
        }
    });
}

// Creating a basic paginator that displays buttons corresponding to the amount of
// pages that can be populated by the script.
function generatePagination(){
    $.get(hygieneScript,
        {op : 'pages'},
        function(result) {
            var tmpbtn = $("#navButtons");
            tmpbtn.contents().remove();
            for(var i = 1; i <= result.pages; i++) {
                var btnDisplay = $('<button class="buttons" type="btn" name='+i+'>' + i + '</button>');
                tmpbtn.append(btnDisplay);
            }
        }, "json");
}
generatePagination();

// Adding functionality to the individual buttons so they perform an AJAX request
// and return and print the corresponding table.
$("#navButtons").delegate('button', 'click', function() {
    var id = $(this).attr("name");
    getTable(hygieneScript, {op : "retrieve", page : id}, "");
});

// Gets the rating for the desired businesses.
function getRating(business, postcode) {
    $.ajax({
        type: "GET",
        url: ratingScript,
        data: {name: business},
        dataType: "json",
        cache: false,
        success: function (data) {
            var foundBusiness;
            $.each(data, function(i, val) {
                if (val.address.indexOf(postcode) !== -1) {
                    foundBusiness = val;
                }
            });

            // If a business does not have a rating, an error message
            // as an alert pops up.
            if (typeof(foundBusiness) !== 'undefined') {
                alert(foundBusiness.rating);
            } else {
                alert("Rating for the business was not found.")
            }
        }
    });
}

// Search functionality. Searches for the desired business
// that contains the search string.
$("#searchTable input:nth-child(2)").click(function(event) {
    var text = $( "#searchTable input:first" ).val();
    if(text) {
        getTable(hygieneScript,{op: 'searchname', name: text}, "specialCase");
        console.log("t")
        $("#navButtons button").slice(1).remove();
    }
    else {
        getTable(hygieneScript, {op : "retrieve", page : 1}, "");
        generatePagination();
    }
    event.preventDefault();
});

// auto complete method for the business names.
$("#tags").autocomplete({
    source: availableTags
});

// Gives functionality to the back button.
// Displays the defualt first page of results.
$('#back').click(function() {
    getTable(hygieneScript, {op : "retrieve", page : 1}, "");
    generatePagination();
});
