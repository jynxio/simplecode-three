import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer( { antialias: window.devicePixelRatio < 2 } );

renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.append(renderer.domElement);

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 100 );

scene.add(camera);

/* Controls */
const controls = new OrbitControls( camera, renderer.domElement );

controls.enableDamping = true;
controls.target = new three.Vector3( 0, 0, - 0.01 );

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

} );

/* ------------------------------------------------------------------------------------------------------ */
/* 被命中物 */
const mesh = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshNormalMaterial(),
);

scene.add(mesh);

/* 光线投射 */
const origin = new three.Vector3( 0, 0, 3 );
const direction = new three.Vector3( 0, 0, -1 ).normalize();
const raycaster = new three.Raycaster( origin, direction );
const intersect = raycaster.intersectObject( mesh, false ); // 因为光线命中了2个三角形面片的交界处，所以会返回2个命中结果。

console.log( intersect );

/* 移动相机 */
camera.position.z = 3;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
