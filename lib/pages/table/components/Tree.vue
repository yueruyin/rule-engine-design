<template>
  <RuleDesignTree ref="tree"
                  v-model="selectedKeys"
                  :tree-data="treeData"
                  @select="onSelect">
    <template #beforeTree>
      <div class="operate-btns">
        <a-button icon="plus"
                  type="primary"
                  class="tree-operate-btn"
                  title="新增"
                  @click="onAddClick"></a-button>
        <a-button icon="edit"
                  class="tree-operate-btn tree-operate-btn--success"
                  title="编辑"
                  @click="onUpdateClick"></a-button>
        <a-button icon="delete"
                  type="danger"
                  class="tree-operate-btn"
                  title="删除"
                  @click="onDeleteClick"></a-button>
        <a-button icon="redo"
                  type="info"
                  class="tree-operate-btn"
                  title="刷新"
                  @click="refreshTree"></a-button>
      </div>
    </template>
  </RuleDesignTree>
</template>

<script>
import {
  deleteGroup,
  getTreeData as getTreeDataApi,
  saveGroup
} from '../../../api/table'
import { awaitWrap } from '../../../../utils/sugars'
import { cloneDeep, uniq } from 'lodash'
import GroupModel from './GroupModel'
import RuleDesignTree from '../../../components/tree/index.vue'

import { confirm } from '../../../utils/confirm'

export default {
  name: 'Tree',
  components: {
    GroupModel,
    RuleDesignTree
  },
  props: {},
  data() {
    return {
      loading: false,
      treeData: [],
      expandedKeys: [],
      selectedKeys: [],
      autoExpandParent: false,
      searchValue: null
    }
  },
  created() {
    this.getTreeData()
  },
  mounted() {},
  methods: {
    setTreeData(data) {
      data.forEach((item) => {
        item.key = item.id
        item.title = item.name
        if (item.children.length) {
          this.setTreeData(item.children)
        }
      })
    },
    async getTreeData() {
      this.showLoading()
      let [err, data] = await awaitWrap(getTreeDataApi())
      if (!err) {
        data = data || []
        this.setTreeData(data)
        this.treeData = cloneDeep(data)
        this.treeData.unshift({
          title: '全部',
          key: ''
        })
        // 触发自动展开
        this.expandCurrentNode()
      }
      this.hideLoading()
    },
    refreshTree() {
      this.getTreeData()
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys, info) {
      this.$emit('selectedTree', selectedKeys)
    },
    onAddClick() {
      this.openGroupModel('新增分组', { parentId: this.selectedKeys[0] || 0 })
    },
    onUpdateClick() {
      if (!this.validateCurrentNode()) {
        return
      }
      this.openGroupModel(
        '编辑分组',
        this.$refs.tree.findNode(this.selectedKeys[0] || 0)
      )
    },
    onDeleteClick() {
      if (!this.validateCurrentNode()) {
        return
      }
      let groupId = this.selectedKeys[0]
      confirm(this, {
        title: '是否删除分组',
        content:
          '删除分组时将同时删除所有子分组，并将规则分组设置为默认分组，可以选择同时删除所有规则',
        buttons: [
          { key: 'deleteWithRules', title: '同时删除规则' },
          { key: 'deleteOnlyGroup', title: '仅分组' }
        ],
        closable: true,
        maskClosable: true
      }).then(({ key }) => {
        if (key === 'deleteWithRules') {
          this.deleteGroup(groupId, true)
        } else if (key === 'deleteOnlyGroup') {
          this.deleteGroup(groupId, false)
        }
      })
    },
    validateCurrentNode() {
      if (!this.selectedKeys || !this.selectedKeys.length) {
        this.message.warning('选中分组后操作')
        return false
      }
      if (!this.selectedKeys[0]) {
        this.message.warning('不能操作默认分组')
        return false
      }
      return true
    },
    deleteGroup(groupId, isContent) {
      this.showLoading()
      deleteGroup(groupId, isContent)
        .then((res) => {
          this.hideLoading()
          this.message.success('删除成功')
          this.refreshTree()
          this.selectedKeys = ['']
          this.onSelect(this.selectedKeys)
        })
        .catch((e) => {
          this.hideLoading()
          this.message.error('删除失败: ' + e.message)
        })
    },
    openGroupModel(title, groupInfo) {
      this.dialog({
        title: title,
        body: <GroupModel ref="groupModel" group-info={groupInfo} />,
        theme: 'dark',
        beforeClose: (type, close) => {
          if (type === 'confirm') {
            this.$refs.groupModel.submit().then((newGroupInfo) => {
              this.showLoading()
              saveGroup(newGroupInfo)
                .then(() => {
                  this.hideLoading()
                  // 展开节点
                  this.$refs.tree.expandNode(newGroupInfo.parentId)
                  // 刷新数据
                  this.refreshTree()
                  close()
                })
                .catch(() => {
                  this.hideLoading()
                })
            })
          } else {
            close()
          }
        }
      }).then(() => {
        this.$refs.groupModel.focus()
      })
    },
    getCurrentNodeKey() {
      return this.selectedKeys[0] || 0
    },
    setCurrentNodeKey(key) {
      this.selectedKeys =
        key !== null && key !== undefined ? [key] : this.selectedKeys
      // 触发自动展开
      this.expandCurrentNode()
    },
    expandCurrentNode() {
      this.$nextTick(() => {
        this.$refs.tree.expandNode(this.selectedKeys[0])
      })
    },
    showLoading() {
      const { tree } = this.$refs
      tree && tree.showLoading()
    },
    hideLoading() {
      const { tree } = this.$refs
      tree && tree.hideLoading()
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
  margin-top: 10px;
}

.tree-operate-btn {
  margin-right: 10px;
  width: 28px;
  height: 28px;
  line-height: 26px;
  font-size: 12px;
}

.tree-operate-btn--success {
  background-color: #0dbc79;
  border-color: #0dbc79;
  color: #ffffff;
}
</style>