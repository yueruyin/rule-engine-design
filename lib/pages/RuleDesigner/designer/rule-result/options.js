// ========================================================
// 允许的结果选项
// @author wangyb
// @createTime 2023-05-23 09:01:41
// ========================================================

export default [
  {
    value: 'executeResult',
    label: '执行结果配置',
    children: [
      {
        value: 'basicInfo',
        label: '基础信息',
        previewPath: 'data',
        preview: {
          'id': 372,
          'code': '20230515114706',
          'version': '1.0',
          'businessId': '1',
          'executeId': '2Q84F9ljAXW4uLHh13WjVCHuV3k'
        }
      },
      {
        value: 'time',
        label: '执行时间',
        previewPath: 'data',
        preview: {
          'executeTime': '10225μs',
          'startExecuteTime': 1684825097900902,
          'endExecuteTime': 1684825097910110
        }
      },
      {
        value: 'arguments',
        label: '执行参数',
        preview: {
          '执行参数1': '7.00',
          '执行参数2': '8.00'
        }
      },
      {
        value: 'tracks',
        label: '执行过程',
        preview: [
          {
            'name': '开始',
            'code': 'start',
            'type': 'start',
            'executeTime': '74μs',
            'input': {},
            'output': {},
            'status': '0',
            'error': ''
          },
          {
            'name': '计算节点',
            'code': 'compute',
            'type': 'compute',
            'executeTime': '187μs',
            'input': {},
            'output': {
              '计算结果1': '7.00'
            },
            'status': '0',
            'error': ''
          },
          {
            'name': 'end',
            'code': 'end',
            'type': 'end',
            'executeTime': '6μs',
            'input': {
              '执行参数1': '7.00',
              '执行参数2': '8.00'
            },
            'output': {
              '计算结果1': '7.00',
              '计算结果2': '8.00'
            },
            'status': '0',
            'error': ''
          }
        ]
      },
      {
        value: 'result',
        label: '返回结果',
        preview: {}
      },
      {
        value: 'compress',
        label: '是否压缩',
        preview: false
      }
    ]
  },
  {
    value: 'resultArguments',
    label: '返回结果配置',
    // 生成一个勾选组，选中的值将会绑定到分组中
    type: 'checkgroup',
    // 判断是否禁用
    disabled: function (checkedOptions) {
      return !checkedOptions.result
    },
    // 自动查找是否传入 load + 分组名的方法作为数据源
    dataSourceType: 'method'
  }
]