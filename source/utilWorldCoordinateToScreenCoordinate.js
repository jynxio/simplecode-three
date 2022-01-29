import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer( { antialias: window.devicePixelRatio < 2 } );

const renderer_width = 500;
const renderer_height = 500;
const renderer_offset_x = 100;
const renderer_offset_y = 100;

renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
renderer.setSize( renderer_width, renderer_height );
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = renderer_offset_y + "px";
renderer.domElement.style.left = renderer_offset_x + "px";
renderer.domElement.style.outline = "5px solid red";

document.body.append(renderer.domElement);

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.PerspectiveCamera( 45, renderer_width / renderer_height, 0.01, 100 );

scene.add(camera);

/* Controls */
const controls = new OrbitControls( camera, renderer.domElement );

controls.enableDamping = true;
controls.target = new three.Vector3( 0, 0, - 0.01 );

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
    renderer.setSize( renderer_width, renderer_height );

    camera.aspect = renderer_width / renderer_height;
    camera.updateProjectionMatrix();

} );

/* ------------------------------------------------------------------------------------------------------ */
/**
 * 投影函数：将three的3d坐标投影成屏幕的2d坐标。
 * @param   {Object}        options            - 配置。
 * @param   {Array<number>} options.coordinate - 3d坐标。
 * @param   {Object}        options.camera     - Camera实例。
 * @param   {number}        options.width      - canvas的宽。
 * @param   {number}        options.height     - canvas的高。
 * @param   {number}        options.offset_x   - canvas的左边界相对于视口左边界偏移了多少像素。
 * @param   {number}        options.offset_y   - canvas的上边界相对于视口上边界偏移了多少像素。
 * @returns {Array<number>}                    - 2d坐标。
 */
function projectWorldCoordinateToScreenCoordinate( {
    coordinate,
    camera,
    width,
    height,
    offset_x,
    offset_y,
} ) {

    /* NOTICE：该函数的实现是假设了屏幕坐标都是一个个离散的整数值，比如对于1980*1080的屏幕，x坐标则是0、1、
    ...、1979，y坐标则是0、1、1079。如果将来屏幕坐标变成连续值，则需要更新函数的实现。 */

    const vector3 = new three.Vector3( ...coordinate ).project( camera );

    const x_1 = vector3.x; // 值∈[-1, 1]，是基于标准化设备坐标系的坐标，它以canvas的中心为原点，X轴正方向是→。
    const y_1 = vector3.y; // 值∈[-1, 1]，是基于标准化设备坐标系的坐标，它以canvas的中心为原点，Y轴正方向是↑。

    const x_2 = + ( x_1 + 1 ) / 2; // 值∈[0, 1]，它基于画布坐标系，它以画布左上角为原点，X轴上方向是→。
    const y_2 = - ( y_1 - 1 ) / 2; // 值∈[0, 1]，它基于画布坐标系，它以画布左上角为原点，Y轴正方向是↓。

    const x_3 = Math.round( x_2 * ( width  - 1 ) ); // 值∈[0, width -1]，它基于画布坐标系。
    const y_3 = Math.round( y_2 * ( height - 1 ) ); // 值∈[0, height-1]，它基于画布坐标系。

    const x_4 = x_3 + offset_x; // 2d坐标。
    const y_4 = y_3 + offset_y; // 2d坐标。

    return [ x_4, y_4 ];

}

/* Mesh */
const mesh = new three.Mesh(
    new three.SphereGeometry(0.5, 64, 64),
    new three.MeshNormalMaterial(),
);

scene.add( mesh );

/* 跟踪mesh的几何中心 */
document.body.style.backgroundColor = "rgb(255, 255, 255)";

const canvas = document.createElement( "canvas" );

canvas.width = window.innerWidth;
canvas.height= window.innerHeight;

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.backgroundColor = "rgba(255, 0, 0, 0.35)";

document.body.append( canvas );

function drawTrackedPoint() {

    const ctx = canvas.getContext( "2d" );

    const coordinate_2d = projectWorldCoordinateToScreenCoordinate( {
        coordinate: mesh.position.toArray(),
        camera: camera,
        width: renderer_width,
        height: renderer_height,
        offset_x: renderer_offset_x,
        offset_y: renderer_offset_y,
    } );

    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.fillRect( coordinate_2d[0] - 1, coordinate_2d[1] - 1, 5, 5 );

}

window.addEventListener( "resize", _ => {

    canvas.width = window.innerWidth;
    canvas.height= window.innerHeight;

} );

/* 移动相机 */
camera.position.z = 4;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
const clock = new three.Clock();

renderer.setAnimationLoop( function loop() {

    controls.update();

    mesh.position.y = Math.sin( clock.getElapsedTime() );

    drawTrackedPoint();

    renderer.render( scene, camera );

} );
