/**
 * @file 参考文档：https://aaron-bird.github.io/2019/03/30/%E7%BC%93%E5%8A%A8%E5%87%BD%E6%95%B0(easing%20function)/
 */

/**
 * 缓动函数linear：线性变化
 * @param   {number} initial  初始状态的值
 * @param   {number} target   目标状态的值
 * @param   {number} duration 过渡时长（单位：帧）
 * @returns {Array.<number>}  变化数组：拥有duration+1个元素，0号元素是initial、duration号元素是target、其它号元素是过渡的中间态
 * @example
 * linear(0, 10, 10); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 */
export function linear(initial, target, duration) {

    const change = target - initial;     // 有向变化幅度
    const step = change / duration;      // 有向变化步长

    const result = [];

    result[0] = initial;                 // 0号元素是initial
    result[duration] = target;           // duration号元素是target

    for (let i = 1; i < duration; i++) { // 其它号元素是过渡的中间态

        result[i] = initial + i * step;

    }

    return result;

}

/**
 * 缓动函数easi-in：开始时速度很慢，然后逐渐加快，结尾突然停止，感觉生硬（公式：f(x)=x^2）
 * @param   {number} initial  初始状态的值
 * @param   {number} target   目标状态的值
 * @param   {number} duration 过渡时长（单位：帧）
 * @returns {Array.<number>}  变化数组：拥有duration+1个元素，0号元素是initial、duration号元素是target、其它号元素是过渡的中间态
 * @example
 * easeIn(0, 10, 10); // [0, 0.10000000000000002, 0.4000000000000001, 0.8999999999999999, 1.6000000000000003, 2.5, 3.5999999999999996, 4.8999999999999995, 6.400000000000001, 8.100000000000001, 10]
 */
export function easeIn(initial, target, duration) {

    const change = target - initial;

    const result = [];

    for (let i = 0; i <= duration; i++) {

        result.push(Math.pow(i / duration, 2) * change + initial);

    }

    return result;

}

/**
 * 缓动函数ease-out：开始时速度很快，然后逐渐减慢，不会戛然而止，具有流畅感（公式：f(x)=-x^2+2x）
 * @param   {number} initial  初始状态的值
 * @param   {number} target   目标状态的值
 * @param   {number} duration 过渡时长（单位：帧）
 * @returns {Array.<number>}  变化数组：拥有duration+1个元素，0号元素是initial、duration号元素是target、其它号元素是过渡的中间态
 * @example
 * easeOut(0, 10, 10); // [0, 1.9, 3.5999999999999996, 5.1, 6.4, 7.5, 8.4, 9.1, 9.6, 9.9, 10]
 */
export function easeOut(initial, target, duration) {

    const change = target - initial;

    const result = [];

    for (let i = 0; i <= duration; i++) {

        const x = i / duration;
        const y = 2 * x - x * x

        result.push(y * change + initial);

    }

    return result;

}

/**
 * 缓动函数ease-in-out：开头和结尾慢，中间快，比ease-out更生动，动画事件不宜过长，最好在300~500ms。ease和它的区别是，ease的开始速度比结尾速度更快一些
 * @param   {number} initial  初始状态的值
 * @param   {number} target   目标状态的值
 * @param   {number} duration 过渡时长（单位：帧）
 * @returns {Array.<number>}  变化数组：拥有duration+1个元素，0号元素是initial、duration号元素是target、其它号元素是过渡的中间态
 * @example
 * easeInOut(0, 10, 10); // [0, 0.20000000000000004, 0.8000000000000002, 1.7999999999999998, 3.2000000000000006, 5, 6.8, 8.2, 9.2, 9.8, 10]
 */
export function easeInOut(initial, target, duration) {

    const change_half = (target - initial) / 2;

    const easein_initial = initial;
    const easein_target = initial + change_half;
    const easein_duration = duration % 2 === 0 ? duration / 2 : Math.floor(duration / 2);

    const easeout_initial = easein_target;
    const easeout_target = target;
    const easeout_duration = duration - easein_duration;

    const result_easein = easeIn(easein_initial, easein_target, easein_duration);
    const result_easeout = easeOut(easeout_initial, easeout_target, easeout_duration);

    const result = result_easein.slice(0, -1).concat(result_easeout);

    return result;

}
