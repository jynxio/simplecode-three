// TODO 旧代码
// TODO 旧代码
// TODO 旧代码

import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

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

addOrbitControls();

const dotarray = createModelDotarray();
dotarray.rotation.x = Math.PI / 2;
dotarray.position.set(-0.8, -0.8, -8);
scene.add(dotarray);

const arrow_1 = createArrow1();
arrow_1.position.set(-0.8, 0.8, -8);
scene.add(arrow_1);

const arrow_2 = createArrow2();
arrow_2.position.set(0.8, 0.8, -8);
scene.add(arrow_2);

const arrow_3 = createArrow3();
arrow_3.position.set(0.8, -0.8, -8);
scene.add(arrow_3);

const arrow_4 = createArrow4();
arrow_4.position.set(0, 2.4, -8);
scene.add(arrow_4);

const arrow_5 = createArrow5();
arrow_5.position.set(2.4, 0, -8);
scene.add(arrow_5);

// exportGltf(arrow_1);

/**
 * 导出模型（参见exporter-gltf.html）。
 */
function exportGltf(model, filename = "model.gltf", options = {}) {

    const exporter = new GLTFExporter();

    exporter.parse(model, onCompleted, onError, options);

    // 该函数将在解析完成后被自动调用，以实现自动下载模型文件
    function onCompleted(result) {

        const a = document.createElement("a");
        const data = JSON.stringify(result, null, 2);

        a.style.display = "none";
        a.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
        a.download = filename;
        a.click();

    }

    function onError() { }

}

/**
 * 创建正六边形的点阵模型。
 * @param {number} [radius = 0.4] - 正六边形的最小外接圆的半径。
 * @param {number} [count = 4] - 正六边形的一条外边上德点德数量。
 * @returns {Object} - Group实例。
 * @todo - 应该添加一个控制透明度的接口。
 */
function createModelDotarray(radius = 0.4, count = 4) {

    const n = count;
    const container = new three.Group();                // 容器, 容纳点阵

    // 点阵分两次绘制:
    // 第1次绘制: 第1层 ~ 第n层, 从上到下, 从左到右
    let x = 0;                                          // 起始点的坐标x(位于左上角)
    let z = 0;                                          // 起始点的坐标z

    // 水平方向上:
    let offsetX = radius / (n - 1);                     // 最近两点之间的x偏移(正数)

    // 垂直方向上:
    let offsetX_ = radius / (2 * n - 2);                // 最近两点之间的x偏移(正数)
    let offsetZ_ = Math.sqrt(3) * radius / (2 * n - 2); // 最近两点之间的z偏移(正数)

    for (let i = n; i <= (2 * n - 1); i++) {            // 控制垂直(从上到下)

        for (let j = 0; j < i; j++) {                   // 控制水平(从左到右)

            const thisX = x - radius / 2;
            const thisZ = z - Math.sqrt(3) * radius / 2;

            // 自圆心向外越发透明
            const [min, max] = [0.05, 0.5];
            const opacity = max + min - Math.hypot(thisX, thisZ) * max / radius;

            let point = new three.Mesh(
                new three.CircleBufferGeometry(radius / 15, 32).rotateX(-Math.PI / 2),
                new three.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: opacity, side: three.DoubleSide })
            );

            point.position.set(thisX, 0, thisZ);

            container.add(point);

            x += offsetX;

        }

        z += offsetZ_;
        x = -z / offsetZ_ * offsetX_;

    }


    // 第2次绘制: 第n+1层 ~ 第2n-1层, 从下到上, 从右到左
    x = radius;                                         // 起始点的坐标x(位于右下角)
    z = radius * Math.sqrt(3);                          // 起始点的坐标z

    for (let i = n; i < (2 * n - 1); i++) {

        for (let j = 0; j < i; j++) {

            const thisX = x - radius / 2;
            const thisZ = z - Math.sqrt(3) * radius / 2;

            const [min, max] = [0.05, 0.5];
            const opacity = max + min - Math.hypot(thisX, thisZ) * max / radius;

            let point = new three.Mesh(
                new three.CircleBufferGeometry(radius / 15, 32).rotateX(-Math.PI / 2),
                new three.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: opacity, side: three.DoubleSide })
            );

            point.position.set(thisX, 0, thisZ);

            container.add(point);

            x -= offsetX;

        }

        z -= offsetZ_;
        x = (radius * Math.sqrt(3) - z) / offsetZ_ * offsetX_ + radius;

    }

    return container;

}

