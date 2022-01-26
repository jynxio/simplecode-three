import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
/* 模型 */
const loader = new GLTFLoader();

loader.load( "/static/model/gltf/fox.glb", gltf => {

    const model = gltf.scene;

    model.scale.set( 0.01, 0.01, 0.01 )
    scene.add( model );

    /* 动画 */
    const clock = new three.Clock();
    const mixer = new three.AnimationMixer( model );
    const action = mixer.clipAction( gltf.animations[ 2 ] ); // 一共有3个动画，分别输入0、1、2试试！

    action.play();

    requestAnimationFrame( function loop() {

        requestAnimationFrame( loop );

        mixer.update( clock.getDelta() );

    } );

} );

/* 环境光 */
const light = new three.AmbientLight();

scene.add( light );

/* 移动相机 */
camera.position.set( - 2, 1, 3 );

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
