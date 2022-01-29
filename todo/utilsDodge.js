import * as three from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import Stats from "../../node_modules/stats.js/src/Stats.js";

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

addStats();
addOrbitControls();

const cubes = addCubes();

/**
 * 避让：当距离相机更近的object3d与距离相机更远的object3d在屏幕上发生遮挡时，自动隐藏距离相机更远的object3d
 * （该方法会改变object3ds的元素顺序，因为内部调用了distanceSort，该方法还会改变object3d的visible属性）。
 * @param {Array} object3ds - 由Object3D实例所组成的数组。
 * @param {Object} camera - Camera实例。
 * @param {number} width - 屏幕宽度值。
 * @param {number} height - 屏幕高度值。
 * @example
 * dodge(object3d_array, camera, window.innerWidth, window.innerHeight);
 */
function dodge(object3ds, camera, width, height) {

    // 距离排序。
    distanceSort(object3ds, camera);

    // 计算3d boundingBox（是指三维空间中的包围盒，是一个方体）。
    const box3s = object3ds.map(object3d => {

        object3d.geometry.computeBoundingBox();
        object3d.updateWorldMatrix(false, false);

        const box3 = object3d.geometry.boundingBox.clone().applyMatrix4(object3d.matrixWorld);

        return box3;

    });

    // 计算3d boundingBox的8个顶点的坐标。
    const coordinates_3d = [];

    for (let i = 0; i < box3s.length; i++) {

        const box3 = box3s[i];

        coordinates_3d.push(
            box3.min.x, box3.min.y, box3.min.z, // box3的顶点1
            box3.min.x, box3.min.y, box3.max.z, // box3的顶点2
            box3.min.x, box3.max.y, box3.min.z, // box3的顶点3
            box3.min.x, box3.max.y, box3.max.z, // box3的顶点4
            box3.max.x, box3.min.y, box3.min.z, // box3的顶点5
            box3.max.x, box3.min.y, box3.max.z, // box3的顶点6
            box3.max.x, box3.max.y, box3.min.z, // box3的顶点7
            box3.max.x, box3.max.y, box3.max.z, // box3的顶点8
        );

    }

    // 计算3d boundingBox的8个顶点在2d屏幕上的坐标。
    const coordinates_2d = [];

    for (let i = 0; i < coordinates_3d.length; i += 3) {

        const x_3d = coordinates_3d[i];
        const y_3d = coordinates_3d[i + 1];
        const z_3d = coordinates_3d[i + 2];

        const coordinate_2d = projectWorldCoordinateToScreenCoordinate([x_3d, y_3d, z_3d], camera, width, height);

        coordinates_2d.push(...coordinate_2d);

    }

    // 计算2d boundingBox（是指二维空间中的包围盒，是一个方形）。
    const bounding_box_coordinates_2d = [];

    for (let i = 0; i < coordinates_2d.length; i += 16) {

        const xs = []; // x的集合
        const ys = []; // y的集合

        for (let j = 0; j < 16; j++) {

            const value = coordinates_2d[i + j];

            j % 2 === 0 ? xs.push(value) : ys.push(value);

        }

        const x_min = Math.min(...xs);
        const y_min = Math.min(...ys);

        const x_max = Math.max(...xs);
        const y_max = Math.max(...ys);

        bounding_box_coordinates_2d.push(x_min, y_min, x_max, y_max);

    }

    // 计算遮挡情况，实施避让操作。
    for (let i = 0; i < object3ds.length; i++) {

        if (object3ds[i].visible === false) continue;
        debugger;
        const coordinates_1 = [
            bounding_box_coordinates_2d[i * 4],
            bounding_box_coordinates_2d[i * 4 + 1],
            bounding_box_coordinates_2d[i * 4 + 2],
            bounding_box_coordinates_2d[i * 4 + 3]
        ];

        for (let j = i + 1; j < object3ds.length; j++) {

            const coordinates_2 = [
                bounding_box_coordinates_2d[j * 4],
                bounding_box_coordinates_2d[j * 4 + 1],
                bounding_box_coordinates_2d[j * 4 + 2],
                bounding_box_coordinates_2d[j * 4 + 3]
            ];

            const is_intersectant = isIntersectant(coordinates_1, coordinates_2);

            is_intersectant && (object3ds[j].visible = false);

        }

    }

    /**
     * 判断2d平面中的2个横平竖直的box是否相交
     * @param   {Array} coordinates_1 - （第1个box）由2个顶点组成的坐标数组，格式为[x_min, y_min, x_max, y_max]。
     * @param   {Array} coordinates_2 - （第2个box）由2个顶点组成的坐标数组，格式为[x_min, y_min, x_max, y_max]。
     * @returns {boolean} - true则相交，false则不相交。
     */
    function isIntersectant(coordinates_1, coordinates_2) {

        const a_x_min = coordinates_1[0];
        const a_y_min = coordinates_1[1];
        const a_x_max = coordinates_1[2];
        const a_y_max = coordinates_1[3];

        const b_x_min = coordinates_2[0];
        const b_y_min = coordinates_2[1];
        const b_x_max = coordinates_2[2];
        const b_y_max = coordinates_2[3];

        if (a_y_max < b_y_min) return false;
        if (b_y_max < a_y_min) return false;
        if (a_x_max < b_x_min) return false;
        if (b_x_max < a_x_min) return false;

        return true;

    }

}

