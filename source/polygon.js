import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { triangulate } from "./library/earcut.js";

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
/* 创建Mesh实例 */
const g = new three.BufferGeometry();
const m = new three.MeshBasicMaterial();
const p = new three.Mesh( g, m );

scene.add( p );

/* 设置position属性 */
const position_array = new Float32Array( [
    - 1,   1, - 3, // 左上角
      1,   1, - 3, // 右上角
      1, - 1, - 3, // 右下角
    - 1, - 1, - 3, // 左下角
] );
const position_attribute = new three.BufferAttribute( position_array, 3 );

g.setAttribute( "position", position_attribute );

/* 设置index属性 */
const index_array = new Uint16Array(
    triangulate( position_array, 3 ) // [1, 0, 3, 3, 2, 1]
);
const index_attribute = new three.BufferAttribute( index_array, 1 );

g.setIndex( index_attribute );
g.index.needsUpdate = true;

/* 更新包围盒属性 */
g.computeBoundingSphere(); // 更新包围盒属性，避免被「视锥体剔除」误杀
g.computeBoundingBox();    // 更新包围盒属性，避免被「视锥体剔除」误杀

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
