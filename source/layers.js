import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import GUI from "lil-gui";

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
 * Layers：
 * 每个继承自Object3D的对象都具有layers属性，layers属性的值是Layers对象实例。
 *
 * layers属性用于控制Object3D实例的可见性, 因为layers属性可以设定Object3D对象位于哪一个渲染图层，只
 * 有当Object3D实例与Camera实例都处于同一个渲染图层时，Object3D实例才能被Camera实例观察到（即可见）。
 *
 * Layers实例拥有32个可选的图层，这32个图层被标记为0~31号。通过执行THREE.Layers的set(Int)方法可以设
 * 定Layers实例所处的图层编号。Object3D实例被创建时都会被分配至0号图层。
 *
 * Layers实例的mask属性记录了当前实例所处的图层编号，Layers的set方法正是mask属性的setter。set方法的
 * 入参是0、1、...、31, mask的值是2^0、2^1、...、2^31
 *
 * Layers实例可以同时位于多个图层。
 */
const mesh_r = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshBasicMaterial( { color: 0xff0000 } ),
);
const mesh_b = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshBasicMaterial( { color: 0x0000ff } ),
);

mesh_r.position.x = - 1.5;
mesh_b.position.x = + 1.5;

mesh_r.layers.set( 0 );
mesh_b.layers.set( 0 );

scene.add( mesh_r, mesh_b );

/* 通过控制layers属性来控制显隐 */
const options = {
    displayMeshR: true,
    displayMeshB: true,
};

const gui = new GUI();

gui.add( options, "displayMeshR" ).name( "显示红色模型" ).onChange( v => mesh_r.layers.set( v ? 0 : 1 ) );
gui.add( options, "displayMeshB" ).name( "显示蓝色模型" ).onChange( v => mesh_b.layers.set( v ? 0 : 1 ) );

/* 移动相机 */
camera.position.z =  3;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
