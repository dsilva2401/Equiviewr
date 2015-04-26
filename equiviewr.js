var EquiViewr = function(config) {
	/*
		Params:
			config.container
			config.imgSrc
			config.limits
				minY
				maxY
	*/

	// Variables
		const DEG2RAD = Math.PI/180.0;
		var camera, scene, renderer, containerDims, imageSource,
		onPointerDownPointerX, onPointerDownPointerY,
		minY, maxY, container, mainContainer, equiContainer,
		mesh,
		targetContainer, targetContainerWidth, targetSubContainer,
		loaderImg,
		onPointerDownLon, onPointerDownLat;

		var fov = 70,
		texture_placeholder,
		isUserInteracting = false,
		lon = 0, onMouseDownLon = 0,
		lat = 0, onMouseDownLat = 0,
		phi = 0, theta = 0,
		self = this,
		eventRegisteredActions = {};
		minY = ( (config.limits&&config.limits.minY) || -90 );
		maxY = ( (config.limits&&config.limits.maxY) || 90 );
		imageSource = ( config.imgSrc || '' );
		mainContainer = config.container;
		containerDims = {
			width : mainContainer.clientWidth,
			height : mainContainer.clientHeight
		};

	// Methods

		var basicSetup = function() {

			// EquiContainer
				equiContainer = document.createElement('div');
				equiContainer.style['position'] = 'absolute';
				equiContainer.style['left'] = '0px'
				equiContainer.style['top'] = '0px';
				equiContainer.style['width'] = '100%';
				equiContainer.style['height'] = '100%';

			// Target container
				targetContainerWidth = Math.round(containerDims.width*0.8);
				targetContainer = document.createElement('div');
				targetContainer.style['position'] = 'absolute';
				targetContainer.style['left'] = Math.round(containerDims.width/2-targetContainerWidth/2)+'px';
				targetContainer.style['bottom'] = Math.round(targetContainerWidth/-2)+'px';
				targetContainer.style['width'] = targetContainerWidth+'px';
				targetContainer.style['height'] = targetContainerWidth+'px';
				targetContainer.style['-moz-transform'] = 'perspective( 900px ) rotateX( 70deg )';
				targetContainer.style['-webkit-transform'] = 'perspective( 900px ) rotateX( 70deg )';
				targetContainer.style['transform'] = 'perspective( 900px ) rotateX( 70deg )';

			// Target subcontainer
				targetSubContainer = document.createElement('div');
				targetSubContainer.style['position'] = 'absolute';
				targetSubContainer.style['left'] = '0px'
				targetSubContainer.style['top'] = '0px';
				targetSubContainer.style['width'] = '100%';
				targetSubContainer.style['height'] = '100%';
				targetSubContainer.style['-webkit-border-radius'] = '100%';
				targetSubContainer.style['-moz-border-radius'] = '100%';
				targetSubContainer.style['border-radius'] = '100%';
			
				self.on('move', updateTargetContainerRotation);
				mainContainer.addEventListener( 'mousedown', onContainerMouseDown, false );
				mainContainer.addEventListener( 'mousemove', onContainerMouseMove, false );
				mainContainer.addEventListener( 'mouseup', onContainerMouseUp, false );
				window.requestAnimFrame = (function(){
					return  window.requestAnimationFrame 		||
							window.webkitRequestAnimationFrame 	||
							window.mozRequestAnimationFrame 	||
							function( callback ){
								window.setTimeout(callback, 1000 / 60);
							};
				})();

				targetContainer.appendChild(targetSubContainer);
				mainContainer.appendChild(equiContainer);
				mainContainer.appendChild(targetContainer)
		}

		var setEquiviewImage = function(imgSrc) {
			camera = new THREE.PerspectiveCamera( fov, containerDims.width / containerDims.height, 1, 1100 );
			camera.target = new THREE.Vector3( 0, 0, 0 );
			scene = new THREE.Scene();
			mesh = new THREE.Mesh( 
				new THREE.SphereGeometry( 500, 60, 40 ),
				new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture( imgSrc ) 
				}) 
			);
			mesh.scale.x = -1;
			scene.add( mesh );
			renderer = new THREE.WebGLRenderer();
			renderer.setSize( containerDims.width, containerDims.height );
			equiContainer.innerHTML = '';
			equiContainer.appendChild( renderer.domElement );
		}

		var updateTargetContainerRotation = function(data) {
			targetContainer.style['-moz-transform'] = 'perspective( 900px ) rotateX( '+( 70+data.y*0.4 )+'deg )';
			targetContainer.style['-webkit-transform'] = 'perspective( 900px ) rotateX( '+( 70+data.y*0.4 )+'deg )';
			targetContainer.style['transform'] = 'perspective( 900px ) rotateX( '+( 70+data.y*0.4 )+'deg )';
			targetSubContainer.style['-moz-transform'] = 'rotateZ( '+ -data.x +'deg )';
			targetSubContainer.style['-webkit-transform'] = 'rotateZ( '+ -data.x +'deg )';
			targetSubContainer.style['transform'] = 'rotateZ( '+ -data.x +'deg )';
		}

		var onContainerMouseDown = function(event) {
			event.preventDefault();
			isUserInteracting = true;
			onPointerDownPointerX = event.clientX;
			onPointerDownPointerY = event.clientY;
			onPointerDownLon = lon;
			onPointerDownLat = lat;
		}

		var onContainerMouseMove = function(event) {
			if ( isUserInteracting ) {
				lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
				lon = ( lon + 360 )%360;
				lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
				lat = Math.min( maxY, Math.max( lat, minY) );
				// Trigger move event
				triggerEvent('move', function(action) {
					action({
						x: lon,
						y: lat
					});
				});
			}
		}

		var onContainerMouseUp = function(event) {
			isUserInteracting = false;
		}

		var animate = function() {
			requestAnimationFrame( animate );
			render();
		}

		var triggerEvent = function(evName, execAction) {
			if(!eventRegisteredActions[evName] || !eventRegisteredActions[evName].length) return;
			eventRegisteredActions[evName].forEach(function(action) {
				execAction(action);
			})
		}

		var render = function() {
			lat = Math.max( - 85, Math.min( 85, lat ) );
			phi = THREE.Math.degToRad( 90 - lat );
			theta = THREE.Math.degToRad( lon );
			camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
			camera.target.y = 500 * Math.cos( phi );
			camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
			camera.lookAt( camera.target );
			renderer.render( scene, camera );
		}

		self.on = function(evName, callback) {
			if(!eventRegisteredActions[evName]){
				eventRegisteredActions[evName] = [];
			}
			eventRegisteredActions[evName].push(callback);
		}

		self.moveSoftTo = function(coords, onEnd) {
			coords.x = ( (typeof coords.x!='undefined') ? coords.x : lon );
			coords.y = ( (typeof coords.y!='undefined') ? coords.y : lat );
			var nSteps = 35;
			var distanceX = coords.x-lon;
			var distanceY = coords.y-lat;
			if(!distanceX && !distanceY){
				onEnd();
				return;
			}
			var stepX = distanceX/nSteps;
			var stepY = distanceY/nSteps;
			var interval = setInterval(function() {				
				lon += stepX;
				lat += stepY;
				triggerEvent('move', function(action) {
					action({
						x: lon,
						y: lat
					});
				});
				nSteps--;
				if(!nSteps){
					clearInterval( interval );
					if(onEnd) {
						onEnd();
					}
				}
			},20);
		}

		self.moveTo = function(params) {
			if (!params) return;
			if (params.x) lon = params.x;
			if (params.y) lat = params.y;
			render();
			triggerEvent('move', function(action) {
				action({
					x: lon,
					y: lat
				});
			});

		}

		self.zoomIn = function(onEnd) {
			var frames = 25;
			var step = 1.4;
			var framesPerSecond = 40;
			var zoomInterval = setInterval(function() {
				fov -= step;
				camera.projectionMatrix.makePerspective( fov, containerDims.width / containerDims.height, 1, 1100 );
				render();
				frames--;
				if(!frames) {
					clearInterval( zoomInterval );
					if(onEnd) onEnd();
				}
			}, 1000/framesPerSecond );
		}

		self.zoomOut = function(onEnd) {
			var frames = 25;
			var step = 1.4;
			var framesPerSecond = 40;
			var zoomInterval = setInterval(function() {
				fov += step;
				camera.projectionMatrix.makePerspective( fov, containerDims.width / containerDims.height, 1, 1100 );
				render();
				frames--;
				if(!frames) {
					clearInterval( zoomInterval );
					if(onEnd) onEnd();
				}
			},1000/framesPerSecond);
		}

		self.resetZoom = function() {
			fov = 70;
			camera.projectionMatrix.makePerspective( fov, containerDims.width / containerDims.height, 1, 1100 );
			render();
		}

		self.updateImage = function(imgSrc) {
			setEquiviewImage(imgSrc);
			if(!imageSource) {
				animate();
			}
			imageSource = imgSrc;
			targetSubContainer.innerHTML = '';
		}

		self.addTarget = function(directionX, config) {
			if(!imageSource) {
				console.warn('Can\'t add targets without an image source');
				return;
			}
			directionX -= 90;
			var arrow = document.createElement('img');
			arrow.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAOw4AADsOAFxK8o4AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAeZQTFRF////AQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACAQACLzUaVQAAAKF0Uk5TAAECAwQICgwPEBESExQVFhgZGhscISMkJicpKistLzEyMzQ1Njc4OTo7PD0+QUJERkdITFRWWltdXl9hYmVnaGlqa2xtcHFyc3R1eHl6e4CEhYaHiY2SmZqbnp+goqWmp6mqq6ytrq+xsrO0tba3uLm9wMHCw8TFxsfJysvNztDR0tPU2N7f4OHi4+Tn6Onq6+zt7vDx8vP09/j5+vv8/f6z5o/8AAAI30lEQVR42u2da0MT1xaG30TMAaRWqmAUL0gFsQK2iDcqLRhQYqFHsKWmoYglwRa0RryhxabGgqCCRc5JxISE9U/PB+QUJJDb7Jm19+b5AbN8XpmdmX2ZBZiMvaS+0dXR3eP1BUZDE7PR6OxEaDTg8/Z0d7ga60vs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';
			var arrowWidth = 80;
			var xPos = Math.round(targetContainerWidth/2 - arrowWidth/2);
			var yPos = Math.round(targetContainerWidth/2 - arrowWidth/2);
			xPos += Math.round( (targetContainerWidth/2)*Math.cos(directionX*DEG2RAD) );
			yPos += Math.round( (targetContainerWidth/2)*Math.sin(directionX*DEG2RAD) );
			arrow.title = ( config.title || '' );
			arrow.style['position'] = 'absolute';
			arrow.style['left'] = xPos + 'px';
			arrow.style['top'] =  yPos + 'px';
			arrow.style['width'] = arrowWidth+'px';
			arrow.style['height'] = arrowWidth+'px';
			arrow.style['-webkit-border-radius'] = '100%';
			arrow.style['-moz-border-radius'] = '100%';
			arrow.style['border-radius'] = '100%';
			arrow.style['-moz-transform'] = 'rotateZ( '+ (directionX+180) +'deg )';
			arrow.style['-webkit-transform'] = 'rotateZ( '+ (directionX+180) +'deg )';
			arrow.style['transform'] = 'rotateZ( '+ (directionX+180) +'deg )';
			arrow.style['box-shadow'] = '0px 0px 30px #555';
			arrow.style['cursor'] = 'pointer';
			arrow.style['background'] = '#aaa';
			arrow.onclick = function(e) {
				e.preventDefault();
				self.moveSoftTo({
					x: directionX+90,
					y: 0
				}, config.action );
			}
			targetSubContainer.appendChild(arrow);
		}


	// Construct
		basicSetup();
		if(imageSource) {
			setEquiviewImage(imageSource);
			animate();
		}

}