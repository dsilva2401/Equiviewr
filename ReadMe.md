Equiviewr.js
============

A Three.js based equirectangular viewer

## Api reference

#####`.on( event, callback )`
Triggers callback on event

#####`.moveSoftTo( coords, onEnd )`
Moves to coords ( x, y ) softly and execute `onEnd` function on end

#####`.moveTo( coords )`
Move view to x, y position set in `coords` parameter

#####`.zoomIn( onEnd )`
Zoom in softly and trigger `onEnd` function on end

#####`.zoomOut( onEnd )`
Zoom out softly and trigger `onEnd` function on end

#####`.resetZoom()`
Reset zoom value

#####`.updateImage( imageSrc )`
Update viewer image

#####`.addTarget( dirX, config )`
Add an arrow on the `dirX` degree.
```js
config: {
  title: 'Target title',
  action: function() {
    .. execute on target click ..
  }
}
```

