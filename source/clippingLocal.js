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
const plane_1 = new three.Plane( new three.Vector3( 1, 0, 0 ), 0 );
const plane_2 = new three.Plane( new three.Vector3( 0, 1, 0 ), 0 );

const helper_1 = new three.PlaneHelper( plane_1, 2, 0xff0000 );
const helper_2 = new three.PlaneHelper( plane_2, 2, 0x0000ff );

scene.add( helper_1, helper_2 );

/* 被裁者 */
const mesh_1 = new three.Mesh(
    new three.SphereGeometry( 0.5, 64, 64 ),
    new three.MeshNormalMaterial( {
        side: three.DoubleSide,
        clippingPlanes: [ plane_1, plane_2 ], // 裁剪面，对于所有使用该材质的对象，位于裁剪面背面的点将被切掉
        clipIntersection: true,               // true：如果一个点既位于plane_1的背面，也位于plane_2的背面，则该点会被切掉；false：如果该点位于plane_1的背面，或者位于plane_2的背面，则该点会被切掉
    } ),
);

scene.add( mesh_1 );

/* 不裁者 */
const mesh_2 = new three.Mesh(
    new three.TorusGeometry( 0.8, 0.1, 16, 64 ),
    new three.MeshNormalMaterial(),
);

scene.add( mesh_2 );

/* 激活裁剪 */
renderer.localClippingEnabled = true; // 激活裁剪

/* 移动相机 */
camera.position.set( 0, 0, 5 );

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
