Equiviewr.js
============

A Three.js based equirectangular viewer

## Api reference
```js
var equiviewr = new EquiViewr({
  // Container of the equiviewer (should be in absolute position)
    container: document.getElementById('container'),
  // (optional) Default equiviewer photo
    imgSrc: 'photo.jpg',
  // (optional) Equiviewer display limits
    limits: {
      minY: -30,
      maxY: 80
    }
});
```


#####`.on( event, callback )`
Triggers `callback()` on event

#####`.moveSoftTo( coords, onEnd )`
Moves to coords ( x, y ) softly and execute `onEnd()` function on end

#####`.moveTo( coords )`
Move view to x, y position set in `coords` parameter

#####`.zoomIn( onEnd )`
Zoom in softly and trigger `onEnd()` function on end

#####`.zoomOut( onEnd )`
Zoom out softly and trigger `onEnd()` function on end

#####`.resetZoom()`
Reset zoom value

#####`.updateImage( imageSrc )`
Update viewer image

#####`.addTarget( dirX, config )`
Append an arrow on the `dirX` degree, config attributes:
```js
{
  title: 'Target title',
  action: function() {
    .. execute on target click ..
  }
}
```
