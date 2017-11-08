$(function(){
  var colors = {
            'login': '#61DBF0',
            'home':              '#f5662b',            
            'dgallery':             '#97ba4c',
            'igallery':              '#367d85',
            'admin':         '#FAED7D',            
            'test':             '#AB6CFF',
            'dapp': '#DB0000',
            'iapp':            '#FF5E00',
            'dsearch' :'#FFBB00',
            'isearch' : '#1D8B15',
            'launcher' : '#1F50B5',
            'dashboard' : '#050099',
            'timelinea' : '#D941C5',
            'timelineg' : '#D9418C',
            'changepw' : '#8041D9',
            'edit' : '#FFD9EC'
          };
      d3.json("/assets/sample/data/sankey3.json", function(error, json) {
        console.log(json);
        var chart = d3.select("#chart").append("svg").chart("Sankey.Path");
        chart
          .name(label)
          .colorNodes(function(name, node) {
            return color(node, 1) || colors.fallback;
          })
          .colorLinks(function(link) {
            return color(link.source, 4) || color(link.target, 1) || colors.fallback;
          })
          .nodeWidth(15)
          .nodePadding(10)
          .spread(true)
          .iterations(0)
          .draw(json);
        function label(node) {
          return node.name.replace(/\s*\(.*?\)$/, '');
        }
        function color(node, depth) {
          var id = node.id.replace(/(_score)?(_\d+)?$/, '');
          if (colors[id]) {
            return colors[id];
          } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
            return color(node.targetLinks[0].source, depth-1);
          } else {
            return null;
          }
        }
      });
    });