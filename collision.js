(function(window){
    'use strict';
    function define_collision(){
        var Collision;
        Collision = {            
            util: {
                reduced: (Math.PI / 180.0),
                projectOnAxis: function(in_point, in_axis){
                    var point = JSON.parse(JSON.stringify(in_point));    
                    var axis = JSON.parse(JSON.stringify(in_axis));   
                    var pn = (point.x * axis.x + point.y * axis.y)/(axis.x * axis.x + axis.y * axis.y);
                    axis.x = pn * axis.x;
                    axis.y = pn * axis.y;
                    return axis;
                },
                dotProduct: function(A, B) {
                    return (A.x*B.x + A.y*B.y);
                },
                distanceV: function(A, B){
                    return Math.sqrt( Math.pow( (B.x - A.x), 2) + Math.pow( (B.y - A.y ), 2) );
                },
                normalize: function(in_A){
                    var A = JSON.parse(JSON.stringify(in_A));
                    var length = Math.sqrt(A.x*A.x + A.y*A.y);
                    if (length != 0) {
                        A.x /= length;
                        A.y /= length;
                    }
                    return A;
                },
                rotatePoint: function(point, origin, degrees) {
                    var angle = degrees * reduced;
                    return {
                        x: Math.cos(angle) * (point.x-origin.x) - Math.sin(angle) * (point.y-origin.y) + origin.x,
                        y: Math.sin(angle) * (point.x-origin.x) + Math.cos(angle) * (point.y-origin.y) + origin.y
                    };
                },
                getAABB: function(obb){
                    var max_x = obb.UL.x;
                    var min_x = obb.UL.x;
                    var max_y = obb.UL.y;
                    var min_y = obb.UL.y;                    
                    for ( var point in obb ){
                        if (obb[point].x > max_x)
                            max_x = obb[point].x;
                        else if ( obb[point].x < min_x )
                            min_x = obb[point].x;
                        if (obb[point].y > max_y)
                            max_y = obb[point].y;
                        else if ( obb[point].y < min_y )
                            min_y = obb[point].y;
                    }                    
                    max_x = parseInt(max_x);
                    max_y = parseInt(max_y);
                    min_x = parseInt(min_x);
                    min_y = parseInt(min_y);                    
                    return {
                        UL: {x: min_x, y: min_y },
                        UR: {x: max_x, y: min_y },
                        LR: {x: max_x, y: max_y },
                        LL: {x: min_x, y: max_y }
                    }
                },
                getCenter: function( obb ){
                    var origin_x = origin_y = 0;                    
                    if ( obb.UL.x < obb.LR.x ){
                        origin_x = obb.UL.x + .5 * ( obb.LR.x - obb.UL.x );
                    } else {
                        origin_x = obb.LR.x + .5 * ( obb.UL.x - obb.LR.x );
                    }                    
                    if ( obb.UL.y < obb.LR.y ){
                        origin_y = obb.UL.y + .5 * ( obb.LR.y - obb.UL.y );
                    } else {
                        origin_y = obb.LR.y + .5 * ( obb.UL.y - obb.LR.y );
                    }
                    return {
                        x: origin_x,
                        y: origin_y
                    }
                },
                getMidpoint: function( a, b ){
                    var origin_x = origin_y = 0;                    
                    if ( a.x < b.x ){
                        origin_x = a.x + .5 * ( b.x - a.x );
                    } else {
                        origin_x = b.x + .5 * ( a.x - b.x );
                    }                    
                    if ( a.y < b.y ){
                        origin_y = a.y + .5 * ( b.y - a.y );
                    } else {
                        origin_y = b.y + .5 * ( a.y - b.y );
                    }
                    return {
                        x: origin_x,
                        y: origin_y
                    }
                },
                keyOfLargestInObj: function( obj ){
                    var largest;
                    for ( key in obj ){
                        if ( typeof ( largest ) === 'undefined' ){
                            var largest = key;
                        }
                        else if ( obj[key] > obj[largest] ){
                            largest = key;
                        }
                    }
                    return largest;
                },
                pointDistanceAlongLine: function( start, end, distance ){    
                    var slope = (end.y - start.y)/(end.x - start.x);
                    var finalPoint = {};                    
                    if ( end.x > start.x ){
                        finalPoint.x = Math.floor( start.x - distance/Math.sqrt( 1 + ( slope * slope ) ) );
                        finalPoint.y = Math.floor( ( (finalPoint.x - start.x) * slope ) + start.y );
                    } else if ( end.x < start.x ){
                        finalPoint.x = Math.floor( start.x + distance/Math.sqrt( 1 + ( slope * slope ) ) );
                        finalPoint.y = Math.floor( ( (finalPoint.x - start.x) * slope ) + start.y );
                    } else {
                        finalPoint.x = Math.floor( start.x );
                        if ( start.y > end.y )
                            finalPoint.y = Math.floor( start.y + distance );
                        else { 
                            finalPoint.y = Math.floor( start.y - distance );
                        }
                    }                       
                    return finalPoint;  
                },
                getNormal: function( vector ){
                    var xholder = vector.x;
                    vector.x = vector.y * -1;
                    vector.y = xholder;
                    return vector;
                },
                intersectOnAxis: function(A, B, inAxis){
                    var aUL = Collision.util.projectOnAxis(A.UL, inAxis);
                    var aUR = Collision.util.projectOnAxis(A.UR, inAxis);
                    var aLR = Collision.util.projectOnAxis(A.LR, inAxis);
                    var aLL = Collision.util.projectOnAxis(A.LL, inAxis);
                    var bUL = Collision.util.projectOnAxis(B.UL, inAxis);
                    var bUR = Collision.util.projectOnAxis(B.UR, inAxis);
                    var bLR = Collision.util.projectOnAxis(B.LR, inAxis);
                    var bLL = Collision.util.projectOnAxis(B.LL, inAxis);
                    //find dot products
                    var minAid = {x: 0, y: 0};
                    var maxAid = {x: 0, y: 0};
                    var minBid = {x: 0, y: 0};
                    var maxBid = {x: 0, y: 0};
                    var aULDot = Collision.util.dotProduct(aUL, inAxis);
                    var minA = aULDot;
                    var maxA = aULDot;
                    minAid = aUL;
                    maxAid = aUL;
                    var aURDot = Collision.util.dotProduct(aUR, inAxis);
                    if (minA > aURDot){
                        minA = aURDot;
                        minAid = aUR;
                    } else if (maxA < aURDot) {
                        maxA = aURDot;
                        maxAid = aUR;
                    }
                    var aLRDot = Collision.util.dotProduct(aLR, inAxis);
                    if (minA > aLRDot){
                        minA = aLRDot;
                        minAid = aLR;
                    } else if (maxA < aLRDot) {
                        maxA = aLRDot;
                        maxAid = aLR;
                    }
                    var aLLDot = Collision.util.dotProduct(aLL, inAxis);
                    if (minA > aLLDot){
                        minA = aLLDot;
                        minAid = aLL;
                    } else if (maxA < aLLDot) {
                        maxA = aLLDot;
                        maxAid = aLL;
                    }
                    var bULDot = Collision.util.dotProduct(bUL, inAxis);
                    var minB = bULDot;
                    var maxB = bULDot;
                    minBid = bUL;
                    maxBid = bUL;
                    var bURDot = Collision.util.dotProduct(bUR, inAxis);
                    if (minB > bURDot){
                        minB = bURDot;
                        minBid = bUR;
                    } else if (maxB < aURDot) {
                        maxB = bURDot;
                        maxBid = bUR;
                    }
                    var bLRDot = Collision.util.dotProduct(bLR, inAxis);
                    if (minB > bLRDot){
                        minB = bLRDot;
                        minBid = bLR;
                    } else if (maxB < bLRDot) {
                        maxB = bLRDot;
                        maxBid = bLR;
                    }
                    var bLLDot = Collision.util.dotProduct(bLL, inAxis);
                    if (minB > bLLDot){
                        minB = bLLDot;
                        minBid = bLL;
                    } else if (maxB < bLLDot) {
                        maxB = bLLDot;
                        maxBid = bLL;
                    }
                    var result = {
                        axis: inAxis
                    }                    
                    if ( maxA >= maxB && minA <= maxB ){
                        result.intersect = true;
                        result.depth = Collision.util.distanceV(maxBid, minAid);
                    }
                    else if ( maxB >= maxA && minB <= maxA ) {
                        result.intersect = true;
                        result.depth = Collision.util.distanceV(maxAid, minBid);
                        result.axis.x *= -1;
                        result.axis.y *= -1;
                    }
                    else {
                        result.intersect = false;
                    }                    
                    return result;
                }
            },
            test: function(A, B){
                var data = {};
                var axisAX = { 
                    x: (A.UR.x - A.UL.x),
                    y: (A.UR.y - A.UL.y)
                }
                var axisAY = { 
                    x: (A.LR.x - A.UR.x),
                    y: (A.LR.y - A.UR.y)
                }
                var axisBX = { 
                    x: (B.UR.x - B.UL.x),
                    y: (B.UR.y - B.UL.y)
                }
                var axisBY = { 
                    x: (B.UR.x - B.LR.x),
                    y: (B.UR.y - B.LR.y)
                }
                var min = {};
                var axisAXp = Collision.util.intersectOnAxis(A, B, axisAX);
                if (axisAXp.intersect) {
                    min = axisAXp;
                    var axisAYp = Collision.util.intersectOnAxis(A, B, axisAY);
                    if (axisAYp.intersect) {
                        if (min.depth >= axisAYp.depth) {
                            min = axisAYp;
                        }
                        var axisBXp = Collision.util.intersectOnAxis(A, B, axisBX);
                        if (axisBXp.intersect) {
                            if (min.depth >= axisBXp.depth) {
                                min = axisBXp;
                            }
                            var axisBYp = Collision.util.intersectOnAxis(A, B, axisBY);
                            if (axisBYp.intersect) {
                                if (min.depth >= axisBYp.depth) {
                                    min = axisBYp;
                                }
                                min.axis = Collision.util.normalize(min.axis);
                                data.projection = { 
                                    x: Math.round( min.axis.x * min.depth ),
                                    y: Math.round( min.axis.y * min.depth )
                                }
                                if (Math.abs(data.projection.x) == 0 && Math.abs(data.projection.y) == 0){
                                    data.did_collide = false;
                                } else {
                                    data.did_collide = true;
                                    data.entity = B;
                                }
                                return data;
                            }
                        }
                    }
                }
                data.projection = {
                    x: 0,
                    y: 0
                }
                data.did_collide = false;
                return data;
            }
        }
        return Collision;
    };
    if (typeof(Collision) === 'undefined'){
        window.Collision = define_collision();
    } else {
        console.log("Error defining Collision: already defined.")
    }
})(window);