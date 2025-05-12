<template>
   <a-select mode="multiple"
                          placeholder="请选择角色" @change="handleChange" v-model = "roleGroup">
           <a-select-option v-for="item in roleInfo"
                         :key="item.id">
            {{ item.rolename }}
          </a-select-option>
    </a-select>
  </template>
<script>
import { getRoleData as getRoleListApi, getGroupRoleIds as getGroupRoleIdsApi } from '../../../api/table'
export default {
    name: 'RoleSelect',
    components: {
    },
    props: {
        groupInfo: {
            type: Object,
            default: null
        },
    },
    data () {
        return {
        roleInfo: [],
        roleGroup: []
        }
    },
    created () {
        if (this.groupInfo.id != null){
            getGroupRoleIdsApi(this.groupInfo.id).then(res => {
                this.roleGroup = res.map(item => item.role_id)
                this.$emit('selected-event', this.roleGroup)
            })
        }
    },
    watch: {
    },
    computed: {
    },
    mounted () {
        this.loadRoleData()
    },
    methods: {
        loadRoleData () {
        getRoleListApi().then(res => {
            this.roleInfo = res
        })
        },
        handleChange(value) {
           this.$emit('selected-event', value)
        },
    }
}
</script>
