<template>
  <div class="full">
    <div class="control">
      <div>
        <img src="@/assets/images/control.png">
        <span class="name">控件</span>
      </div>
    </div>
    <div class="control-button">
      <ButtonWithIcon v-for="item in controls"
                      class="button"
                      :key="item.code"
                      :buttonName="item.name"
                      :isActive="item.code === currentControlKey"
                      :iconLink="item.icon"
                      draggable
                      @click.native="onClick(item)"
                      @dragstart.native="onDragstart(item)" />
    </div>
  </div>
</template>

<script>
import ButtonWithIcon from '../../../../components/ButtonWithIcon.vue'

import PanelMixin from './mixins/panel'

export default {
  name: 'RuleControls',
  mixins: [PanelMixin],
  components: {
    ButtonWithIcon
  },
  panel: {
    id: 'RuleControls',
    title: '控件',
    icon: {
      type: 'bars',
      color: 'inherit'
    }
  },
  props: {
    controls: { type: Array, default () { return [] } }
  },
  data () {
    return {
      currentControlKey: null
    }
  },
  methods: {
    onClick (controlItem) {
      this.currentControlKey = controlItem.code
      this.$emit('click', controlItem)
    },
    onDragstart (controlItem) {
      this.$emit('dragstart', controlItem)
    }
  }
}
</script>
