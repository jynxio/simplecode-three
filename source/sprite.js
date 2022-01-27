import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import createCanvasWithWord from "./library/createCanvasWord";

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
const m = new three.Mesh(
    new three.BoxGeometry(),
    new three.MeshNormalMaterial(),
);

scene.add( m );

/* Sprite */
const canvas = createCanvasWithWord( "标签", 100, "rgb(255, 255, 255)", "rgb(0, 0, 0)" );
const texture = new three.CanvasTexture( canvas );

const s = new three.Sprite(
    new three.SpriteMaterial( {
        sizeAttenuation: false,
        map: texture,
} ),
);

s.scale.set( 0.1, 0.1 * canvas.height / canvas.width, 0.1 );
s.material.depthTest = false;
s.material.depthWrite = false;
s.renderOrder = 1;

scene.add( s );

/* 移动相机 */
camera.position.z = 3;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
