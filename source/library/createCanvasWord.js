/**
 * 创建<canvas>元素，它具有指定的文字与样式（圆角、黑底、白字）
 * @param   {string} text             文本
 * @param   {number} size             尺寸，单个汉字的尺寸（单位：px）。如100代表单个汉字的宽高均为100px
 * @param   {string} color_text       文字色，如"rgb(247, 247, 0)"
 * @param   {string} color_background 背景色，如"rgb(231, 27, 36)"
 * @returns {Object}                  <canvas>元素
 * @note 若text为英文字母，将出现「文字比盒子短的多」现象
 * @example
 * f("中国", 100, "rgb(247, 247, 0)", "rgb(231, 27, 36)"); // <canvas>
 */
export default function (text, size, color_text, color_background) {

    // calculate constants
    const font_size = size;
    const font_number = text.length;

    const padding_side_h = font_size / 2; // 水平两侧的padding
    const padding_side_v = font_size / 4; // 垂直两侧的padding

    const box_width = padding_side_h + font_number * font_size + padding_side_h;
    const box_height = padding_side_v + font_size + padding_side_v;
    const box_radius = box_height * 0.25;
    const box_offset = 0.5;

    // create html element
    const elem_canvas = document.createElement("canvas");

    elem_canvas.width = box_width;
    elem_canvas.height = box_height;
    elem_canvas.style.display = "inline";

    // draw box
    const ctx = elem_canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(box_offset + box_radius, box_offset);
    ctx.lineTo(box_offset + box_width - box_radius, box_offset);
    ctx.bezierCurveTo(box_offset + box_width - box_radius, box_offset, box_offset + box_width, box_offset, box_offset + box_width, box_offset + box_radius);
    ctx.lineTo(-box_offset + box_width, -box_offset + box_height - box_radius);
    ctx.bezierCurveTo(-box_offset + box_width, -box_offset + box_height - box_radius, -box_offset + box_width, -box_offset + box_height, -box_offset + box_width - box_radius, -box_offset + box_height);
    ctx.lineTo(-box_offset + box_radius, -box_offset + box_height);
    ctx.bezierCurveTo(-box_offset + box_radius, -box_offset + box_height, box_offset, -box_offset + box_height, box_offset, -box_offset + box_height - box_radius);
    ctx.lineTo(box_offset, box_offset + box_radius);
    ctx.bezierCurveTo(box_offset, box_offset + box_radius, box_offset, box_offset, box_offset + box_radius, box_offset);

    ctx.strokeStyle = color_background;
    ctx.stroke();

    ctx.fillStyle = color_background;
    ctx.fill();

    // draw text
    ctx.font = `${font_size}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color_text;
    ctx.fillText(text, padding_side_h, box_height / 2 + Math.round(font_size * .09));

    return elem_canvas;

}