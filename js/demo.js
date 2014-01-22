requirejs.config({
    "baseUrl": "js/dist/amd/",
    "paths": {
      "jquery": "../../jquery-2.0.3.min",
      "ractive": "../../Ractive",
      "Colors": "../../colors",
      "util": "../../util",
      "pie": 'pie'
    },      
    "shim": {
        "ractive": {
            exports: 'Ractive'
        }
    }
});
require([
  'jquery',
  'ractive',
  'pie',
  "Colors",
  "util"
], function($, Ractive, Pie, Colors, util) {
  "use strict";

  function loadCountries(dataset) {
      $.ajax({url: dataset, 
              headers: {'Content-Type': 'application/json'}, 
              processData: false})
          .done( function ( data ) {
            data = JSON.parse(data);
            ractive.animate({
              "countries": data,
              'expanded': util.initArray(0, data.length)
            });
          })
          .fail(function (err) { console.log("ERROR LOADING JSON", err);});
  }

  var palette = Colors.mix({r: 130, g: 140, b: 210}, {r: 180, g: 205, b: 150});

  var ractive = new Ractive({
        el: 'pie',
        template: '#myTemplate',
        data: {
            Pie: Pie,
            center: [0, 0],
            r: 60,
            R: 140,
            countries: [],
            expanded: [],
            datasets: [{label: "Mixed", filename: "json/countries.json"}, {label: "Europe", filename: "json/europe.json"}, {label: "Asia", filename: "json/asia.json"}],
            accessor: function (x) {
                        return x.population;
                      },
            colors: util.palette_to_function(palette),
            move: function (point, expanded) {
              var factor = expanded || 0;

              return (factor * point[0] / 3) + "," + (factor * point[1] / 3);
            },
            point: function (point) {
              return point[0] + "," + point[1];
            },
            lighten: function (color) {
              return Colors.string(Colors.lighten(color));
            },
            color_string: Colors.string
        }
      });

      ractive.on({expand:   function (event) {
                              var index = event.index.num,
                                  target = util.initArray(0, ractive.get('expanded').length);
                              target[index] = 1;
                              ractive.animate('expanded', target, {easing: 'easeOut'});
                            },
                  loadData: function (event) {
                              var options = event.node.options;
                              loadCountries(options[options.selectedIndex].value);
                            }
                });
      loadCountries(ractive.get('datasets')[0].filename);

});