/**
 * 创建贴地箭头模型。
 * @param {number} [radius = 0.5] - 半径。
 * @param {number} [segments = 64] - 分段数。
 * @param {number} [color_1 = 0x0090ff] - 面的颜色。
 * @param {number} [color_2 = 0xffffff] - 箭头的颜色。
 * @returns {Object} - Group实例。
 */
function createArrow1(radius = 0.5, segments = 64, color_1 = 0x0090ff, color_2 = 0xffffff) {

    /**
     * 创建底面
     */
    const component_1 = new three.Mesh(
        new three.CircleBufferGeometry(radius, segments),
        new three.MeshBasicMaterial({ color: color_1 })
    );

    /**
     * 创建箭头
     */
    const SQRT3 = Math.sqrt(3);                       // 中间参数, 无需理会
    const l = radius * SQRT3 * 0.6;                   // 中间参数, 无需理会
    const r = l * 0.1;                                // 中间参数, 无需理会
    const m = r / Math.hypot(- l / 2, SQRT3 * l / 7); // 中间参数, 无需理会

    // 构造形状
    const shape = new three.Shape();
    shape.moveTo(r / 2, r / 2 * SQRT3);
    shape.lineTo((l - r) / 2, (l - r) / 2 * SQRT3);
    shape.quadraticCurveTo(l / 2, l / 2 * SQRT3, (l + r) / 2, (l - r) / 2 * SQRT3);
    shape.lineTo(l - r / 2, r / 2 * SQRT3);
    shape.quadraticCurveTo(l, 0, (1 - m / 2) * l, SQRT3 * l * m / 7);
    shape.lineTo((1 + m) * l / 2, (1 - m) * SQRT3 * l / 7);
    shape.quadraticCurveTo(l / 2, SQRT3 * l / 7, (1 - m) * l / 2, (1 - m) * SQRT3 * l / 7);
    shape.lineTo(l * m / 2, SQRT3 * l * m / 7);
    shape.quadraticCurveTo(0, 0, r / 2, r / 2 * SQRT3);

    const component_2 = new three.Mesh(
        new three.ShapeGeometry(shape),
        new three.MeshBasicMaterial({ color: color_2, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetFactor: -1 })
    );

    // 居中
    component_2.position.x -= l / 2;
    component_2.position.y -= l * SQRT3 / 6;
    component_2.position.z += 0.001;

    /**
     * 组装
     */
    const container = new three.Group();
    container.add(component_1, component_2);

    return container;

}

/**
 * 创建菱形箭头。
 * @param {number} [length = 1] - 菱形的边长。
 * @param {number} [depth = 0.1] - 挤压的深度。
 * @param {number} [color_1 = 0x0090ff] - 菱形的颜色。
 * @param {number} [color_2 = 0xffffff] - 箭头的颜色。
 * @returns {Object} - Group实例。
 */
