import Mock from 'mockjs2'
const random = Mock.Random

export default {
  'get#/activiti/process/list': ({ body, url }) => {
    return {
      'code': 0,
      'msg': 'success',
      'data': [{
        'children': [{
          'comment': [{
            'content': '',
            'type': 'comment'
          }],
          'prevTaskDefId': '',
          'prevTaskId': '',
          'prevTaskName': '',
          'taskHandleTime': '2022-02-24 11:10:29',
          'taskHandleType': '1',
          'taskHandleTypeName': '同意',
          'taskHandler': {
            'actualId': '',
            'actualName': '',
            'actualType': '',
            'id': '1457523429199695874',
            'name': '陈运龙',
            'scope': '',
            'type': '1'
          },
          'taskId': '1496683923726409731',
          'taskReceiver': null,
          'taskSendTime': '2022-02-24 11:10:29',
          'taskSender': null
        }],
        'prewTaskId': 'start',
        'taskDefId': 'proc_act33_1619610840528',
        'taskName': '饮酒报备审批发起',
        'taskReceiveTime': '2022-02-24 11:10:29'
      }, {
        'children': [{
          'comment': [{
            'content': '测试',
            'type': 'comment'
          }],
          'prevTaskDefId': '',
          'prevTaskId': '',
          'prevTaskName': '',
          'taskHandleTime': '2022-02-24 11:11:06',
          'taskHandleType': '1',
          'taskHandleTypeName': '同意',
          'taskHandler': {
            'actualId': '1495571254244028417',
            'actualName': '夏红霞3',
            'actualType': '1',
            'id': '1457239331147108354',
            'name': '黄秋安',
            'scope': '',
            'type': '1'
          },
          'taskId': '1496683924305223684',
          'taskReceiver': null,
          'taskSendTime': '2022-02-24 11:10:29',
          'taskSender': {
            'actualId': '',
            'actualName': '',
            'actualType': '',
            'id': '1457523429199695874',
            'name': '陈运龙',
            'scope': '',
            'type': '1'
          }
        }],
        'prewTaskId': '1496683923726409731',
        'taskDefId': 'proc_act33_16362695408426331',
        'taskName': '单位领导意见22',
        'taskReceiveTime': '2022-02-24 11:10:29'
      }]
    }
  }
}
