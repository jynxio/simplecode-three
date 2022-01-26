import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

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
/*  */
const loader = new FBXLoader();

loader.load( "/static/model/fbx/people.fbx", fbx => {

    const model = fbx;

    model.scale.set( 0.01, 0.01, 0.01 );
    scene.add( model );

    /* 动画 */
    const clock = new three.Clock();
    const mixer = new three.AnimationMixer( model );
    const action = mixer.clipAction( fbx.animations[ 0 ] );

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
camera.position.z = 5;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
