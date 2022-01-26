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
 * SpotLightHelper。
 * @param   {Object} light   - SpotLight实例。
 * @param   {number} color   - 十六进制颜色值，用于设置Helper的颜色，缺省时将使用SpotLight的颜色。
 * @param   {number} opacity - 属于[0, 1]的数字值，用于设置Helper的透明度，缺省时透明度为1。
 * @returns {Object}         - SpotLightHelper实例。
 * @example new SpotLightHelper( new three.Spotlight(), undefined, 0.2 );
 */
class SpotLightHelper extends three.Object3D {

    constructor( light, color, opacity ) {

        super();

        this.light = light;
        this.light.updateMatrixWorld();

        this.matrix = light.matrixWorld;
        this.matrixAutoUpdate = false;

        this.color = typeof (color) === "number" ? color : this.light.color.getHex();

        this.opacity = typeof (opacity) === "number" ? opacity : 1;

        const geometry = new three.ConeGeometry( 1, 1, 512, 1, false, 0, Math.PI * 2 ).translate( 0, -0.5, 0 ).rotateX( - Math.PI / 2 );
        const material = new three.MeshBasicMaterial( { transparent: true } );

        this.cone = new three.Mesh(geometry, material);
        this.add(this.cone);

        this.update();

    }

    dispose() {

        this.cone.geometry.dispose();
        this.cone.material.dispose();

    }

    update() {

        this.light.updateMatrixWorld();

        const coneLength = this.light.distance ? this.light.distance : 1000;
        const coneWidth = coneLength * Math.tan(this.light.angle);

        this.cone.scale.set(coneWidth, coneWidth, coneLength);

        this.cone.lookAt(new three.Vector3().setFromMatrixPosition(this.light.target.matrixWorld));

        this.cone.material.color.set(
            this.color === undefined ? this.light.color.getHex() : this.color
        );

        this.cone.material.opacity = this.opacity === undefined ? 1 : this.opacity;

    }

}

/* SpotLight和Helper */
const light = new three.SpotLight( 0xff00ff, 1, 1, Math.PI / 30, 0, 0 );
const helper = new SpotLightHelper( light, undefined, 0.2 );

scene.add( light, helper );

/* 移动相机 */
camera.position.z = 2;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );
