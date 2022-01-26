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
/* 背景板 */
const board = new three.Mesh(
    new three.PlaneGeometry( 4, 4 ),
    new three.MeshStandardMaterial(),
);

scene.add( board );

/* 被照射的物体 */
const box = new three.Mesh(
    new three.BoxGeometry( 0.5, 0.5, 0.5 ),
    new three.MeshStandardMaterial(),
);

box.position.z = 0.5;

scene.add( box );

/* 环境光 */
const ambient_light = new three.AmbientLight( 0xffffff, 0.1 );

scene.add( ambient_light );

/* 聚光灯 */
const light = new three.SpotLight();
const helper = new three.SpotLightHelper( light );

light.angle = Math.PI / 8;
light.distance = 5;
light.penumbra = 1;
light.decay = 0;
light.target = box;
light.position.set( 2, 0 , 2 );

helper.update();

scene.add( light, helper );

/* 投射阴影 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFSoftShadowMap;

light.castShadow = true;
light.shadow.camera.far = 5;  // 聚光灯的阴影相机是透视相机
light.shadow.camera.near = 1;
light.shadow.mapSize.set( 1024, 1024 );

box.castShadow = true;
box.receiveShadow = true;
board.receiveShadow = true;

const shadow_camera_helper = new three.CameraHelper( light.shadow.camera );

scene.add( shadow_camera_helper );

/* 移动相机 */
camera.position.set( 0, 0, 5 );

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
