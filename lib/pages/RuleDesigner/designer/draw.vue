<template>
  <div class="draw">
    <div v-if="showToolbar"
         class="debugger-list">
      <DebuggerList />
    </div>
    <div ref="container"
         class="ruledesign_container"
         :style="{ height: showToolbar ? 'calc(100% - 40px)' : '100%'}"
         ondragstart="return false;"
         @dragover="createControlOver"
         @drop="createControlDrop"
         @contextmenu.prevent
         @scroll="onContainerScroll"></div>
  </div>
</template>
<script>
/* eslint-disable no-undef */
import bus from '../js/bus.js'
import RDSetting from '../js/ruledesigner_setting.js'
import '../js/ruledesigner.js'

import DebuggerList from './DebuggerList.vue'

import {
  defineUnenumerableProperty,
  addClass,
  removeClass
} from '../js/components/modules/common'
import { RULE_ALL_PERMISSION } from '../config/permission.js'

export default {
  name: 'RuleDesignDraw',
  components: {
    DebuggerList
  },
  inject: {
    designer: {}
  },
  props: {
    showToolbar: { type: Boolean, default: true }
  },
  data() {
    return {
      rdInfo: {},
      // 记录是初始化选中节点
      initNode: false
    }
  },
  watch: {
    'designer.stepActive': {
      handler(val) {
        if (val == 2 && !this.initNode) {
          this.initNode = true
          // 设置默认选中开始节点，并初始化ruleDesigner的结构数据
          let begin = this.rdInfo.rootModels['proc_act33_1619610840528']
          begin.makeSelection()
          this.rdInfo.clickTab(begin)
        }
      }
    }
  },
  methods: {
    // 拖拽元素放开，创建元素
    createControlDrop(e) {
      if (window.tempCreateControlData) {
        if (window.tempCreateControlData.X < 0) {
          window.tempCreateControlData.X = 0
        }
        if (window.tempCreateControlData.Y < 0) {
          window.tempCreateControlData.Y = 0
        }
        // 模板编辑时，拖入组件，默认设置所有权限
        if (this.designer.isTemplateEditMode) {
          window.tempCreateControlData.permission = RULE_ALL_PERMISSION
        }
        // 创建控件
        let newControl = initNode(window.tempCreateControlData, this.rdInfo)
        newControl.width = newControl.width * this.rdInfo.scale
        newControl.height = newControl.height * this.rdInfo.scale
        newControl.attrs.width = newControl.width
        newControl.attrs.height = newControl.height
        newControl.makeSelection()
        newControl.updateShape()
        // 给控件定义画布对象，不会序列化
        defineUnenumerableProperty(newControl, '__canvas__', this.rdInfo)
        window.tempCreateControlData = null
      }

      this.designer.changed = true
    },

    // 拖拽元素移动
    createControlOver(e) {
      if (RDSetting.GLOBAL_CREATE_BEFORE_VALIDATOR) {
        eval(
          'window.canCreate = ' +
            RDSetting.GLOBAL_CREATE_BEFORE_VALIDATOR +
            '(window.tempCreateControlData,this.rdInfo,e);'
        )
      }
      if (!window.canCreate) {
        window.canCreate = null
        window.tempCreateControlData = null
        return false
      } else {
        let layerX =
          e.clientX -
          this.rdInfo.getOffsetLeft(this.rdInfo.container) +
          this.rdInfo.container.scrollLeft
        let layerY =
          e.clientY -
          this.rdInfo.getOffsetTop(this.rdInfo.container) +
          this.rdInfo.container.scrollTop
        if (window.tempCreateControlData) {
          window.tempCreateControlData.X =
            layerX - window.tempCreateControlData.WIDTH / 2
          window.tempCreateControlData.Y =
            layerY - window.tempCreateControlData.HEIGHT / 2
          e.preventDefault()
        }
        window.canCreate = null
      }
    },

    setAttr(obj) {
      this.rdInfo.setAttr(obj)
      try {
        if (obj.valueChangeListener) {
          // eslint-disable-next-line
          eval(
            obj.valueChangeListener +
              '(tempPDCanvas, tempModel,obj,oldvalue,newvalue);'
          )
        }
      } catch (e) {}
    },

    setAttributes(obj, md) {
      let params = []
      for (let i = 0; i < obj.length; i++) {
        params[params.length] = {
          code: obj[i].field ? obj[i].field : obj[i].CP_CODE,
          value: obj[i].value,
          groupname: obj[i].GROUPNAME,
          datatype: obj[i].type,
          cascade: obj[i].CASCADE,
          cascade_group: obj.CASCADE_GROUP
        }
      }
      // this.rdInfo.setAttributes(params, md)
      this.rdInfo.setAttributesByList(params, md)
    },
    // 流程图点击事件
    rdClick(shape, mustRefresh) {
      if (
        this.upShape == null ||
        this.upShape != shape ||
        mustRefresh == true
      ) {
        this.upShape = shape
        // bus.$emit('showAttr', shape)
        // bus.$emit('modelSelect', shape)
        this.$emit('model-select', shape)
      }
    },

    // TODO 未知
    findControlProperty: function (controlProperties, code) {
      for (let i = 0; i < controlProperties.length; i++) {
        let eles = controlProperties[i]
        for (let j = 0; j < eles.children.length; j++) {
          let ele = eles.children[j]
          if (ele.CP_CODE == code) {
            return ele
          }
        }
      }
    },
    getContainer() {
      return this.$refs.container
    },

    onContainerScroll() {
      this.rdInfo?.renderMap()
    }
  },
  mounted() {
    bus.$on('initRD', (json, id) => {
      // eslint-disable-next-line no-undef
      this.rdInfo = initRD(this.$refs.container, json)
      this.rdInfo.clickTab = this.rdClick
      this.rdInfo.setCanMove(false)
      this.$emit('event', this.rdInfo)
      let x = 0
      let y = 0
      for (let id in this.rdInfo.rootModels) {
        if (x < this.rdInfo.rootModels[id].x) {
          x = this.rdInfo.rootModels[id].x
        }
        if (y < this.rdInfo.rootModels[id].y) {
          y = this.rdInfo.rootModels[id].y
        }
      }
      x += 300
      y += 300

      this.rdInfo.setStageSize(x, y)
    })
    bus.$on('drawNode', (data) => {
      let e = window.event
      // 判断鼠标位置是否在绘图区
      let x = e.pageX
      let y = e.pageY
      let div = this.$refs.container
      let divx1 = div.offsetLeft
      let divy1 = div.offsetTop
      let divx2 = div.offsetLeft + div.offsetWidth
      let divy2 = div.offsetTop + div.offsetHeight

      // eslint-disable-next-line no-empty
      if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
      } else {
        data.X = x - divx1
        data.Y = y - divy1
        // eslint-disable-next-line no-undef
        initNode(data, this.rdInfo)
      }
    })
    bus.$on('initLine', (obj) => {
      // eslint-disable-next-line no-undef
      initLine(obj, this.rdInfo)
    })

    bus.$on('saveRD', (obj) => {
      this.saveRD(obj)
    })
  }
}
</script>
<style scoped lang="less">
.draw {
  width: 100%;
  height: 100%;
  position: relative;

  .debugger-list {
    height: 40px;
    background: #212121;
    border-bottom: 1px solid #080808;
  }
  .ruledesign_container {
    background-color: #2c2c2c !important;
    height: calc(100% - 40px);
    overflow: auto;
    // overflow: hidden;
    // position: relative;
  }

  // 设置单边阴影，用来表示拖拽的边
  .shadow-only-bottom {
    box-shadow: 0px 7px 7px -7px #5e5e5e;
  }
  .shadow-only-right {
    box-shadow: 7px 0px 7px -7px #5e5e5e;
  }
  .shadow-only-left {
    box-shadow: -7px 0px 7px -7px #5e5e5e;
  }
  .showdow-only-top {
    box-shadow: 0px -7px 7px -7px #5e5e5e;
  }
}
</style>