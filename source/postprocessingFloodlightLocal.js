import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

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
/**
 * 前置知识：
 * 本节借助layers属性来实现局部泛光特效，还有另一种方法是在泛光渲染之前将不需要泛光的Mesh的material改成纯黑色，泛光渲染之后再恢
 * 复材质，详见https://stackoverflow.com/questions/67014085/threejs-selective-bloom-for-specific-parts-of-one-object-using-emission-map。
 * 请注意，renderer的clearColor和scene的background也会被泛光渲染所影响，你需要像下文这样做才能避免这个问题。
 */

/**
 * 泛光渲染函数。
 * @param   {Object}   options                          - 配置。
 * @param   {Object}   options.renderer                 - WebGLRenderer实例。
 * @param   {Object}   options.scene                    - Scene实例。
 * @param   {Object}   options.camera                   - Camera实例。
 * @param   {number}   options.threshold                - ?
 * @param   {number}   options.strength                 - ?
 * @param   {number}   options.radius                   - ?
 * @returns {Object}                                    - 该返回值具有很多方法，详见函数内部。
 */
function FloodlightRenderer( {
    renderer,
    scene,
    camera,
    threshold = 0,
    strength = 1,
    radius = 0,
} ) {

    /*  */
    this.threshold = threshold;
    this.strength = strength
    this.radius = radius;

    /*  */
    const size = renderer.getSize( new three.Vector2() ).toArray();

    /*  */
    const composer_bloom = new EffectComposer( renderer );                                           // 效果合成器
    const pass_render = new RenderPass( scene, camera );                                             // 后期处理（基本）
    const pass_bloom = new UnrealBloomPass( new three.Vector2().fromArray( size ), 1.5, 0.4, 0.85 ); // 后期处理（泛光

    pass_bloom.threshold = this.threshold;
    pass_bloom.strength = this.strength;
    pass_bloom.radius = this.radius;

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
    window.addEventListener( "resize", _ => { // NOTICE：请确保该函数的执行时机在renderer的size更新之后

        const size = renderer.getSize( new three.Vector2() ).toArray();

        composer_bloom.setSize( ...size );
        composer_final.setSize( ...size );

    } );

    /*  */
    this.getThreshold = function() {

        return this.threshold;

    };
    this.setThreshold = function( v ) {

        this.threshold = v;

        pass_bloom.threshold = this.threshold;

    };

    /*  */
    this.getStrength = function() {

        return this.strength;

    };
    this.setStrength = function( v ) {

        this.strength = v

        pass_bloom.strength = this.strength;


    };

    /*  */
    this.getRadius = function() {

        return this.radius;

    };
    this.setRadius = function( v ) {

        this.radius = v;

        pass_bloom.radius = this.radius;

    };

    /*  */
    this.getFloodlightRender = function() {

        return function render() { composer_bloom.render() };

    };

    /*  */
    this.getFinalRender = function() {

        return function render() { composer_final.render() };

    };

}

/* 待泛光渲染的mesh */
const geometry = new three.BoxGeometry();
const material = new three.MeshBasicMaterial();
const mesh_floodlight = new three.Mesh( geometry, material );
const mesh_no_floodlight = new three.Mesh( geometry, material );

mesh_floodlight.position.x = - 1.2;
mesh_no_floodlight.position.x = 1.2;

scene.add( mesh_floodlight, mesh_no_floodlight );

/* 雾 */
scene.fog = new three.FogExp2( 0x262837, 0.05 );

/* 背景色 */
scene.background = new three.Color( 0x262837 ); // 如果使用了renderer的clearColor，则也需要如此处理。

/* 泛光渲染 */
const options = {
    renderer,
    scene,
    camera,
    threshold: 0,
    strength: 1,
    radius: 0,
};

const floodlight_renderer = new FloodlightRenderer( options );
const floodlight_render = floodlight_renderer.getFloodlightRender();
const final_render = floodlight_renderer.getFinalRender();

renderer.setAnimationLoop( function loop() {

    controls.update();

    /*  */
    camera.layers.set( 1 );

    mesh_floodlight.layers.set( 1 );

    scene.background.set( 0x000000 );

    floodlight_render();

    /*  */
    camera.layers.set( 0 );

    mesh_floodlight.layers.set( 0 );

    scene.background.set( 0x262837 );

    final_render();

} );

/* 调试 */
const gui = new GUI();

gui.add( options, "threshold" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => floodlight_renderer.setThreshold( v ) );
gui.add( options, "strength" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => floodlight_renderer.setStrength( v ) );
gui.add( options, "radius" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => floodlight_renderer.setRadius( v ) );

/* 移动相机 */
camera.position.z = 3;
