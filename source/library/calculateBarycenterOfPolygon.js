import earcut from "earcut";

/**
 * 计算平面多边形的重心
 * @param   {Array.<number>} data 坐标集，如：平面多边形的顶点为(0,0)、(0,1)、(1,1)、(1,0)，data为[0,0, 0,1, 1,1, 1,0]
 * @returns {Array.<number>}      重心的坐标
 * @note 必须按同一时针方向提供平面多边形的顶点坐标
 * @note 基于平面直角坐标系
 * @example
 */
export default function (data) {

    // Part：缓存
    const cache_areas = [];
    const cache_centers = [];

    // Part：三角剖分
    const indexes = earcut(data, null, 2);

    // Part：计算各个三角形的面积与重心
    for (let i = 0; i < indexes.length; i += 3) {

        const index_1 = indexes[i];
        const index_2 = indexes[i + 1];
        const index_3 = indexes[i + 2];

        const position_1 = [data[index_1 * 2], data[index_1 * 2 + 1]];
        const position_2 = [data[index_2 * 2], data[index_2 * 2 + 1]];
        const position_3 = [data[index_3 * 2], data[index_3 * 2 + 1]];

        const area = Math.abs((position_1[0] * position_2[1] - position_2[0] * position_1[1] + position_2[0] * position_3[1] - position_3[0] * position_2[1] + position_3[0] * position_1[1] - position_1[0] * position_3[1]) / 2);
        const center = [(position_1[0] + position_2[0] + position_3[0]) / 3, (position_1[1] + position_2[1] + position_3[1]) / 3];

        cache_areas.push(area);
        cache_centers.push(center);

    }

    // Part：计算平面多边形的重心
    const temp_s = cache_areas.reduce((acc, item) => (acc + item), 0);
    const temp_x = cache_areas.reduce((acc, item, i) => (acc + item * cache_centers[i][0]), 0);
    const temp_y = cache_areas.reduce((acc, item, i) => (acc + item * cache_centers[i][1]), 0);

    const center_x = temp_x / temp_s;
    const center_y = temp_y / temp_s;

    return [center_x, center_y];

}
