// ========================================================
// 图形用到的默认值等
// @author wangyb
// @createTime 2023-06-19 11:53:02
// ========================================================

import { inPolygon } from '../modules/math'
import { ColorEnum } from './common'

export const RectShapeConfig = {
  radius: 3,
  padding: 10,
  color: '#ffffff',
  fontSize: 12,
  fontFamily: 'Arial Normal',
  iconWidth: 14,
  iconHeight: 14,
  headerHeight: 24,
  headerColor: '#ffffff',
  headerFontSize: 12,
  headerFill: '#3662EC',
  headerFillSelected: '#233661',
  headerFillExecuted: ColorEnum.Success,
  headerFillExecuting: ColorEnum.Warn,
  headerFillError: ColorEnum.Danger,
  bodyFontSize: 12,
  bodyFill: '#ffffff',
  descHeight: 24,
  descFill: '#f3f3f3',
  descFontSize: 12,
  descColor: '#2c3e50',
  border: '0 solid transparent',
  borderWidth: 0,
  borderType: 'solid',
  borderColor: 'transparent',
  borderSelected: '3 solid #2461ef',
  borderWidthSelected: 3,
  borderTypeSelected: 'solid',
  borderColorSelected: '#2461ef',
  fill: '#ffffff',
  fillSelected: '#233661',
  fillExecuted: ColorEnum.Success,
  fillExecuting: ColorEnum.Warn,
  fillError: ColorEnum.Danger
}

export const RectSideLineSeq = ['top', 'right', 'bottom', 'left']

export const RectSideLinePropMap = {
  stroke: 'color',
  'stroke-width': 'width',
  'stroke-dasharray': 'dash'
}

export const DiamondShapeConfig = Object.assign({}, RectShapeConfig, {
  fill: '#3662ec'
})

export const RectSideCompareTypes = {
  // top
  [RectSideLineSeq[0]]: inPolygon.LE,
  // right
  [RectSideLineSeq[1]]: inPolygon.LE,
  // bottom
  [RectSideLineSeq[2]]: inPolygon.GE,
  // left
  [RectSideLineSeq[3]]: inPolygon.GE
}