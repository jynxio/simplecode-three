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
/**
 * 前置知识：
 * 屏幕设备坐标系的原点是左上角，X轴正方向是水平向右，Y轴正方向是垂直向下。对于1k屏，clientX∈[0, 1919]，clientY∈[0, 1079]。
 * 标准化设备坐标系的原点是屏幕的几何中心，X轴正方向是水平向右，Y轴正方向是垂直向上，x∈[-1, 1]，y∈[-1, 1]。
 */

/* 面 */
const m = new three.Mesh(
    new three.PlaneGeometry( 4, 4 ),
    new three.MeshBasicMaterial(),
);

scene.add( m );

/* 点 */
const p = new three.Points(
    new three.BufferGeometry(),
    new three.PointsMaterial( { sizeAttenuation: false, size: 10, color: 0xff0000 } ),
);

scene.add( p );

/* 光线投射 */
const raycaster = new three.Raycaster();

window.addEventListener( "mousemove", e => {

    const cursor = new three.Vector2();

    /* 将光标的屏幕坐标换算为标准化坐标 */
    cursor.set(
          ( e.clientX / ( window.innerWidth  - 1 ) ) * 2 - 1, // 若clientX是离散的整数值，则使用该方法；若clientX是连续值，则使用( e.clientX / window.innerWidth  ) * 2 - 1
        - ( e.clientY / ( window.innerHeight - 1 ) ) * 2 + 1, // 若clientY是离散的整数值，则使用该方法；若clientY是连续值，则使用- ( e.clientY / window.innerHeight ) * 2 + 1
    );                                                        // 原因详见issues：https://github.com/mrdoob/three.js/issues/23115

    /* 投射 */
    cast( cursor );

} );

function cast( cursor ) {

    /* 投射 */
    raycaster.setFromCamera( cursor, camera );

    const intersect = raycaster.intersectObject( m, false );

    /* 绘制投射结果 */
    if ( !intersect.length ) return;

    const position_array = new Float32Array( intersect[ 0 ].point.toArray() );
    const position_attribute = new three.BufferAttribute( position_array, 3 );

    p.geometry.setAttribute( "position", position_attribute );

}

/* 移动相机 */
camera.position.z = 3;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
