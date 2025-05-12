<template>
  <div class="debugger-list">
    <div
      v-for="group in buttonGroups"
      :key="group.id"
      class="rule-design-button-group"
    >
      <template v-if="!group.vif || group.vif(designer)">
        <template v-for="btn in group.children">
          <template v-if="!btn.vif || btn.vif(designer)">
            <component
              v-if="btn === 'RuleDebugButton' || btn.type === 'RuleDebugButton'"
              v-show="designer && !designer.debugging"
              :is="btn.type"
              :key="btn.type"
              :disabled="btn.disabled"
              v-bind="btn"
              @command="onCommand"
            ></component>
            <component
              v-else-if="
                btn === 'RuleRestartButton' || btn.type === 'RuleRestartButton'
              "
              v-show="designer && designer.debugging"
              :is="btn.type"
              :key="btn.type"
              :disabled="btn.disabled"
              v-bind="btn"
              @command="onCommand('RuleDebugRestart')"
            ></component>
            <component
              v-else
              :is="btn.type"
              :key="btn.type"
              :disabled="btn.disabled"
              v-bind="btn"
              @command="onCommand"
            >
            </component>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { components as RuleDesignButtons } from './buttons'

import { isString } from 'lodash'

import bus from '../js/bus'

const DEFAULT_BUTTON_GROUPS = [
  {
    id: 'layout',
    children: [
      { type: 'LayoutAlignTopButton' },
      { type: 'LayoutAlignHorizontalCenterButton' },
      { type: 'LayoutBottomJustifyButton' },
      { type: 'LayoutLeftJustifyButton' },
      { type: 'LayoutAlignVerticalCenterButton' },
      { type: 'LayoutRightAlignmentButton' },
      { type: 'LayoutHorizontalAveragingButton' },
      { type: 'LayoutVerticalAveragingButton' }
    ]
  },
  {
    id: 'run',
    children: [
      'RuleExecuteButton',
      'RuleDebugButton',
      'RuleRestartButton'
      // { type: 'RuleSuspendButton', disabled: true },
      // { type: 'RuleNextButton', disabled: true },
      // { type: 'RuleToTheEndButton', disabled: true },
      // { type: 'RuleStopButton', disabled: true }
    ]
  },
  {
    id: 'preview',
    children: ['PreviewDesignJsonButton']
  },
  {
    id: 'setting',
    vif(designer) {
      return designer && (designer.isTemplateEditMode || designer.isManager)
    },
    children: ['RulePermissionSettingButton']
  }
]

export default {
  name: 'DebuggerList',
  inject: {
    designer: {
      default: null
    }
  },
  components: {
    ...RuleDesignButtons
  },
  props: {
    buttons: {
      type: Array,
      default() {
        return DEFAULT_BUTTON_GROUPS
      }
    }
  },
  computed: {
    buttonGroups() {
      let groups = [].concat(this.buttons || [])
      groups = groups.map((group) => {
        if (isString(group)) {
          group = {
            id: group,
            children: []
          }
        }
        group.children = group.children || []
        group.children = group.children.map((btn) => {
          if (isString(btn)) {
            btn = {
              type: btn
            }
          }
          return btn
        })
        return group
      })
      return groups
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {
    onCommand(command) {
      this.$emit('command', command)
      bus.$emit('command', command)
      bus.$emit(command)
    }
  }
}
</script>

<style lang="less" scoped>
.debugger-list {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.debugger-item {
  margin: 0 10px;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;

  &.anticon {
    font-size: 20px;
  }
}

.debugger-item:hover {
  background-color: #595959;
}
</style>
