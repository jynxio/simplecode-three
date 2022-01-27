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
 * GifTexture类，它用于播放精灵图动画，精灵图动画会循环播放。
 * @param   {string} url            - 统一资源定位符。
 * @param   {number} x_frame_number - x轴方向上的帧的数量。
 * @param   {number} y_frame_number - y轴方向上的帧的数量。
 * @param   {number} duration       - 一轮动画的时长，单位是毫秒。
 * @returns {Object}                - GifTexture实例，它拥有play、pause、reset、setDuration方法，详见函数体内的介绍。
 */
function GifTexture( url, x_frame_number, y_frame_number, duration ) {

    /* 记录参数 */
    this.url = url;                                     // url。
    this.frameNumber = x_frame_number * y_frame_number; // 总帧数。
    this.xFrameNumber = x_frame_number;                 // x轴上的帧数。
    this.yFrameNumber = y_frame_number;                 // y轴上的帧数。
    this.duration = duration;                           // 一轮动画的时长。

    /* 创建纹理 */
    this.texture = new three.TextureLoader().load( this.url );

    this.texture.wrapS = three.RepeatWrapping;
    this.texture.wrapT = three.RepeatWrapping;
    this.texture.repeat.set(
        1 / this.xFrameNumber,
        1 / this.yFrameNumber,
    );

    /* 创建isRunning属性：是否正在播放 */
    this.isRunning = false;

    /* setDuration方法：重新设置一轮动画的时长（同时会复位）。 */
    this.setDuration = function ( v ) {

        this.reset();

        this.duration = v;

    }

    /* play方法：开始播放，从头开始播放或从上一次暂停处继续播放。 */
    this.play = function () {

        if ( this.isRunning ) return;

        this.isRunning = true;

        if ( !this.clock ) this.clock = new three.Clock();

        const elapsed_time = this.clock.getElapsedTime();

        this.clock.start();

        this.clock.elapsedTime = elapsed_time;

    };

    /* pause方法：暂停播放。 */
    this.pause = function() {

        if ( !this.isRunning ) return;

        this.isRunning = false;

        this.clock.stop();

    };

    /* reset方法：复位，复位后也暂停了播放。 */
    this.reset = function() {

        this.pause();

        this.clock = undefined;

        this.texture.offset.set( 0, 0 );

    };

    /* 动画：在私有的帧循环函数中实现动画，如果该函数的执行时机在renderer.render的时机之后，则动画将会延迟一帧 */
    const self = this;

    requestAnimationFrame( function loop() {

        requestAnimationFrame( loop );

        if ( !self.isRunning ) return;

        const elapsed_time =  self.clock.getElapsedTime() * 1000;

        const frame_index = Math.round( elapsed_time / ( self.duration / self.frameNumber ) ) % self.frameNumber;

        const row_index = Math.floor( frame_index / self.xFrameNumber );
        const col_index = frame_index % self.xFrameNumber;

        self.texture.offset.set(
            1 / self.xFrameNumber * col_index,
            1 / self.yFrameNumber * row_index,
        );

    } );

    return this;

}

/*  */
const gif_texture = new GifTexture( "/static/image/紫色箭头-30帧.png", 30, 1, 2000 );

gif_texture.play();

const mesh = new three.Mesh(
    new three.PlaneGeometry( 2, 0.836 ), // 2/0.836是帧宽高比。
    new three.MeshBasicMaterial( {
        transparent: true,
        map: gif_texture.texture,
    } ),
);

scene.add( mesh );

/* 移动相机 */
camera.position.z = 2;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
