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
 * 执行TextureLoader实例的load方法后，该方法会创建并返回一个texture并开启一个资源请求，「创建并返回texture」过程是阻塞式的，
 * 「资源请求」过程则是异步的，「资源请求」完成后就会更新texture的内容，使用一个网络加载速度缓慢的资源可以清晰的看见这个异步过程。
 */

/* Texture */
const loader = new three.TextureLoader();
const texture = loader.load( "https://images.unsplash.com/photo-1626009859529-6ee6584cfa26?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=755&q=80" );

const mesh = new three.Mesh(
    new three.PlaneGeometry(),
    new three.MeshBasicMaterial( { map: texture } ),
);

scene.add( mesh );

/* 移动相机 */
camera.position.z = 1;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
