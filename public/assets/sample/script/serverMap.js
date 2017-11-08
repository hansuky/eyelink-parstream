$(function(){ // on dom ready
var elesJson = {
  nodes: [
    { data: { id: 'a1', name: 'USER' } },
    { data: { id: 'a2', name: 'USER' } },
    { data: { id: 'b1', name: 'FRONT-WEB' } },
    { data: { id: 'b2', name: 'BACKEND-WEB' } },
    { data: { id: 'b3', name: 'BACKEND-API' } },
    { data: { id: 'c1', name: 'MEMCACHED' } },
    { data: { id: 'c2', name: 'pinpoint' } },
    { data: { id: 'c3', name: 'MySQL' } },
    { data: { id: 'c4', name: 'ff31ddb85e9b4318c02e5e50a4315c27' } },
    { data: { id: 'c5', name: 'search.naver.com\t156\nsection.blog.naver.com\t136' }, classes: 'multiline-manual' },
  ], 

  edges: [
     { data: { id: 'a1b1', count : 1048, source: 'a1', target: 'b1' } },
     { data: { id: 'b1c1', count : 468, source: 'b1', target: 'c1' } },
     { data: { id: 'b1e1', count : 1063, source: 'b1', target: 'c5' } },
     { data: { id: 'b1b3', count : 71, source: 'b1', target: 'b3' } },
     { data: { id: 'b1b2', count : 76, source: 'b1', target: 'b2' } },
     { data: { id: 'a2b2' , count : 23, source: 'a2', target: 'b2' } },
     { data: { id: 'b3c2', count : 87, source: 'b3', target: 'c2' } },
     { data: { id: 'b3c3', count : 79, source: 'b3', target: 'c3' } },
     { data: { id: 'b2b3', count : 9, source: 'b2', target: 'b3' } },
     { data: { id: 'b2c3', count : 99, source: 'b2', target: 'c3' } },
     { data: { id: 'b2d1', count : 228, source: 'b2', target: 'c4' } },
  ]  
};

var cy = cytoscape({
  container: document.getElementById('cy'),
        
   style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'width': '100px',
        'height': '80px',
        'content': 'data(name)',
        'background-fit': 'cover',
         'border-color': '#000',
        'border-width': 1,
        'border-opacity': 0.5,
        'text-outline-width': 2,
        'text-outline-color': 'white',          
        'shape': 'rectangle',   
        'text-valign': 'bottom',   })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'width': 3,
        'line-color': '#B1C1F2',
        'target-arrow-color': '#B1C1F2',
        'target-arrow-shape': 'triangle',
        'text-outline-width': 5,
        'text-outline-color': 'white',
        'content': 'data(count)',
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
      .selector('#a1')
      .css({
        'background-image': '../assets/images/user1.png'

      })
      .selector('#a2')
      .css({
        'background-image': '../assets/images/user2.png'

      })
      .selector('#b1')
      .css({
        'background-image': '../assets/sample/tomcat.png'
      })
      .selector('.multiline-manual')
      .css({
        'text-wrap' : 'wrap'
      }),
      

  elements: elesJson,
  
  layout: {
    name: 'dagre',
    rankDir: 'LR',
    nodeSep: 100,
    edgeSep: 100,
    rankSep: 100,
  },

  ready: function(){
    window.cy = this;
    // giddy up
  }
}); 

cy.on('tap', 'node', function( e ){
  var nodes = e.target;
  var tapped = nodes;
  var food = [];
  
  nodes.addClass('eater');
  
  for(;;){
    var connectedEdges = nodes.connectedEdges(function(el){
      return !el.target().anySame( nodes );
    });
    
    var connectedNodes = connectedEdges.targets();
    
    Array.prototype.push.apply( food, connectedNodes );
    
    nodes = connectedNodes;
    
    if( nodes.empty() ){ break; }
  }
        
  var delay = 0;
  var duration = 500;
  for( var i = food.length - 1; i >= 0; i-- ){ (function(){
    var thisFood = food[i];
    var eater = thisFood.connectedEdges(function(el){
      return el.target().same(thisFood);
    }).source();
            
    thisFood.delay( delay, function(){
      eater.addClass('eating');
    } ).animate({
      position: eater.position(),
      css: {
        'width': 10,
        'height': 10,
        'border-width': 0,
        'opacity': 0
      }
    }, {
      duration: duration,
      complete: function(){
        thisFood.remove();
      }
    });
    
    delay += duration;
  })(); } // for
  
}); // on tap

var defaults = {
    container: document.getElementById('cynav')
  , viewLiveFramerate: 0 // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
  , thumbnailEventFramerate: 30 // max thumbnail's updates per second triggered by graph updates
  , thumbnailLiveFramerate: false // max thumbnail's updates per second. Set false to disable
  , dblClickDelay: 200 // milliseconds
  , removeCustomContainer: true // destroy the container specified by user on plugin destroy
  , rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
};
 var nav = cy.navigator ( defaults );
}); // on dom ready
