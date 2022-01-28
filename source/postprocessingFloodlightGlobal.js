import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

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
/* Box */
const mesh = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshBasicMaterial( { color: 0xff0000 } ),
);

scene.add( mesh );

/* 泛光 */
const composer = new EffectComposer( renderer );
const pass_render = new RenderPass( scene, camera );
const pass_bloom = new UnrealBloomPass( new three.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );

pass_bloom.renderToScreen = true; // 最终过程是否被渲染到屏幕
pass_bloom.threshold = 0;         // ?
pass_bloom.strength = 1;          // 强度
pass_bloom.radius = 0;            // 半径

composer.setSize( window.innerWidth, window.innerHeight ); //
composer.addPass( pass_render );                           // 将该后期处理环节添加至过程链
composer.addPass( pass_bloom );                            // 将该后期处理环节添加至过程链

window.addEventListener( "resize", _ => {

    composer.setSize( window.innerWidth, window.innerHeight );

} );

/* 色调映射和曝光 */
renderer.toneMapping = three.NoToneMapping;
renderer.toneMappingExposure = 1;

/* 调试 */
const gui = new GUI();

gui.add( pass_bloom, "renderToScreen" );
gui.add( pass_bloom, "threshold" ).min( 0 ).max( 1 ).step( 0.001 );
gui.add( pass_bloom, "strength" ).min( 0 ).max( 10 ).step( 0.01 );
gui.add( pass_bloom, "radius" ).min( 0 ).max( 10 ).step( 0.01 );
gui.add( renderer, "toneMappingExposure" ).min( 0 ).max( 10 ).step( 0.01 ).name( "exposure" );
gui.add( renderer, "toneMapping", {
    no: three.NoToneMapping,
    linear: three.LinearToneMapping,
    reinhard: three.ReinhardToneMapping,
    cineon: three.CineonToneMapping,
    acesfilmic: three.ACESFilmicToneMapping,
} ).onFinishChange( _ => renderer.toneMapping = + renderer.toneMapping );

/* 移动相机 */
camera.position.z = 3;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    composer.render();  // 按顺序执行所有启用的后期处理环节, 来产生最终的帧

} );
