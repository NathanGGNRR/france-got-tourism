const express = require('express');
const fetch = require('node-fetch');
var router = express.Router();
var fgt = require('../public/assets/js/modules/fgt') // Call our modules

/**
 * -- Doing --
 * Display home page view.
 */
router.get('/', async function(req, res, next) {
  var dataString = JSON.stringify({
    query: `
    {
      poi ( 
        size: 3,
        from: `+ Math.floor(Math.random() * Math.floor(677)) +`,
        filters: [{isLocatedAt: {schema_address:{hasAddressCity:{rdfs_label:{_text:"Paris"}}}}}]
      )
      { 
      results {
        _uri,
        dc_identifier,
        rdfs_label {
          value
        },
        takesPlaceAt{
          startDate,
          endDate
        },
        isLocatedAt {
          schema_address {
            schema_streetAddress,
            schema_postalCode,
            schema_addressLocality
          },
          schema_openingHoursSpecification{
            schema_opens,
            schema_closes,
            schema_dayOfWeek{
              rdfs_label{
                value
              }
            }
          },
          schema_geo{
            schema_latitude schema_longitude
          }
        },
        hasNeighborhood{
          rdfs_label{value}
        },
        hasTheme {
          rdfs_label{value}
        },
        hasReview {
          hasReviewValue {
            rdfs_label{value}
          }
        },
        hasContact{
          schema_email, 
          schema_telephone,
          schema_faxNumber,
          schema_legalName
        },
        hasBeenCreatedBy{
          schema_email, 
          schema_telephone,
          schema_faxNumber,
          schema_legalName
        },
        isEquippedWith{
          rdfs_label{
            value
          }
        },
        hasFeature{
          features{
            rdfs_label{
              value
            }
          },
          internetAccess,
          petsAllowed,
          charged
        },
        hasMainRepresentation{
          ebucore_hasRelatedResource{
            ebucore_locator
          }
        },
        rdf_type,
        hasDescription {
          shortDescription {
            value,
            lang
          },
          dc_description {
            lang,
            value
          }
        },
        reducedMobilityAccess,
        offers{
          schema_priceSpecification{
            schema_priceCurrency,
            schema_price,
            schema_maxPrice,
            hasEligiblePolicy{
              rdfs_label{value}
            },
            hasPricingMode{
              rdfs_label{value}
            },
          },
          schema_acceptedPaymentMethod{
            rdfs_label{value}
          }
         }
      }
    }
  }`
  });


  fetch('http://vps.cours-diiage.com:8080', { //HTTP Request, ask API of VPS with the query in the body.
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: dataString
  })
    .then(r => r.json())  //Wait the result of the API and stringify under JSON format the result
    .then(async function(data){ //Wait the JSON format and display activity view with all information of the poi
      return { data: data.data.poi.results};
    }).then(data => {
      res.render('layout/index', data) //Wait the JSON format and display index view with three poi and all city, depattment and region
    })
});

module.exports = router; //Must export router module.