function createArrow2(length = 1, depth = 0.1, color_1 = 0x0090ff, color_2 = 0xffffff) {

    /**
     * 创建底面
     */
    let component_1;

    {
        const a = Math.sqrt(2) / 2 * length;                   // 中间数据, 无需理会
        const r = a / 10;                                      //  中间数据, 无需理会
        const shape = new three.Shape();

        // 构造形状
        shape.moveTo(-r, r - a);
        shape.lineTo(r - a, -r);
        shape.quadraticCurveTo(-a, 0, r - a, r);
        shape.lineTo(-r, a - r);
        shape.quadraticCurveTo(0, a, r, a - r);
        shape.lineTo(a - r, r);
        shape.quadraticCurveTo(a, 0, a - r, -r);
        shape.lineTo(r, r - a);
        shape.quadraticCurveTo(0, -a, -r, r - a);

        // 挤压参数
        const config = {
            depth: depth,                                      // 挤压的深度
            bevelEnabled: false,                               // 挤出的边是否采用斜角
        };

        component_1 = new three.Mesh(
            new three.ExtrudeGeometry(shape, config).center(), // 使几何体居中, 即让旋转中心为(0, 0, 0);
            new three.MeshBasicMaterial({ color: color_1 })
        );
    }

    /**
     * 创建箭头
     */
    let component_2;

    {
        const l = length * 0.8;         // 中间数据, 无需理会
        const a = Math.sqrt(2) / 2 * l; // 中间数据, 无需理会
        const r = a / 10;               // 中间数据, 无需理会
        const shape = new three.Shape();

        // 构造形状
        shape.moveTo(a - r, r);
        shape.lineTo(r, a - r);
        shape.quadraticCurveTo(0, a, -r, a - r);
        shape.lineTo(-a / 3 + r, a / 3 * 2 + r);
        shape.quadraticCurveTo(-a / 3, a / 3 * 2, -a / 3 + r, a / 3 * 2 - r);
        shape.lineTo(1 / 3 * a - l / 6 - r, l / 6 + r);
        shape.quadraticCurveTo(1 / 3 * a - l / 6, l / 6, 1 / 3 * a - l / 6 - r, l / 6)
        shape.lineTo(l / 6 - a + r, l / 6);
        shape.quadraticCurveTo(l / 6 - a, l / 6, l / 6 - a, l / 6 - r);
        shape.lineTo(l / 6 - a, r - l / 6);
        shape.quadraticCurveTo(l / 6 - a, - l / 6, l / 6 - a + r, - l / 6);
        shape.lineTo(1 / 3 * a - l / 6 - r, - l / 6);
        shape.quadraticCurveTo(1 / 3 * a - l / 6, - l / 6, 1 / 3 * a - l / 6 - r, - l / 6 - r);
        shape.lineTo(r - a / 3, r - a / 3 * 2);
        shape.quadraticCurveTo(- a / 3, - a / 3 * 2, - a / 3 + r, - a / 3 * 2 - r);
        shape.lineTo(-r, r - a);
        shape.quadraticCurveTo(0, - a, r, r - a);
        shape.lineTo(a - r, -r);
        shape.quadraticCurveTo(a, 0, a - r, r);

        // 挤压参数
        const config = {
            depth: depth + 0.002,
            bevelEnabled: false,
        };

        component_2 = new three.Mesh(
            new three.ExtrudeGeometry(shape, config).translate(0, 0, -depth / 2 - 0.001), // 使几何体居中, 不能使用.center()
            new three.MeshBasicMaterial({ color: color_2 })
        );
    }

    /**
     * 组装
     */
    const container = new three.Group();
    container.add(component_1, component_2);

    return container;

}

/**
 * 创建>型箭头
 * @param {number} [length = 1] - 菱形的边长。
 * @param {number} [depth = 0.1] - 挤压的深度。
 * @param {number} [color_1 = 0x0090ff] - 菱形的颜色。
 * @param {number} [color_2 = 0xffffff] - 箭头的颜色。
 * @returns {Object} - Group实例。
 */
function createArrow3(length = 1, depth = 0.1, color_1 = 0x0090ff, color_2 = 0xffffff) {

    /**
     * 创建底面
     */
    let component_1;

    {
        const a = Math.sqrt(2) / 2 * length; // 中间数据, 无需理会
        const r = a / 10;                    // 中间数据, 无需理会

        // 构造形状
        const shape = new three.Shape();

        shape.moveTo(a - r, r);
        shape.lineTo(r, a - r);
        shape.quadraticCurveTo(0, a, -r, a - r);
        shape.lineTo(- a / 2 + r, a / 2 + r);
        shape.quadraticCurveTo(- a / 2, a / 2, - a / 2 + r, a / 2 - r);
        shape.lineTo(-r, r);
        shape.quadraticCurveTo(0, 0, -r, -r);
        shape.lineTo(- a / 2 + r, - a / 2 + r);
        shape.quadraticCurveTo(- a / 2, - a / 2, - a / 2 + r, - a / 2 - r);
        shape.lineTo(-r, r - a);
        shape.quadraticCurveTo(0, -a, r, r - a);
        shape.lineTo(a - r, -r);
        shape.quadraticCurveTo(a, 0, a - r, r);

        // 挤压参数
        const config = {
            depth: depth,
            bevelEnabled: false,
        };

        component_1 = new three.Mesh(
            new three.ExtrudeGeometry(shape, config).center(), // 使其居中
            new three.MeshBasicMaterial({ color: color_1 })
        );
    }

    /**
     * 创建箭头
     */
    let component_2;

    {
        const l = length * 0.8;               // 中间参数, 无需理会
        const m = Math.sqrt(2) / 20 * length; // 中间参数, 无需理会
        const a = Math.sqrt(2) / 2 * l;       // 中间参数, 无需理会
        const r = a / 10;                     // 中间参数, 无需理会

        // 构造形状
        const shape = new three.Shape();

        shape.moveTo(a - r, r);
        shape.lineTo(r, a - r);
        shape.quadraticCurveTo(0, a, -r, a - r);
        shape.lineTo(- a / 2 + m + r, a / 2 + m + r);
        shape.quadraticCurveTo(- a / 2 + m, a / 2 + m, - a / 2 + m + r, a / 2 + m - r);
        shape.lineTo(2 * m - r, r);
        shape.quadraticCurveTo(2 * m, 0, 2 * m - r, -r);
        shape.lineTo(- a / 2 + m + r, - a / 2 - m + r);
        shape.quadraticCurveTo(- a / 2 + m, - a / 2 - m, - a / 2 + m + r, - a / 2 - m - r);
        shape.lineTo(-r, r - a);
        shape.quadraticCurveTo(0, -a, r, r - a);
        shape.lineTo(a - r, -r);
        shape.quadraticCurveTo(a, 0, a - r, r);

        // 挤压参数
        const config = {
            depth: 0.102,
            bevelEnabled: false,
        };

        component_2 = new three.Mesh(
            new three.ExtrudeGeometry(shape, config).center(),
            new three.MeshBasicMaterial({ color: color_2 }),
        );
    }

    /**
     * 组装
     */
    const container = new three.Group();
    container.add(component_1, component_2);

    return container;

}

