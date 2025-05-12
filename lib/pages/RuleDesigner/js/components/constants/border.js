// ========================================================
// 边框用到的常量
// @author wangyb
// @createTime 2023-06-19 11:46:27
// ========================================================
export const BorderTypeEnum = {
  Solid: 'solid',
  Dashed: 'dashed',
  DashedShort: 'dashed_short',
  DashedLarge: 'dashed_large',
  DotDashed: 'dot_dashed'
}

export const BorderTypeDashArrayMap = {
  [BorderTypeEnum.Solid]: '',
  [BorderTypeEnum.Dashed]: '4 4',
  [BorderTypeEnum.DashedShort]: '2 2',
  [BorderTypeEnum.DashedLarge]: '6 6',
  [BorderTypeEnum.DotDashed]: '4 2 1 2'
}

/**
 * 移动方向
 */
export const DirectionEnum = {
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
  // 组合方向，前面的方向近，后面的方向远
  LeftUp: 5,
  LeftDown: 6,
  RightUp: 7,
  RightDown: 8,
  UpLeft: 9,
  UpRight: 10,
  DownLeft: 11,
  DownRight: 12,
  // 距离一致的组合方向
  UpLeftCenter: 13,
  UpRightCenter: 14,
  DownLeftCenter: 15,
  DownRightCenter: 16,
  // 居中
  Center: 17
}

export const CornerDirectionEnum = {
  [DirectionEnum.Up]: {
    [DirectionEnum.Left]: DirectionEnum.UpLeft,
    [DirectionEnum.Right]: DirectionEnum.UpRight
  },
  [DirectionEnum.Down]: {
    [DirectionEnum.Left]: DirectionEnum.DownLeft,
    [DirectionEnum.Right]: DirectionEnum.DownRight
  },
  [DirectionEnum.Left]: {
    [DirectionEnum.Up]: DirectionEnum.LeftUp,
    [DirectionEnum.Down]: DirectionEnum.LeftDown
  },
  [DirectionEnum.Right]: {
    [DirectionEnum.Up]: DirectionEnum.RightUp,
    [DirectionEnum.Down]: DirectionEnum.RightDown
  }
}

export const DirectionNameMap = {
  [DirectionEnum.Up]: 'Up',
  [DirectionEnum.Top]: 'Top',
  [DirectionEnum.Down]: 'Down',
  [DirectionEnum.Bottom]: 'Bottom',
  [DirectionEnum.Left]: 'Left',
  [DirectionEnum.Right]: 'Right',
  // 组合方向，前面的方向近，后面的方向远
  [DirectionEnum.LeftUp]: 'LeftUp',
  [DirectionEnum.LeftDown]: 'LeftDown',
  [DirectionEnum.RightUp]: 'RightUp',
  [DirectionEnum.RightDown]: 'RightDown',
  [DirectionEnum.UpLeft]: 'UpLeft',
  [DirectionEnum.UpRight]: 'UpRight',
  [DirectionEnum.DownLeft]: 'DownLeft',
  [DirectionEnum.DownRight]: 'DownRight',
  // 距离一致的组合方向
  [DirectionEnum.UpLeftCenter]: 'UpLeftCenter',
  [DirectionEnum.UpRightCenter]: 'UpRightCenter',
  [DirectionEnum.DownLeftCenter]: 'DownLeftCenter',
  [DirectionEnum.DownRightCenter]: 'DownRightCenter',
  // 居中
  [DirectionEnum.Center]: 'Center'
}

export const DirectionNameEnum = {
  Up: 'Up',
  Top: 'Top',
  Down: 'Down',
  Bottom: 'Bottom',
  Left: 'Left',
  Right: 'Right',
  // 组合方向，前面的方向近，后面的方向远
  LeftUp: 'LeftUp',
  LeftDown: 'LeftDown',
  RightUp: 'RightUp',
  RightDown: 'RightDown',
  UpLeft: 'UpLeft',
  UpRight: 'UpRight',
  DownLeft: 'DownLeft',
  DownRight: 'DownRight',
  // 距离一致的组合方向
  UpLeftCenter: 'UpLeftCenter',
  UpRightCenter: 'UpRightCenter',
  DownLeftCenter: 'DownLeftCenter',
  DownRightCenter: 'DownRightCenter',
  // 居中
  Center: 'Center'
}

/**
 * 边类型
 */
export const SideEnum = {
  Top: 1,
  Bottom: 2,
  Left: 3,
  Right: 4
}

export const SideNameMap = {
  0: '',
  [SideEnum.Top]: 'Top',
  [SideEnum.Bottom]: 'Bottom',
  [SideEnum.Left]: 'Left',
  [SideEnum.Right]: 'Right'
}

/**
 * 边类型
 */
export const RectCornerEnum = {
  LeftTop: 1,
  RightDown: 2,
  LeftDown: 3,
  RightTop: 4
}

export const RectCornerNameMap = {
  [RectCornerEnum.LeftTop]: 'LeftTop',
  [RectCornerEnum.RightDown]: 'RightDown',
  [RectCornerEnum.LeftDown]: 'LeftDown',
  [RectCornerEnum.RightTop]: 'RightTop'
}

export const ColorEnum = {
  White: '#ffffff',
  Black: '#000000',
  Primary: '#1890ff',
  Success: '#52c41a',
  Info: '#bfbfbf',
  Danger: '#f5222d',
  Warn: '#fa8c16',
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
  SmoothQuadraticBezierCurvetoT: 't',
  EllipticalArc: 'A', // 绝对位置绘制椭圆
  EllipticalArcR: 'a', // 相对位置绘制椭圆
  Closepath: 'Z'
}

export const ModelStatusEnum = {
  Default: 'default',
  Selected: 'selected',
  Debugger: 'debugger'
}

export const ModelStatusNextMap = {
  [ModelStatusEnum.Default]: ModelStatusEnum.Selected,
  [ModelStatusEnum.Selected]: ModelStatusEnum.Debugger,
  [ModelStatusEnum.Debugger]: ModelStatusEnum.Default
}

export const ModelStatusPrefixMap = {
  [ModelStatusEnum.Default]: '',
  [ModelStatusEnum.Selected]: 'selected.',
  [ModelStatusEnum.Debugger]: 'debugger.'
}

export const ModelStatusPostfixMap = {
  [ModelStatusEnum.Default]: '',
  [ModelStatusEnum.Selected]: '',
  [ModelStatusEnum.Debugger]: ''
}

export const LineModeEnum = {
  Straight: 1,
  Broken: 2
}