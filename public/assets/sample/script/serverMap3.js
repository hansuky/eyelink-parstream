$(function(){ // on dom ready
var elesJson = {
  nodes: [
    { data: { id: 'a', name: 'user', foo: 0, bar: 0, baz: 10 }, position: {x: 000, y:100}  },
    { data: { id: 'b', name: 'app', foo: 1, bar: 10, baz: 0 }, position: {x: 100, y:100}  }
  ], 

  edges: [
     { data: { id: 'ua', name : 15, weight: 10, source: 'a', target: 'b' }},
     { data: { id: 'aa', name : 1, weight: 10, source: 'b', target: 'b' } },
  ]  
};

var cy = cytoscape({
  container: document.getElementById('cy'),
        
   style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'width': '60px',
        'height': '50px',
        'content': 'data(name)',
        'background-fit': 'cover',
         'border-color': '#000',
        'border-width': 1,
        'border-opacity': 0.5,
        'text-outline-width': 2,
        'text-outline-color': 'white',        
        'shape': 'rectangle',      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'width': 3,
        'line-color': '#B1C1F2',
        'target-arrow-color': '#B1C1F2',
        'target-arrow-shape': 'triangle',
        'text-outline-width': 3,
        'text-outline-color': 'white',
        'content': 'data(name)',
        'opacity': 0.8
      })
    .selector(':selected')
      .css({
        'background-color': 'black',
        'line-color': 'blue',
         'border-width': 3,
        'border-color': 'blue',
        'target-arrow-color': 'blue',
        'source-arrow-color': 'black',
        'opacity': 1
      })
      .selector('#a')
      .css({
        'background-image': '../assets/images/user1.png'

      })
      .selector('#b')
      .css({
        'background-image': '../assets/sample/tomcat.png'
      }),
      

  elements: elesJson,
  
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
      }
  },

  ready: function(){
    window.cy = this;
    
    // giddy up
  }
}); 
 
}); // on dom ready