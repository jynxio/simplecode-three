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
/* 创建Points实例 */
const g = new three.BufferGeometry();
const m = new three.PointsMaterial( { size: 10, sizeAttenuation: false } );
const p = new three.Points( g, m );

scene.add( p );

/* 设置position属性 */
const position_array = new Float32Array( [
    - 1, 0, - 3, // x, y, z
      0, 0, - 3, // x, y, z
      1, 0, - 3, // x, y, z
] );
const position_attribute = new three.BufferAttribute( position_array, 3 );

g.setAttribute( "position", position_attribute );

/* 设置顶点着色 */
const color_array = new Float32Array( [
    0xff, 0x00, 0xff, // r, g, b
    0x00, 0xff, 0xff, // r, g, b
    0xff, 0xff, 0x00, // r, g, b
] );
const color_attribute = new three.BufferAttribute( color_array, 3 );

g.setAttribute( "color", color_attribute );
m.vertexColors = true; // 激活顶点着色

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
