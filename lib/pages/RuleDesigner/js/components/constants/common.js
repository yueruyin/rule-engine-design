// ========================================================
// 常用
// @author wangyb
// @createTime 2023-06-19 11:47:04
// ========================================================
export const ColorEnum = {
  White: '#ffffff',
  Black: '#000000',
  Primary: '#1890ff',
  Success: '#0dbc79',
  Info: '#bfbfbf',
  Danger: '#f5222d',
  Warn: '#EC9036',
  Volcano: '#fa541c',
  Yellow: '#fadb14',
  Cyan: '#13c2c2'
}

export const PathActionEnum = {
  Moveto: 'M', // 开始移动到的位置
  Lineto: 'L', // 移动至x,y
  LinetoR: 'l', // 相对移动x,y
  HorizontalLineto: 'H', // 横移至x
  HorizontalLinetoR: 'h', // 相对横移x
  VerticalLineto: 'V', // 纵移至y
  VerticalLinetoR: 'v', // 相对纵移y
  Curveto: 'C',
  CurvetoR: 'c',
  SmoothCurveto: 'S',
  SmoothCurvetoR: 's',
  QuadraticBezierCurve: 'Q',
  QuadraticBezierCurveR: 'q',
  SmoothQuadraticBezierCurveto: 'T',
  SmoothQuadraticBezierCurvetoR: 't',
  EllipticalArc: 'A', // 绝对位置绘制椭圆
  EllipticalArcR: 'a', // 相对位置绘制椭圆
  Closepath: 'Z'
}