/**
 * 创建组合箭头。
 * @param {number} [length = 1] - 菱形的边长。
 * @param {number} [depth = 0.1]  - 挤压的深度。
 * @param {number} [color_1 = 0x0090ff]  - 菱形的颜色。
 * @param {number} [color_2 = 0xffffff]  - 箭头的颜色。
 * @returns {Object} - Group实例。
 * @todo 最右边的2个箭头之间的距离需要调小一些。
 */
function createArrow4(length = 1, depth = 0.1, color_1 = 0x0090ff, color_2 = 0xffffff) {

    /**
     * 创建箭头组件
     */
    const component_1 = new createArrow2(length, depth, color_1, color_2);
    const component_2 = new createArrow3(length, depth, color_1, color_2);
    const component_3 = new createArrow3(length, depth, color_1, color_2);

    // 使箭头串的中心为旋转中心
    const translateX = Math.SQRT2 * length * 0.7;
    component_1.translateX(-translateX);
    component_3.translateX(translateX);

    /**
     * 组合
     */
    const container = new three.Group();
    container.add(component_1, component_2, component_3);

    return container;

}

/**
 * 创建水滴形箭头。
 * @param {number} [length = 1] - 水滴形箭头的横向最长长度。
 * @param {number} [depth = 0.08] - 挤压深度。
 * @param {number} [segments = 128] - 分段数。
 * @param {number} [color = 0xe41d1a] - 颜色。
 * @returns {Object} - Mesh实例。
 */
function createArrow5(length = 1, depth = 0.08, segments = 128, color = 0xe41d1a) {

    /**
     * 构建形状
     */
    const l = length; // 中间参数, 无需理会
    const shape = new three.Shape();

    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, l * 0.7, l, l * 0.7, l, 0);
    shape.quadraticCurveTo(l, - 0.175 * l, 0.85 * l, -0.35 * l);
    shape.lineTo(0.5175 * l, -0.73 * l);
    shape.quadraticCurveTo(0.5 * l, -0.75 * l, 0.4825 * l, -0.73 * l);
    shape.lineTo(0.15 * l, -0.35 * l);
    shape.quadraticCurveTo(0, -0.175 * l, 0, 0);
    shape.lineTo(0, 0);

    // 挤压参数
    const config = {
        depth: depth,
        bevelEnabled: false,
        curveSegments: segments,
    };

    /**
     * 创建Mesh实例
     */
    const geometry = new three.ExtrudeGeometry(shape, config);
    geometry.translate(-0.5 * l, 0.75 * l, -0.04 * l);

    const mesh = new three.Mesh(geometry, new three.MeshBasicMaterial({ color: color }));
    return mesh;

}

function addOrbitControls() {

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 0, -2);
    controls.update();

}
