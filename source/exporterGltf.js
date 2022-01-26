import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

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
/* 被导出的模型 */
const mesh = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshBasicMaterial( { transparent: true, opacity: 0.65 } ),
);

exportGltf( mesh );

/**
 * 到处glTF格式的模型。
 * @param   {Object} mesh     - three.Mesh实例。
 * @param   {string} filename - 文件名。
 * @param   {Object} options  - 导出参数，详见https://threejs.org/docs/index.html#examples/en/exporters/GLTFExporter。
 * @returns {undefined}
 * @note mesh的material只能使用MeshStandardMaterial或MeshBasicMaterial。
 */
function exportGltf( mesh, filename = "scene.gltf", options = {} ) {

    const exporter = new GLTFExporter();

    exporter.parse( mesh, onCompleted, onError, options );

    /* 该函数将在parse完成后被自动调用，我们在该函数中执行下载动作 */
    function onCompleted( r ) {

        const a = document.createElement( "a" );
        const data = JSON.stringify( r, null, 2 );

        a.style.display = "none";
        a.href = URL.createObjectURL( new Blob( [data], { type: "text/plain" } ) );
        a.download = filename;
        a.click();

    }

    function onError() {  }

}

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
