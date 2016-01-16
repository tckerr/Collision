Description
---
Collision is a Javascript library that provides basic 2D rectangular [OBB](https://en.wikipedia.org/wiki/Bounding_volume) collision detection and resolution. To see an example in action, check out this [asteroid generator](http://www.tckerr.com/cdr/) (turn off "immune" in the options.)


Instructions
---

Download and include the library:

```
<script src="lib/collision.min.js"></script>
```

You will then be able to access the library through the ```Collision``` object. First, set up your objects with axis-aligned bounding boxes, like so:

```
var A = {
    UL: {x: 10, y: 10},
    UR: {x: 59, y: 10},
    LR: {x: 59, y: 59},
    LL: {x: 10, y: 59}
}
var B = {
    UL: {x: 110, y: 80 },
    UR: {x: 159, y: 80 },
    LR: {x: 159, y: 159},
    LL: {x: 110, y: 159}
}
```

To test for collision, simply run ```Collision.test(A,B);```, where A is the object who is in motion. The resulting object will have the following properties:

- ```did_collide```: A boolean representing collision or not.
- ```entity```: The object that A is in collision with (in this case, B)
- ```projection```: The resolution vector for object A. This is an object like ```{x: 5, y: -10}``` such that adding those values to each of A's coordinates will resolve collision. Note: if there is no collision, this property will always be ```{x: 0, y: 0}```

Examples
---

*Here are two objects not in collision:*

![no collision](http://i.imgur.com/LZAdSdv.jpg)

Here is their object representations:

```
var A = {
    UL: {x: 10, y: 10},
    UR: {x: 59, y: 10},
    LR: {x: 59, y: 59},
    LL: {x: 10, y: 59}
}
var B = {
    UL: {x: 110, y: 80 },
    UR: {x: 159, y: 80 },
    LR: {x: 159, y: 159},
    LL: {x: 110, y: 159}
}
```

Running test return false:

```
Collision.test(A,B); //did_collide will return false
```

*Here we have two objects in collision:*

![collision](http://i.imgur.com/ZjWejzw.jpg)

Here is their object representations:

```
var A = {
    UL: {x: 30, y: 20},
    UR: {x: 59, y: 20},
    LR: {x: 30, y: 89},
    LL: {x: 59, y: 89}
}
var B = {
    UL: {x: 40, y: 70},
    UR: {x: 99, y: 70 },
    LR: {x: 99, y: 99},
    LL: {x: 40, y: 99}
}
```

Let's check for collision, then add the result to A:

```
var result = Collision.test(A,B); //did_collide will return true, so add the projection
A = {
    UL: {x: 30+result.projection.x, y: 20+result.projection.y},
    UR: {x: 59+result.projection.x, y: 20+result.projection.y},
    LR: {x: 30+result.projection.x, y: 89+result.projection.y},
    LL: {x: 59+result.projection.x, y: 89+result.projection.y}
}
var result = Collision.test(A,B); //did_collide will return false
```

Here is the result of adding the projection -- no collision:

![resolved](http://i.imgur.com/SZZAaBq.jpg)

This is a simple example using axis-aligned boxes. See the example in the description for an implementation that uses oriented bounding boxes. 