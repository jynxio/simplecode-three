import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

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
 * 边缘高亮渲染函数，这个函数封装了处理的细节，该函数会接管renderer的帧循环函数，请小心其他的帧循环函数的效果覆盖了该帧循环函数的效果。
 * @param   {Object} options - 配置。
 * @param   {Object} options.renderer         - WebGLRenderer实例。
 * @param   {Object} options.scene            - Scene实例。
 * @param   {Object} options.camera           - Camera实例。
 * @param   {number} options.visibleEdgeColor - 可见颜色
 * @param   {number} options.hiddenEdgeColor  - ?
 * @param   {number} options.edgeGlow         - 光晕强度
 * @param   {number} options.edgeThickness    - 线条厚度
 * @param   {number} options.edgeStrength     - 线条强度
 * @param   {number} options.downSampleRatio  - 线条缩放比例
 * @param   {number} options.pulsePeriod      - 闪烁周期
 * @param   {Array}  options.targets          - 由Mesh实例组成的数组，这些Mesh的边缘会高亮处理。
 * @returns {Object}                          - 该返回值具有很多方法，详见函数内部。
 */
function HighlightEdgeRenderer( {
    renderer,
    scene,
    camera,
    visibleEdgeColor,
    hiddenEdgeColor,
    edgeGlow,
    edgeThickness,
    edgeStrength,
    downSampleRatio,
    pulsePeriod,
    targets,
} ) {

    this.visibleEdgeColor = visibleEdgeColor;
    this.hiddenEdgeColor = hiddenEdgeColor;
    this.edgeGlow = edgeGlow;
    this.edgeThickness = edgeThickness;
    this.edgeStrength = edgeStrength;
    this.downSampleRatio = downSampleRatio;
    this.pulsePeriod = pulsePeriod;
    this.targets = targets;

    /*  */
    const size = renderer.getSize( new three.Vector2() ).toArray();

    /*  */
    const composer = new EffectComposer( renderer );                                              // 效果合成器
    const pass_render = new RenderPass( scene, camera );                                          // 后期处理（基本）
    const pass_outline = new OutlinePass( new three.Vector2().fromArray( size ), scene, camera ); // 后期处理（边缘高亮）

    pass_outline.renderToScreen = true;
    pass_outline.visibleEdgeColor.set( this.visibleEdgeColor );
    pass_outline.hiddenEdgeColor.set( this.hiddenEdgeColor );
    pass_outline.edgeGlow = this.edgeGlow;
    pass_outline.usePatternTexture = false;                     // 是（true）否（false）使用贴图
    pass_outline.edgeThickness = this.edgeThickness;
    pass_outline.edgeStrength = this.edgeStrength;
    pass_outline.downSampleRatio = this.downSampleRatio;
    pass_outline.pulsePeriod = this.pulsePeriod;
    pass_outline.selectedObjects = this.targets;

    composer.setSize( ...size );      // 尺寸
    composer.addPass( pass_render );  // 将该后期处理环节添加至过程链
    composer.addPass( pass_outline ); // 将该后期处理环节添加至过程链

    /*  */
    window.addEventListener( "resize", _ => {  // NOTICE：请确保该函数的执行时机在renderer的size更新之后

        const size = renderer.getSize( new three.Vector2() ).toArray();

        composer.setSize( ...size );

    } );

    /*  */
    this.getVisibleEdgeColor = function() {

        return this.visibleEdgeColor;

    };
    this.setVisibleEdgeColor = function( v ) {

        this.visibleEdgeColor = v;

        pass_outline.visibleEdgeColor.set( this.visibleEdgeColor );

    };

    /*  */
    this.getHiddenEdgeColor = function() {

        return this.hiddenEdgeColor;

    };
    this.setHiddenEdgeColor = function( v ) {

        this.hiddenEdgeColor = v;

        pass_outline.hiddenEdgeColor.set( this.hiddenEdgeColor );

    };

    /*  */
    this.getEdgeGlow = function() {

        return this.edgeGlow;

    };
    this.setEdgeGlow = function( v ) {

        this.edgeGlow = v;

        pass_outline.edgeGlow = this.edgeGlow;

    };

    /*  */
    this.getEdgeThickness = function() {

        return this.edgeThickness;

    };
    this.setEdgeThickness = function( v ) {

        this.edgeThickness = v;

        pass_outline.edgeThicknes = this.edgeThickness;

    };

    /*  */
    this.getEdgeStrength = function() {

        return this.edgeStrength;

    };
    this.setEdgeStrength = function( v ) {

        this.edgeStrength = v;

        pass_outline.edgeStrength = this.edgeStrength;

    };

    /*  */
    this.getDownSampleRatio = function() {

        return this.downSampleRatio;

    };
    this.setDownSampleRatio = function( v ) {

        this.downSampleRatio = v;

        pass_outline.downSampleRatio = this.downSampleRatio;

    };

    /*  */
    this.getPulsePeriod = function() {

        return this.pulsePeriod;

    };
    this.setPulsePeriod = function( v ) {

        this.pulsePeriod = v;

        pass_outline.pulsePeriod = this.pulsePeriod;

    };

    /*  */
    this.getSelectedObjects = function() {

        return this.selectedObjects;

    };
    this.setSelectedObjects = function( v ) {

        this.selectedObjects = v;

        pass_outline.selectedObjects = this.targets;

    };

    /*  */
    this.getRender = function() {

        return function render() { composer.render() };

    };

}

/* 待边缘高亮处理的mesh */
const geometry = new three.BoxGeometry();
const material = new three.MeshNormalMaterial();

const mesh_highlight = new three.Mesh( geometry, material );
const mesh_no_highlight = new three.Mesh( geometry, material );

mesh_highlight.position.x = - 1.2;
mesh_no_highlight.position.x = + 1.2;

scene.add( mesh_highlight, mesh_no_highlight );

/* 边缘高亮渲染 */
const options = {
    renderer,
    scene,
    camera,
    visibleEdgeColor: 0xffff00,
    hiddenEdgeColor: 0xffffff,
    edgeGlow: 3,
    edgeThickness: 3,
    edgeStrength: 5,
    downSampleRatio: 1,
    pulsePeriod: 4,
    targets: [ mesh_highlight ],
};

const highlight_edge_render = new HighlightEdgeRenderer( options );
const render = highlight_edge_render.getRender();

renderer.setAnimationLoop( function loop() {

    controls.update();

    render();

} );

/* 调试 */
const gui = new GUI();

gui.addColor( options, "visibleEdgeColor" ).onChange( v => highlight_edge_render.setVisibleEdgeColor( v ) );
gui.addColor( options, "hiddenEdgeColor" ).onChange( v => highlight_edge_render.setHiddenEdgeColor( v ) );
gui.add( options, "edgeGlow" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => highlight_edge_render.setEdgeGlow( v ) );
gui.add( options, "edgeThickness" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => highlight_edge_render.setEdgeThickness( v ) );
gui.add( options, "edgeStrength" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => highlight_edge_render.setEdgeStrength( v ) );
gui.add( options, "downSampleRatio" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => highlight_edge_render.setDownSampleRatio( v ) );
gui.add( options, "pulsePeriod" ).min( 0 ).max( 10 ).step( 0.001 ).onChange( v => highlight_edge_render.setPulsePeriod( v ) );

/* 移动相机 */
camera.position.z = 3;
