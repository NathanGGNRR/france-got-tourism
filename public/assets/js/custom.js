
$(document).ready(function () {
  $('img[src$=".svg"]').each(function () {
    var $img = $(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function (data) {
      // Get the SVG tag, ignore the rest
      var $svg = jQuery(data).find('svg');

      // Add replaced image's ID to the new SVG
      if (typeof imgID !== 'undefined') {
        $svg = $svg.attr('id', imgID);
      }
      // Add replaced image's classes to the new SVG
      if (typeof imgClass !== 'undefined') {
        $svg = $svg.attr('class', imgClass + ' replaced-svg');
      }

      // Remove any invalid XML tags as per http://validator.w3.org
      $svg = $svg.removeAttr('xmlns:a');

      // Replace image with new SVG
      $img.replaceWith($svg);

    }, 'xml');
  });

  $('select').formSelect();


  $("#date-specificdate").removeClass("display-none");
  $("#autocomplete-input").prop("disabled", true);

  $('.datepicker').datepicker(
    {
      format: "dd/mm/yyyy"
    }
  );

  $(".first-date").change(function (element) {

    var explodeDate = $('.first-date')[0].value.split("/");
    $('.second-date').datepicker(
      { format: "dd/mm/yyyy", minDate: new Date(explodeDate[2], explodeDate[1] - 1, explodeDate[0]) }
    )

  })

  $(".second-date").change(function (element) {
    var explodeDate = $('.second-date')[0].value.split("/");
    $('.first-date').datepicker(
      { format: "dd/mm/yyyy", maxDate: new Date(explodeDate[2], explodeDate[1] - 1, explodeDate[0]) }
    )
  })


  $(".radio-filter").change(function () {
    if ($(this).data("name") == "specific") {
      $("#date-specificdate").removeClass("display-none");
      $("#date-interval").addClass("display-none");
    } else {
      $("#date-specificdate").addClass("display-none");
      $("#date-interval").removeClass("display-none");
    }
  })

  let data_autocomplete = {};

  if ($("#cityFilter").length != 0) {
    var cities = $("#cityFilter").val().split(",");
  }
  if ($("#departmentFilter").length != 0) {
    var departements = $("#departmentFilter").val().split(",");
  }
  if ($("#regionFilter").length != 0) {
    var regions = $("#regionFilter").val().split(",");
  }

  function fillDataAutocomplete(textChoosen) {
    data_autocomplete = {};

    $('input.autocomplete').val("")

    if (textChoosen == "City") {
      cities.forEach(function (element) {
        data_autocomplete[element] = null;
      })
    } else if (textChoosen == "Department") {
      departements.forEach(function (element) {
        data_autocomplete[element] = null;
      })
    } else {
      regions.forEach(function (element) {
        data_autocomplete[element] = null;
      })
    }

    $('input.autocomplete').autocomplete({
      data: data_autocomplete
    });
  }


  $('#select-autocomplete').change(function () {
    $("#autocomplete-input").prop("disabled", false);
    $('#autocomplete-label').text($(this).find(":selected").text() + " autocomplete:")
    fillDataAutocomplete($(this).find(":selected").text())
  })


  $('.single_type').click(function () {
    $(this).parent().submit()
    $("#wait-screen").css("display", "flex");
  })


  $('#range-distance').change(function () {
    $("#kilometre-label").text($('#range-distance').val())
  })

  $('#range-distance').val(100)
  $("#kilometre-label").text($('#range-distance').val())


  var arrayMarker = [];
  if ($("#mapid-activities").length != 0) {
    var mymap = L.map('mapid-activities').setView([46.227638, 2.213749], 5);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibWFydGluYmFsbWUiLCJhIjoiY2sycHc5aWt4MDgzdDNucWI3MjBkaGgybCJ9.V1cuFKfvJlY55p0oaonLEw'
    }).addTo(mymap);
  }

  function initPagination(sources) {
    if ($('#pagination-activities').length != 0) {
      var container = $('#pagination-activities');
      var options = {
        dataSource: sources,
        autoHidePrevious: true,
        pageSize: 20,
        pageRange: 1,
        autoHideNext: true,
        showGoInput: true,
        showGoButton: true,
        callback: function (response, pagination) {
          var dataHtml = '<ul class="collapsible expandable">';
          $.each(response, function (index, item) {
            var description;
            if (item.hasDescription.length != 0) {
              if (item.hasDescription[0].shortDescription.length != 0 && item.hasDescription[0].dc_description.length != 0) {
                description = item.hasDescription[0].dc_description[0].value;
              } else if (item.hasDescription[0].shortDescription.length != 0) {
                description = item.hasDescription[0].shortDescription[0].value;
              } else if (item.hasDescription[0].dc_description.length != 0) {
                description = item.hasDescription[0].dc_description[0].value;
              } else {
                description = "No description.";
              }
            } else {
              description = "No description.";
            }
            dataHtml += `
            <li>
              <div class="collapsible-header justify-content-between">
                <div class="title-collapsible col-10">`+ item.rdfs_label[0].value + `</div>
                <a class="button-collapsible" href="../activity/`+ item.dc_identifier[0] + `">
                    <i class="material-icons my-auto mx-auto">remove_red_eye</i>
                </a>
              </div>
              <div class="collapsible-body">
                <span>` + description + `
                </span>
              </div>
              <input type="hidden" value='`+ JSON.stringify(item.isLocatedAt[0].schema_geo[0]) + `' id="geomData"/>
              <input type="hidden" value="`+ item.rdfs_label[0].value + `" id="labelData"/>
            </li>`;
          });
          dataHtml += '</ul>';
          container.prev().html(dataHtml);
          $('.collapsible').collapsible();
          var arrayGeom = [];
          if (arrayMarker.length != 0) {
            arrayMarker.forEach(function (element) {
              mymap.removeLayer(element);
            })
          }
          $('.collapsible li').each(function () {
            var geom = JSON.parse($(this).children("#geomData").val());
            marker = L.marker([geom.schema_latitude[0], geom.schema_longitude[0]]).addTo(mymap);
            var popup = L.popup().setContent($(this).children("#labelData").val());
            marker.bindPopup(popup);
            arrayMarker.push(marker)
          })
        }
      };
      //$.pagination(container, options);
      container.addHook('beforeInit', function () {

      });
      container.pagination(options);
      container.addHook('beforePageOnClick', function () {
        //return false
      });
    }
  };

  var geoCity;
  function researchPoi() {

    if ($('#pagination-activities').length != 0) {
      var results = [];
      var resultLocation = []; // containt results for filter location (city/dep/reg)
      var city = 1;
      var department = 2;
      var region = 3;
      var specifiedDate = "Specific date";
      var intervalDate = "Interval";
      var sources = JSON.parse($("#dataInput").val());
      var geoType = $("#select-autocomplete").children("option:selected").val();
      var geoText = $("#autocomplete-input").val();
      var distanceMax = $("#range-distance").val();
      var dateType = $("input[name='group1']:checked").val();


      geoCity = null;
      if (geoType != "" && geoText != "") { // if location specified
        getLatLonCity(geoText);

        for (var poi in sources) {
          if (geoType == city) {
            //research by distance

            var geoPoi = { lat: sources[poi].isLocatedAt[0].schema_geo[0].schema_latitude, lng: sources[poi].isLocatedAt[0].schema_geo[0].schema_longitude };
            var distanceBetween = distance(geoCity.lat, geoCity.lng, geoPoi.lat, geoPoi.lng, 'K');
            //console.log(distanceBetween);
            if (distanceBetween <= distanceMax) {
              resultLocation.push(sources[poi]);
            }
          }
          else { // not city
            //research by name of department/region

            if (geoType == department) { // department{}
              if (sources[poi].isLocatedAt[0].schema_address[0].hasAddressCity[0].isPartOfDepartment[0].rdfs_label[0].value == geoText) resultLocation.push(sources[poi]);
              //console.log("type departement");
              //console.log(sources[poi].isLocatedAt[0].schema_address[0].hasAddressCity[0].isPartOfDepartment[0].rdfs_label[0].value);
            }
            else { //region
              //console.log("type region");
              if (sources[poi].isLocatedAt[0].schema_address[0].hasAddressCity[0].isPartOfDepartment[0].isPartOfRegion[0].rdfs_label[0].value == geoText) resultLocation.push(sources[poi]);
            }
          }

        }
      }


      if (dateType == specifiedDate) { // if one date and not empty
        if ($("#specifiedDate").val() != "") {
          console.log("there is one date");
          var [day, month, year] = $("#specifiedDate").val().split("/");
          var date = new Date(year, month, day);
          var dateDay = date.getDay();
          var dateDayName = getDayName(dateDay); // day name

          for (var poi in resultLocation) {
            if (typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== "undefined" && typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== null && resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification.length > 0){//&& typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[0] !== "undefined" &&  typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== null) { // if poi have opendates
              var availablesDay = [];
              //console.log(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification);
              for (var poiDayofWeek in resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek) {
                //console.log(poiDayofWeek.rdfs_label[0].value);
                if(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[poiDayofWeek] != null){
                  availablesDay.push(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[poiDayofWeek].rdfs_label[0].value);
                }
              }
              if (dateDayName in availablesDay) {
                results.push(resultLocation[poi]);
              }
            }

          }
        }
        else {
          results = resultLocation; // set results if date not needed 
        }

      }
      //interval
      else { // if just one open day is in interval (manage you planning)
        var dateStart = $("#firstIntervalDate").val();
        var dateEnd = $("#secondIntervalDate").val();
        if ($("#firstIntervalDate").val() != "" && $("#secondIntervalDate").val() != "") {
          console.log("there is two dates");
          console.log(dateStart + " ||| " + dateEnd);
          var [dayStart, monthStart, yearStart] = dateStart.split("/");
          var dateStart = new Date(yearStart, monthStart, dayStart);
          var dateDayStart = dateStart.getDay();
          var [dayEnd, monthEnd, yearEnd] = dateEnd.split("/");
          var dateEnd = new Date(yearEnd, monthEnd, dayEnd);
          var dateDayEnd = dateEnd.getDay();

          var dateDaysAll = dateDayStart > dateDayEnd ? dateDayStart < dateDayEnd ? range(dateDayStart, dateDayEnd) : range(dateDayEnd, dateDayStart) : range(0, 6)// days int

          for (var poi in resultLocation) {
            if (typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== "undefined" && typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== null && resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification.length > 0){//&& typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[0] !== "undefined" &&  typeof resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification !== null) { // if poi have opendates
              var availablesDay = [];
              //console.log(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification);
              for (var poiDayofWeek in resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek) { // get all days availables on the poi
                //console.log(poiDayofWeek.rdfs_label[0].value);
                if(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[poiDayofWeek] != null){
                  availablesDay.push(resultLocation[poi].isLocatedAt[0].schema_openingHoursSpecification[0].schema_dayOfWeek[poiDayofWeek].rdfs_label[0].value);
                }
              }
              var haveOne = false;
              for (var index = 0; index < dateDaysAll.length; index++) { // check if there is one day same
                if (dateDaysAll[index] in availablesDay) {
                  haveOne = true;
                  break;
                }
              }
              if (haveOne) {
                results.push(resultLocation[poi]);
              }
            }
          }
        }
        else {
          results = resultLocation; // set results if date not needed 
        }
      }
      initPagination(results);
    }
  }

  function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
      ans.push(i);
    }
    return ans;
  }


  function getDayName(dateDay) {
    var weekdays = new Array(7);
    weekdays[0] = "Dimanche";
    weekdays[1] = "Lundi";
    weekdays[2] = "Mardi";
    weekdays[3] = "Mercredi";
    weekdays[4] = "Jeudi";
    weekdays[5] = "Vendredi";
    weekdays[6] = "Samedi";
    return weekdays[dateDay];
  }

  function distance(lat1, lon1, lat2, lon2, unit) { // comming from google
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      return dist;
    }
  }

  function getLatLonCity(citiName) {
    $.ajax({
      url: "https://api.opencagedata.com/geocode/v1/json?q=" + citiName + ", France&key=2a15a72296fe42cba26d2b80fe95e748", // api
      dataType: 'json',
      type: "GET",
      async: false,
      success: function (json) {
        //Process data retrieved
        geoCity = json.results[0].geometry; // set lat and long in object
      }
    });
  }

  if($("#dataInput").length != 0){
    initPagination(JSON.parse($("#dataInput").val()));
  }  
  $("#btnSearchActivities").click(researchPoi);


  $(".delete").click(function () {
    $(this).parent().submit();
   });
   $(".update").click(function () {
     $(this).parent().submit();
   });

   $("#submitPageU").click(function () {
    $("#formImageU").submit();
    //$("#formUpdate").submit();
   })

   $("#submitPage").click(function () {
    $("#formImage").submit();
    $("#formInsert").submit();
  })

  $("#txtImageU").change(function(){
    $("#imgPathHidden").val($(this).val())
  })

  $("#txtImage").change(function(){
    $("#imgPathHidden").val($(this).val())
  })


   if ($("#inpSelect").length != 0) {   
     var typesPage = $("#inpSelect").val().split(",");
     $("#selTypesU > option").each(function (index, elem) {
       typesPage.forEach(function(type) {
         if ($(elem).val() == type) {
          $(elem).prop("selected", true);
          
         };
       })

     })
   }
   
  $("#back-button").click(function(){
    parent.history.back();
    return false;
  })

  $("#home-button").click(function(){
    window.location.href = "/"
    return false;
  })

  $("#logout-button").click(function(){
    window.location.href = "/administration/logout"
    return false;
  })

  $("#icon-footer").click(function(){
    window.location.href = "/administration/connexion"
    return false;
  })

  
});