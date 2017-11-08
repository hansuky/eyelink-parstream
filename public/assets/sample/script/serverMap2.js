document.addEventListener('DOMContentLoaded', function(){

        var cy = window.cy = cytoscape({
          container: document.getElementById('cy'),

          layout: {
            name: 'grid',
            cols: 4,
            sort: function( a, b ){
              if( a.id() < b.id() ){
                return -1;
              } else if( a.id() > b.id() ){
                return 1;
              } else {
                return 0;
              }
            },
            padding: 10,
            randomize: true
          },

          style: [
            {
              selector: 'node',
              style: {
                'height': 40,
                'width': 40,
                'background-color': 'gray',
                'label': 'data(name)',
                'text-valign': 'top',
                'text-halign': 'center',
                'pie-size': '80%',
                'pie-1-background-color': '#E8747C',
                'pie-1-background-size': 'mapData(foo, 0, 10, 0, 100)',
                'pie-2-background-color': '#74E883',
                'pie-2-background-size': 'mapData(bar, 0, 10, 0, 100)',
                'pie-3-background-color': 'white',
                'pie-3-background-size': 'mapData(baz, 0, 10, 0, 100)'
              }
            },

            {
              selector: 'edge',
              style: {
                'curve-style': 'bezier',
                'width': 3,
                'opacity': 0.666,
                'line-color': '#888',
                'label': 'data(cnt)',
                'text-valign': 'top',
                'text-halign': 'center',
                'text-outline-width': 4,
                'text-outline-color': 'white',
                'target-arrow-color': 'blue',
                'target-arrow-shape': 'triangle',                
              }
            },
            {
              selector: ':selected',
              style: {
                'background-color': 'purple',
                'line-color': 'blue',
                'target-arrow-color': 'blue',
                'source-arrow-color': 'purple',
                'opacity': 1,
                'text-outline-width': 2,
                'text-outline-color': 'yellow'
              }
            },
            {
              selector: 'edge.bezier',
              style: {
                'curve-style': 'bezier',
                'control-point-step-size': 40
              }
            },
          ],

          elements: [
            { data: { id:'a', name: 'user', foo: 0, bar: 0, baz: 10 } },
            { data: { id:'b', name: 'app' , foo: 1, bar: 10, baz:  0} },
            { data: { id:'c', name: 'page' , foo: 0, bar: 10, baz:  0} },
            { data: { id:'d', name: 'page' , foo: 4, bar: 10, baz:  0} },
            { data: { id: 'e01', weight: 1,cnt: '35', source: 'a', target: 'b' } },           
            { data: { id: 'e02', weight: 2,cnt : '1', source: 'b', target: 'b' } },           
            { data: { id: 'e03', weight: 3,cnt : '1', source: 'b', target: 'c' } },           
            { data: { id: 'e04', weight: 4,cnt : '4', source: 'b', target: 'd' } },           
          ]
        });
        cy.navigator ({

        });
      });