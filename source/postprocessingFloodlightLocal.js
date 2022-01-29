import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

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
 * 本节借助layers属性来实现局部泛光特效，还有另一种方法是在泛光渲染之前将不需要泛光的Mesh的material改成纯黑色，泛光渲染之后再恢
 * 复材质，详见https://stackoverflow.com/questions/67014085/threejs-selective-bloom-for-specific-parts-of-one-object-using-emission-map。
 * 请注意，renderer的clearColor和scene的background也会被泛光渲染所影响，你需要像下文这样做才能避免这个问题。
 */

/**
 * 泛光渲染函数，这个函数封装了处理的细节，如果你想要实现全局或局部泛光，就必须在beforFloodlightRendering和
 * beforNormalRendering中手动进行处理，另外该函数会接管renderer的帧循环函数，请小心其他的帧循环函数的效果覆盖了
 * 该帧循环函数的效果。
 * @param {Object}   options                           - 配置。
 * @param {Object}   options.renderer                  - WebGLRenderer实例。
 * @param {Object}   options.scene                     - Scene实例。
 * @param {Object}   options.camera                    - Camera实例。
 * @param {Function} options.beforFloodlightRendering  - 该函数的执行时机是泛光渲染之前。
 * @param {Function} options.beforNormalRendering      - 该函数的执行时机是泛光渲染之后，常规渲染之前。
 * @param {number}   [options.threshold = 0]           - ?
 * @param {number}   [options.strength = 1]            - ?
 * @param {number}   [options.radius = 0]              - ?
 * NOTICE：scene的background和renderer的autoColor也是需要处理的，函数内并没有处理。
 * NOTICE：函数中默认camera原来的图层是第0号，并使用第13号图层来作为泛光的处理层，你需要小心。
 */
function floodlightRender( {
    renderer,
    scene,
    camera,
    beforNormalRendering,
    beforFloodlightRendering,
    threshold = 0,
    strength = 1,
    radius = 0,
} ) {

    /*  */
    const size = renderer.getSize( new three.Vector2() ).toArray();

    /*  */
    const composer_bloom = new EffectComposer( renderer );                                           // 效果合成器
    const pass_render = new RenderPass( scene, camera );                                             // 后期处理（基本）
    const pass_bloom = new UnrealBloomPass( new three.Vector2().fromArray( size ), 1.5, 0.4, 0.85 ); // 后期处理（泛光

    pass_bloom.threshold = threshold;
    pass_bloom.strength = strength;
    pass_bloom.radius = radius;

    composer_bloom.setSize( ...size );
    composer_bloom.addPass( pass_render );
    composer_bloom.addPass( pass_bloom );
    composer_bloom.renderToScreen = false;

    /*  */
    const vertex_shader = "varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}";
    const fragment_shader = "uniform sampler2D baseTexture;uniform sampler2D bloomTexture;varying vec2 vUv;void main() {gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );}";
    const pass_final = new ShaderPass(
        new three.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: composer_bloom.renderTarget2.texture }
            },
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            defines: {}
        }),
        "baseTexture"
    );

    pass_final.needsSwap = true;

    const composer_final = new EffectComposer( renderer );

    composer_final.addPass( pass_render );
    composer_final.addPass( pass_final );
    composer_final.setSize( ...size );

    /*  */
    window.addEventListener( "resize", _ => { // 请确保该函数的执行时机在renderer的size更新之后

        const size = renderer.getSize( new three.Vector2() ).toArray();

        composer_bloom.setSize( ...size );
        composer_final.setSize( ...size );

    } );

    /*  */
    renderer.setAnimationLoop( function loop() {

        beforFloodlightRendering && beforFloodlightRendering();

        composer_bloom.render();

        beforNormalRendering && beforNormalRendering();

        composer_final.render();

    } );

}

/* Mesh */
const geometry = new three.BoxGeometry();
const material = new three.MeshBasicMaterial();
const mesh_floodlight = new three.Mesh( geometry, material );
const mesh_no_floodlight = new three.Mesh( geometry, material );

mesh_floodlight.position.x = - 1.2;
mesh_no_floodlight.position.x = 1.2;

scene.add( mesh_floodlight, mesh_no_floodlight );

/* 雾 */
scene.fog = new three.FogExp2( 0x262837, 0.05 );
scene.background = new three.Color( 0x262837 );

/* 泛光渲染 */
const options = {
    renderer,
    scene,
    camera,
    beforFloodlightRendering,
    beforNormalRendering,
    threshold: 0,
    strength: 1,
    radius: 0,
};

function beforFloodlightRendering() {

    /*  */
    controls.update();

    /*  */
    camera.layers.set( 1 );

    mesh_floodlight.layers.set( 1 );

    /*  */
    scene.background.set( 0x000000 );

}

function beforNormalRendering() {

    /*  */
    camera.layers.set( 0 );

    mesh_floodlight.layers.set( 0 );

    /*  */
    scene.background.set( 0x262837 );

}

floodlightRender( options );

/* 移动相机 */
camera.position.z = 3;
