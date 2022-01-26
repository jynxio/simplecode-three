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
/* 裁剪者 */
const plane = new three.Plane( new three.Vector3( 1, 0, 0 ), 0 );
const helper = new three.PlaneHelper( plane, 4, 0xff0000 );

scene.add( helper );

/* 被裁者 */
const mesh = new three.Mesh(
    new three.TorusKnotGeometry( 1, 0.2, 128, 32 ),
    new three.MeshNormalMaterial( { side: three.DoubleSide } ),
);

scene.add( mesh );

/* 激活裁剪 */
renderer.localClippingEnabled = true; // 激活裁剪
renderer.clippingPlanes = [ plane ];  // 裁剪面，在全局空间中，位于在裁剪面背面的点将被切掉

/* 移动相机 */
camera.position.set( 0, 0, 5 );

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
