<template>
  <div class="tree dark">
    <slot name="beforeSearch"></slot>
    <div v-if="searchable"
         class="search-wrapper">
      <a-input-search :placeholder="searchPlaceholder"
                      @change="handleTreeSearchChange"></a-input-search>
    </div>
    <slot name="beforeTree"></slot>
    <a-spin :spinning="loading"
            wrapper-class-name="p-10 min-h-200">
      <a-tree ref="tree"
              :selected-keys.sync="selectedKeys"
              :tree-data="treeData"
              :expanded-keys="expandedKeys"
              :auto-expand-parent="autoExpandParent"
              :load-data="loadData"
              :replace-fields="replaceFields"
              :show-line="treeShowLine"
              :show-icon="treeShowIcon"
              :selectable="treeSelectable"
              class="tree-content"
              @expand="onExpand"
              v-on="$listeners">
        <a-icon class="expend-icon"
                slot="switcherIcon"
                type="caret-down" />
        <template slot="title"
                  slot-scope="node">
          <span class="tree-node"
                :title="(treeNodeHitHandler && treeNodeHitHandler(node)) || node.title"
                @click="onNodeClick(node, $event)">
            <template v-if="node.icon">
              <!-- 目录树的目录开关控制 -->
              <a-icon v-if="node.icon === 'folder' && expandedKeys.includes(node.key) && node.children && node.children.length"
                      slot="icon"
                      type="folder-open"
                      class="m-r-10"></a-icon>
              <a-icon v-else
                      slot="icon"
                      :type="node.icon"
                      class="m-r-10" />
            </template>
            <span v-if="searchValue && node.selectable !== false && node.title.indexOf(searchValue) > -1"
                  :style="{'border-bottom': '1px solid ' + searchHighlightColor}">
              {{ node.title.substr(0, node.title.indexOf(searchValue)) }}
              <span :style="{ color: searchHighlightColor }">{{ searchValue }}</span>
              {{ node.title.substr(node.title.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ node.title }}</span>
          </span>
        </template>
      </a-tree>
      <a-empty v-if="!treeData || !treeData.length"
               :image="emptyImage" />
    </a-spin>
  </div>
</template>

<script>
import TreeMixin from './mixin'
import { flatten, uniq } from 'lodash'

import { Empty } from 'ant-design-vue'

export default {
  name: 'RuleDesignTree',
  mixins: [TreeMixin],
  props: {
    emptyImage: {
      type: [String, Object],
      default() {
        return Empty.PRESENTED_IMAGE_SIMPLE
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal !== this.selectedKeys) {
          this.selectedKeys = newVal || []
        }
      },
      immediate: true
    },
    selectedKeys(newVal) {
      if (this.value !== newVal) {
        this.$emit('input', newVal)
        this.$emit('change', newVal)
      }
    }
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },

    expandNode(nodeId) {
      this.expandedKeys = this.expandedKeys || []
      // 更新成功
      if (nodeId && !this.expandedKeys.includes(nodeId)) {
        let path = this.getNodePath(this.treeData, nodeId, true) || []
        // 展开节点
        let expandedKeys = this.expandedKeys.concat(
          path.map((item) => item.key)
        )
        uniq(expandedKeys)
        this.expandedKeys = expandedKeys
      }
    },

    handleTreeSearchChange(e) {
      this.searchValue = e.target.value
      this.onSearch(this.searchValue)
    },

    showLoading() {
      this.loading = true
    },

    hideLoading() {
      this.loading = false
    }
  }
}
</script>

<style lang='less' scoped>
.tree {
  width: 100%;
  /deep/.ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background: #414141;
    span {
      color: #fff;
    }
  }

  /deep/.ant-tree-node-content-wrapper {
    &:hover {
      background: none;
    }
  }
  /deep/.ant-tree-title {
    color: #afafaf;
  }
  .expend-icon {
    color: #fff;
  }

  /deep/.ant-tree-node-content-wrapper {
    width: calc(100% - 24px);
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ffffff;
  }

  /deep/.ant-empty-image {
    & > svg {
      position: relative;
      left: 25%;
      margin-left: -50%;
    }
  }
}

.search-wrapper {
  padding: 0px 10px;
  margin-top: 10px;

  /deep/.ant-input {
    background: #2c2c2c;
    color: #fff;
    border-color: #595959;
  }
  /deep/.ant-input-search-icon {
    color: #fff;
  }
}

.operate-btns {
  padding: 0px 10px;
  margin-top: 10px;
}

.tree-content {
  // padding: 0px 10px;
  // margin-top: 10px;
}

.tree-operate-btn {
  margin-right: 10px;
  width: 28px;
  height: 28px;
  line-height: 26px;
  font-size: 12px;
}

.tree-operate-btn--success {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #ffffff;
}

.tree-node {
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>