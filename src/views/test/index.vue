<template>
  <div>
    <input type="text" v-model="val" />
    <button @click="send">send</button>
  </div>
</template>

<script>
import axios from "axios";
import * as RongIMLib from "@rongcloud/imlib-v4";
axios.defaults.headers.token = "644cf612-3e4f-428b-95d0-9cbf8761df31";
export default {
  data() {
    return {
      val: ""
    };
  },

  components: {},

  watch: {},

  computed: {},

  mounted() {
    axios.get("/test/rongcloud/getImToken").then(res => {
      if (res.data.code === 0) {
        const { appKey, token } = res.data.data;
        // const token =
        //   "ddEYqqjYbialSr1vyBs75Z6hJgJAa/wUIlONAcfPhivNgtzrGFH0CQ==@yawa.cn.rongnav.com;yawa.cn.rongcfg.com";
        // const appKey = "c9kqb3rdc6zij";
        const im = RongIMLib.init({ appkey: appKey });
        im.watch({
          // 监听会话列表变更事件
          conversation(event) {
            // 假定存在 getExistedConversationList 方法，以获取当前已存在的会话列表数据
            // const conversationList = [];
            const updatedConversationList = event.updatedConversationList;
            // 通过 im.Conversation.merge 计算最新的会话列表
            // const latestConversationList = im.Conversation.merge({ conversationList, updatedConversationList })
            console.log(updatedConversationList, 999);
          },
          // 监听消息通知
          message(event) {
            // 新接收到的消息内容
            const message = event.message;
          },
          // 监听 IM 连接状态变化
          status(event) {
            console.log("connection status:", event.status);
          },
          // 监听聊天室 KV 数据变更
          chatroom(event) {
            /**
             * 聊天室 KV 存储数据更新
             * @example
             * [
             *  {
             *    "key": "name",
             *    "value": "我是小融融",
             *    "timestamp": 1597591258338,
             *    "chatroomId": "z002",
             *    "type": 1 // 1: 更新（ 含:修改和新增 ）、2: 删除
             *  },
             * ]
             */
            const updatedEntries = event.updatedEntries;
          },
          expansion(event) {
            /**
             * 更新的消息拓展数据
             * @example {
             *    expansion: { key: 'value' },      // 设置或更新的扩展值
             *    messageUId: 'URIT-URIT-ODMF-DURR' // 设置或更新扩展的消息 uid
             * }
             */
            const updatedExpansion = event.updatedExpansion;
            /**
             * 删除的消息拓展数据
             * @example {
             *    deletedKeys: ['key1', 'key2'],    // 设置或更新的扩展值
             *    messageUId: 'URIT-URIT-ODMF-DURR' // 设置或更新扩展的消息 uid
             * }
             */
            const deletedExpansion = event.deletedExpansion;
          }
        });
        console.log(token, 666, im);
        // im.disconnect().then(() => console.log('断开链接成功'));
        // return
        // im.reconnect({ token: token }).then(() => console.log('lijian')).catch(e => console.log(e, 99));
        // return;
        im.connect({ token: token })
          .then(user => {
            console.log("链接成功, 链接用户 id 为: ", user.id);
            // 获取指定会话的抽象实例，对于会话的操作基于此实例完成
            // const conversation = im.Conversation.get({
            //   // targetId
            //   targetId: 100000010,
            //   // 会话类型：RongIMLib.CONVERSATION_TYPE.PRIVATE | RongIMLib.CONVERSATION_TYPE.GROUP
            //   type: RongIMLib.CONVERSATION_TYPE.PRIVATE
            // });
            // // 向会话内发消息
            // conversation
            //   .send({
            //     // 消息类型，其中 RongIMLib.MESSAGE_TYPE 为 IMLib 内部的内置消息类型常量定义
            //     messageType: RongIMLib.MESSAGE_TYPE.TEXT, // 'RC:TxtMsg'
            //     // 消息内容
            //     content: {
            //       content: "Hello RongCloud2222" // 文本内容
            //     }
            //   })
            //   .then(function (message) {
            //     console.log("发送文字消息成功", message);
            //   })
            //   .catch(error => {
            //     console.log("发送文字消息失败", error.code, error.msg);
            //   });
          })
          .catch(error => {
            console.log("链接失败: ", error);
          });
      }
    });
  },

  methods: {
    send() {
      // this.val
      const content = {
        type: "task", // message(普通消息类型) | task(任务邀请，附带id) | reward(报酬单) | newChat(发起沟通，一般附带id)
        message: "",
        taskId: "44"
      }
      const params = {
        content: JSON.stringify(content),
        platformType: "Worker",
        targetId: "Worker_100000023"
      };
      axios
        .post("/test/rongcloud/send", params)
        .then(res => console.log("发送成功"));
    }
  }
};
</script>
<style></style>
