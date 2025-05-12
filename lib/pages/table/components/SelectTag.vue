<template>
  <a-select v-model="valueComp" allow-clear @change="handleChange">

    <a-select-option v-for="tag in tagData" :value="tag.id" :key="tag.id">
      {{ tag.name }}
    </a-select-option>
  </a-select>
</template>

<script>
import { getTags as getTagApi } from '../../../api/table'

export default {
  name: 'SelectTag',
  components: {},
  props: {
    value: { type: [Number, String], default: null },
    ignoreKey: { type: [Number, String], default: null }
  },
  data () {
    return {
      tagData: [{ id: '0', name: '全部' }]
    }
  },
  computed: {
    valueComp: {
      get () {
        return this.value
      },
      set (newVal) {
        this.$emit('input', newVal)
      }
    }
  },
  mounted () {
    this.loadTagData()
  },
  methods: {
    loadTagData () {
      getTagApi().then((res) => {
        res = res || []
        this.tagData = [{ id: '0', name: '全部' }].concat(
          res.map((item) => ({ ...item, id: item.id + '' }))
        )
      })
    },
    handleChange () {
      this.$emit('change', ...arguments)
    }
  }
}
</script>