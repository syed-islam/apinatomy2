			//levels (from 0 to 23)
			var startLevel = 0;
			var endLevel = 8;	
			//layers (from 0 to 3)
			var startLayer = 0; 
			var endLayer = 3;	
			//number of displayed branches
			var numParticles = 2048;
            //branching limit (angle = 60)
            var branchingLimit = Math.PI / 3;
            //split plane
            var planeMaterial = new THREE.MeshBasicMaterial({color: 0xCCCCCC,
                opacity: 0.1, side: THREE.DoubleSide} );
            var planeGeometry = new THREE.PlaneGeometry(100, 100, 4, 4);

            //////////////////////////////////////////////////////
			
			//number of branches in a full tree	
			var numParticlesFull = Math.pow(2, endLevel - startLevel);
			//how often split the branches
			var branchingFactor = Math.min(numParticles/numParticlesFull, 1);
			numParticles = Math.min(numParticles, numParticlesFull);
			//tree branch colours			
			var treeColors = [[0xCC0000,0xFF0000],
				[0x336600,0x33CC00],
				[0xC0C0C0,0xE0E0E0],
				[0x0000FF,0x0066FF]];
			//tree branch materials	
			var branchMaterials = [];

			for (var layer = startLayer; layer <= endLayer; layer++){
				for (var i = 0; i < 2; i++){
					var branchMaterial = new THREE.MeshLambertMaterial(
						{color: treeColors[layer][i], transparent: true, 
						/*wireframe: true, */
						opacity: 0.5 + 0.1 * layer, side: THREE.DoubleSide});
					branchMaterials.push(branchMaterial);
				}
			}
			//get material per level branch
			function getBranchMaterial(level, layer){
				return branchMaterials[(layer - startLayer) * 2 + (level % 2)];
			}

			var levelDiameters = [
				1.8, 1.22, 0.83, 0.56, 0.45, 0.35, 0.28, 0.23, 
				0.186, 0.154, 0.13, 0.109, 0.095, 0.082, 0.074, 0.066,
				0.060, 0.054, 0.05, 0.047, 0.045, 0.043, 0.041, 0.041];
			var diamScale = 10; 			
			
			//Bracnh radius depends on the tree level and layer
			function getStartRadius(level, layer){
				if (level >= levelDiameters.size) level = levelDiameters.size - 1; 
				var radius = levelDiameters[level] * diamScale;
				return Math.max(radius * (1 - 0.2 * layer /(endLayer - startLayer + 1)), 1);
			}
			
			function getEndRadius(level, layer){
				if (level >= levelDiameters.size - 1) level = levelDiameters.size - 2; 
				var radius = levelDiameters[level + 1] * diamScale;
				return Math.max(radius * (1 - 0.2 * layer /(endLayer - startLayer + 1)), 1);
			}
			
			//proportion of the edge length from lobar to the center of mass
			//TODO: reproduce lengths from the table
			function getScale(level){
				return 0.4;
			}

			//Main: generate lungs
			function generateLungs(){
                var radius = 100, height = 300;
                var left = new THREE.Vector3(-radius, 0, 0);
				var right = new THREE.Vector3(radius, 0, 0);
				var lobarBronchus = new THREE.Vector3(0, -height / 2, 0);
				
				if (objects.length == 0){
					drawTile(0, -height / 2, 0, radius);
					var initDirection = new THREE.ArrowHelper(new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 50 );
					initDirection.position = lobarBronchus;
					scene.add(initDirection); 
				}

				for (var i = 0; i < objects.length; i++)
					scene.remove(objects[i]);
				objects = [];
				
				drawLung(lobarBronchus, left, radius, height);
				drawLung(lobarBronchus, right, radius, height);
			}
			
			//Create a base tile
			function drawTile(x, y, z, radius){
				var planeGeometry = new THREE.PlaneGeometry(radius * 2, radius * 2, 4, 4);
				var planeMaterial = new THREE.MeshBasicMaterial({color: 0xCC0000, 
					opacity: 0.3, side: THREE.DoubleSide} );
				var plane = new THREE.Mesh(planeGeometry, planeMaterial);
				plane.position.set(x, y, z);				
				var v = new THREE.Vector3(x, y + 1, z);
				plane.lookAt(v);
				scene.add(plane);
			}

			function drawLung(lobarBronchus, center, radius, height){
                var geometry = new THREE.CylinderGeometry(radius, radius, height, 40, 5);
                var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true,
                    transparent: true, opacity: 0.1, side: THREE.DoubleSide } );

                var object = new THREE.Mesh( geometry, material);
				object.position = center;
				//scene.add(object); //display cylinders

				var coordinates = generateCoordinates(numParticles, radius, height, center.x, center.y, center.z + height / 2);
				//displayParticles(coordinates);
				drawEdge(lobarBronchus, coordinates, startLevel, null);
			}
			//Generate one tree edge
			function drawEdge(lobarBronchus, coords, level, prevAV){
				if (level > endLevel) return;
				var av = computeCenterOfMass(coords);
				var lb = createBranch(lobarBronchus, av, level, prevAV);
				//displayPoint(lb, 0xff0000);
				
				if (Math.random() < branchingFactor){	
					var plane = createSplitPlane(lobarBronchus, av);
					var newCoords = splitCoordinates(lobarBronchus, plane, coords);
					if ((newCoords[0].length <=1) || (newCoords[1].length <=1)) return;
					drawEdge(lb, newCoords[0], level + 1, av);
					drawEdge(lb, newCoords[1], level + 1, av);
				} else {
					drawEdge(lb, coords, level + 1, av);
				}
			}
			
			//Divide a set of points by a plane
			function splitCoordinates(lobarBronchus, plane, coordinates){
				var leftPoints = [];
				var rightPoints = [];
				var v1 = plane.rotation.clone().sub(plane.position);
				var v2 = lobarBronchus.clone().sub(plane.position);
				var normal = v1.cross(v2);				

				for (var i=0; i < coordinates.length; i +=1){
					var point = coordinates[i];
					var d = point.clone().sub(plane.position);
					var dist = normal.dot(d);
					if (dist > 0) leftPoints.push(point);
					else rightPoints.push(point);					
				}
				return [leftPoints, rightPoints];
			}

			//Create a splitting plane
			function createSplitPlane(lobarBronchus, av){
				var plane = new THREE.Mesh(planeGeometry, planeMaterial);
				plane.position.set(av.x, av.y, av.z);				
				var v = plane.position.clone();
				v.add(lobarBronchus);
				var matrix = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(1, 0, 0), Math.PI / 2);
				v.applyMatrix4(matrix);
				plane.lookAt(v);
				return plane;
			}

			//Draw one tree branch
			function createBranch(point1, point2, level, prevAV) {
				var direction = new THREE.Vector3().subVectors(point2, point1);				
				if (prevAV != null){
					var prevD = new THREE.Vector3().subVectors(prevAV, point1);
					var angle = prevD.angleTo(direction);
					if (angle > Math.PI / 2) angle = Math.PI - angle;						
					if (angle > branchingLimit){
						var normal = prevD.cross(direction).normalize();
						var matrix = new THREE.Matrix4().makeRotationAxis(
							normal, branchingLimit - angle);
						direction.applyMatrix4(matrix);
					}
				}
				var arrow = new THREE.ArrowHelper(direction.clone().normalize(), point1);
			    var rotation = new THREE.Vector3().setEulerFromQuaternion(arrow.quaternion);
				
			    var scale = getScale(level);
				var edgeLength =  scale * direction.length();
				var position = new THREE.Vector3().addVectors(point1, 
					direction.clone().multiplyScalar(scale * 0.5));
				//create required layers
				for (var layer = startLayer; layer <= endLayer; layer++){
				//for (var layer = endLayer; layer >= startLayer; layer--){
					var radius1 = getStartRadius(level, layer);
					var radius2 = getEndRadius(level, layer);
					var material = getBranchMaterial(level, layer);
					var edgeGeometry = new THREE.CylinderGeometry(
						radius2, radius1, edgeLength, 12, 4, true);					
					var edge = new THREE.Mesh(edgeGeometry, material);
					edge.rotation = rotation;
					edge.position = position;
					edge.layer = layer;
					edge.level = level;
					scene.add(edge);
					objects.push(edge);
				}				
				var newLB = new THREE.Vector3().addVectors(point1, 
					direction.clone().multiplyScalar(scale));
				return newLB;
            }
						
			//Generate random mesh points
			function generateCoordinates(count, R, H, offsetX, offsetY, offsetZ){
				var coordinates = new Array(count);
				for (var i = 0; i < coordinates.length; i++) {
					var r = Math.random() * R;
					var theta = Math.random() * 2 * Math.PI;
					var point = new THREE.Vector3(
						Math.cos(theta) * r + offsetX,
						Math.random() * H - offsetZ,
						Math.sin(theta) * r - offsetY);
					coordinates[i] = point;
				}
				return coordinates;
			}
			
			//Average coordinates for a given set of points
			function computeCenterOfMass(positions){
				var count = positions.length;
				var avX = 0, avY = 0, avZ = 0;
				for (var i = 0; i < count; i++){
					avX = avX + positions[i].x;
					avY = avY + positions[i].y;
					avZ = avZ + positions[i].z;	
				}
				avX = avX / count;
				avY = avY / count; 
				avZ = avZ / count;
				var av = new THREE.Vector3(avX, avY, avZ);
				//displayPoint(av, 0xff0000);
				return av;
			}

			///////////////////////////////////////
			//TESTING
			///////////////////////////////////////
			//For testing: draw a point as a sphere
			function displayPoint(av, pColor){
				var geometry = new THREE.SphereGeometry(3, 3, 3);
				var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: pColor, opacity: 0.5} ) );
				object.position.set(av.x, av.y, av.z);
				scene.add(object);
			}
			
			//For testing: visualize mesh points 
			function displayParticles(coordinates){
				var count = coordinates.length;
				var geometry = new THREE.BufferGeometry();
				geometry.attributes = {
					position: {
						itemSize: 3,
						array: new Float32Array( count * 3 ),
						numItems: count * 3
					},
					color: {
						itemSize: 3,
						array: new Float32Array(count * 3 ),
						numItems: count * 3
					}
				}				
				var positions = geometry.attributes.position.array;
				var colors = geometry.attributes.color.array;
				var color = new THREE.Color();
				//TODO: replace random mesh with generated
				for (var i = 0; i < coordinates.length; i += 1) {
					// positions
					positions[ 3*i ]     = coordinates[i].x;
					positions[ 3*i + 1 ] = coordinates[i].y;
					positions[ 3*i + 2 ] = coordinates[i].z;
					// colors
					color.setRGB(Math.random(), Math.random(), Math.random());
					colors[ 3*i ]     = color.r;
					colors[ 3*i + 1 ] = color.g;
					colors[ 3*i + 2 ] = color.b;
				}
                var material = new THREE.ParticleBasicMaterial( { size: 2, vertexColors: true } );
				var particleSystem = new THREE.ParticleSystem( geometry, material);
				scene.add(particleSystem);
				return particleSystem;
			}