/**
 * 距离排序：原地排序object3ds，距离camera近的object3d排在数组开头，反之排在数组末尾
 * （该方法会改变object3ds的元素顺序）。
 * @param {Array} object3ds - 由Object3D实例所组成的数组。
 * @param {Object} camera - Camera实例。
 */
function distanceSort(object3ds, camera) {

    object3ds.sort((a, b) => {

        const distance_squared_a = a.position.distanceToSquared(camera.position);
        const distance_squared_b = b.position.distanceToSquared(camera.position);

        return (distance_squared_a - distance_squared_b);

    });

}

/**
 * 根据3d坐标来计算2d坐标（即计算3d坐标在2d屏幕上的投影，详见utilsWorldCoordinateToScreenCoordinate.js）。
 */
function projectWorldCoordinateToScreenCoordinate(coordinate, camera, width, height) {

    const vector3 = new three.Vector3(...coordinate).project(camera);

    const x_1 = vector3.x;                      // x∈[-1, 1]，采用标准化设备坐标系NDC，屏幕中心为原点，X轴正方向：→
    const y_1 = vector3.y;                      // y∈[-1, 1]，采用标准化设备坐标系NDC，屏幕中心为原点，Y轴正方向：↑

    const x_2 = (x_1 + 1) / 2;                  // x∈[0, 1]，采用屏幕坐标系，屏幕左上角为原点，X轴正方向：→
    const y_2 = - (y_1 - 1) / 2;                // y∈[0, 1]，采用屏幕坐标系，屏幕左上角为原点，Y轴正方向：↓

    const x_3 = Math.round(x_2 * (width - 1));  // x∈[0, 1919]，采用屏幕坐标系，此处假设屏幕宽高比为1920:1080
    const y_3 = Math.round(y_2 * (height - 1)); // y∈[0, 1079]，采用屏幕坐标系，此处假设屏幕宽高比为1920:1080

    return [x_3, y_3];

}

/**
 * 添加1000个方体
 * @returns {Array} - 由1000个object3d组成的数组
 */
function addCubes() {

    const geometry = new three.BoxGeometry(0.5, 0.5, 0.5, 1, 1, 1);
    const material = new three.MeshNormalMaterial();
    const cubes = [];

    let num = 1000;

    while (num--) {

        const cube = new three.Mesh(geometry, material);

        cube.position.x = Math.random() * 10 - 5;
        cube.position.y = Math.random() * 10 - 5;
        cube.position.z = -Math.random() * 10 - 10;
        cube.rotateX(Math.random() * Math.PI);
        cube.rotateY(Math.random() * Math.PI);
        cube.rotateZ(Math.random() * Math.PI);
        cube.updateWorldMatrix(false, false);

        scene.add(cube);

        cubes.push(cube);

    }

    return cubes;

}

/**
 * 鼠标控制器
 */
function addOrbitControls() {

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 0, -15);
    controls.update();

}

/**
 * 添加性能监控面板（更改了renderer的帧循环函数，并将dodge嵌入其中）
 */
function addStats() {

    const stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.dom);

    renderer.setAnimationLoop(_ => {

        stats.begin();

        cubes.forEach(cube => cube.visible = true);

        dodge(cubes, camera, window.innerWidth, window.innerHeight);

        renderer.render(scene, camera);

        stats.end();

    });

}
