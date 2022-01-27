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
 * 由于Chrome浏览器的限制，用户必须和页面进行主动交互才能播放视频。
 */
/* Texture */
const video = document.createElement( "video" );

video.src = "/static/video/big-buck-bunny.mp4";
video.autoplay = true;
video.loop = true;

const texture = new three.VideoTexture( video );

const mesh = new three.Mesh(
    new three.PlaneGeometry( 1, 360 / 640 ), // 帧宽度：640，帧高度：360
    new three.MeshBasicMaterial( { map: texture, side: three.DoubleSide } ),
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
