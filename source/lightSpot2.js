// TODO 旧代码
// TODO 旧代码
// TODO 旧代码

import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { easeInOut } from "./library/easingFunction.js";

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new three.WebGLRenderer({ antialias: true });

renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(camera);

document.body.appendChild(renderer.domElement);

window.addEventListener("resize", resize);

function animate() {

    renderer.render(scene, camera);

}

function resize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

}

// ======================================== wirte down your core here 👇 ========================================

moveCamera();
addOrbitControls();
addLightAmbient();
addGround();

const tetrahedron = addTetrahedron();
const [light_bb00ff, light_bb00ff_helper] = addLightSpot(0xbb00ff, [8, 16, 0]);
const [light_00ffbb, light_00ffbb_helper] = addLightSpot(0x00ffbb, [-8, 16, 0]);
const [light_ffbb00, light_ffbb00_helper] = addLightSpot(0xffbb00, [0, 16, -8]);

light_bb00ff.target = tetrahedron;
light_00ffbb.target = tetrahedron;
light_ffbb00.target = tetrahedron;

light_bb00ff.myTranslate();
light_00ffbb.myTranslate();
light_ffbb00.myTranslate();

changeRenderer();

function addOrbitControls() {

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 1, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();

}

function addGround() {

    const ground = new three.Mesh(
        new three.PlaneGeometry(1000, 1000).rotateX(-Math.PI / 2),
        new three.MeshPhongMaterial({ color: 0x888888 })
    );

    ground.receiveShadow = true;

    scene.add(ground);

    return ground;

}

function addLightAmbient() {

    const light = new three.AmbientLight(0xffffff, 0.05);

    scene.add(light);

    return light;

}

function addLightSpot(color, coordinate) {

    const light = new three.SpotLight(color);
    const helper = new three.SpotLightHelper(light);

    light.position.set(...coordinate);
    light.angle = 0.1;                 // 照射范围
    light.penumbra = 0.2;              // 半影衰减百分比
    light.decay = 2;                   // 随着光照距离的衰减量
    light.distance = 15;               // 光照距离
    light.castShadow = true;           // 启用阴影投射
    light.shadow.mapSize.width = 512;  // 阴影贴图的宽度
    light.shadow.mapSize.height = 512; // 阴影贴图的高度
    light.shadow.camera.near = 0.1;    // 阴影相机近端面界限
    light.shadow.camera.far = 100;     // 阴影相机远端面界限
    light.shadow.focus = 1;            // 阴影相机的焦距

    helper.update();
    scene.add(light, helper);
    retrofit(light);

    return [light, helper];

};

function addTetrahedron() {

    const tetrahedron = new three.Mesh(
        new three.TetrahedronGeometry(0.6),
        new three.MeshPhongMaterial(),
    );

    tetrahedron.position.set(0, 1, 0);
    tetrahedron.castShadow = true;
    tetrahedron.receiveShadow = true;

    scene.add(tetrahedron);

    return tetrahedron;

}

function changeRenderer() {

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = three.PCFSoftShadowMap;
    renderer.outputEncoding = three.sRGBEncoding;

    renderer.setAnimationLoop(_ => {

        tetrahedron.rotateX(0.02);

        light_bb00ff_helper.update();
        light_00ffbb_helper.update();
        light_ffbb00_helper.update();

        renderer.render(scene, camera);

    });

}

function moveCamera() {

    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

}

/**
 * 改造SpotLight实例，为其添加myTranslate方法，myTranslate方法可使其进行有规律的运动。retrofit方法被addLightSpot方法内部调用。
 */
function retrofit(target) {

    let x_source = target.position.x;
    let y_source = target.position.y;
    let z_source = target.position.z;
    let a_source = target.angle;
    let p_source = target.penumbra;

    let x_target;
    let y_target;
    let z_target;
    let a_target;
    let p_target;

    let x_source_to_target;
    let y_source_to_target;
    let z_source_to_target;
    let a_source_to_target;
    let p_source_to_target;

    target.myTranslate = () => {

        changeTarget();
        changeSourceToTarget();

        void (function animate() {

            const { value: x_next, done } = x_source_to_target.next();

            if (done) {

                x_source = x_target;
                y_source = y_target;
                z_source = z_target;
                a_source = a_target;
                p_source = p_target;

                setTimeout(target.myTranslate, 3000);

                return;

            }

            const { value: y_next } = y_source_to_target.next();
            const { value: z_next } = z_source_to_target.next();
            const { value: a_next } = a_source_to_target.next();
            const { value: p_next } = p_source_to_target.next();

            target.angle = a_next;
            target.penumbra = p_next;
            target.position.set(x_next, y_next, z_next);

            requestAnimationFrame(animate);

        }());

    };

    return target;

    function changeTarget() {

        const x_normal = Math.random() - 0.5;
        const z_normal = Math.random() - 0.5;
        const y_normal = Math.sqrt(1 - x_normal * x_normal - z_normal * z_normal);

        x_target = x_normal * 6;
        y_target = y_normal * 6;
        z_target = z_normal * 6;
        a_target = (Math.random() * 0.7) + 0.1;
        p_target = Math.random();

    }

    function changeSourceToTarget() {

        const x_ = easeInOut(x_source, x_target, 240).slice(1);
        const y_ = easeInOut(y_source, y_target, 240).slice(1);
        const z_ = easeInOut(z_source, z_target, 240).slice(1);
        const a_ = easeInOut(a_source, a_target, 240).slice(1);
        const p_ = easeInOut(p_source, p_target, 240).slice(1);

        x_source_to_target = wrapper(x_);
        y_source_to_target = wrapper(y_);
        z_source_to_target = wrapper(z_);
        a_source_to_target = wrapper(a_);
        p_source_to_target = wrapper(p_);

    }

    function* wrapper(array) {

        for (let i = 0; i < array.length; i++) {

            yield array[i];

        }

    }

}