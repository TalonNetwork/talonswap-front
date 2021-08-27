interface Params {
  url: string;
  channel: string;
  params: any;
  success: (data: any) => void;
  error?: () => void;
}

interface Socket {
  [key: string]: WebSocketBuilder;
}

interface UpdateHandle {
  [key: string]: Callback[];
}

type Callback = (data: any) => void;

class WebSocketBuilder {
  static sockets: Socket = {};

  timeout: number;
  timer1: any;
  timer2: any;
  lockReconnect: boolean;
  url: string;
  updateHandle: UpdateHandle;
  ws: WebSocket | null;
  status: string;
  // onOpen: () => void
  onOpen = () => {};
  constructor(url: string) {
    this.timeout = 20000;
    this.timer1 = null;
    this.timer2 = null;
    this.lockReconnect = false;
    this.url = url;
    this.updateHandle = {};
    this.ws = null;
    this.status = "";
    // this.connect();
    // this.initEvent();
  }

  connect(onOpen: () => void) {
    const ws = (this.ws = new WebSocket(this.url));
    this.status = "";
    // const ws = this.ws;
    // if (!ws) return;
    this.onOpen = onOpen;
    ws.onopen = () => {
      // this.status = true;
      onOpen();
      this.heartCheck();
    };
    ws.onmessage = msg => {
      // 每次接收到消息都执行一次心跳
      this.heartCheck();
      this.handleMessage(msg);
    };
    ws.onclose = data => {
      // this.status = false;
      // this.status = "close";
      this.reconnect();
      console.error("连接关闭", data);
    };
    ws.onerror = err => {
      // this.status = false;
      this.reconnect();
      console.error("连接发生异常, 即将重新连接:", err);
    };
  }

  /* initEvent() {
    const ws = this.ws;
    if (!ws) return;
    ws.onopen = () => {
      // this.status = true;
      this.heartCheck();
    };
    ws.onmessage = msg => {
      // 每次接收到消息都执行一次心跳
      this.heartCheck();
      this.handleMessage(msg);
    };
    ws.onclose = data => {
      // this.status = false;
      this.reconnect();
      console.error("连接关闭, 即将重新连接", data);
    };
    ws.onerror = err => {
      // this.status = false;
      this.reconnect();
      console.error("连接发生异常, 即将重新连接:", err);
    };
  } */

  listen(channel: string, params: any, handle: Callback) {
    // console.log(this.ws?.readyState, 789)
    if (this.ws?.readyState === 0) {
      setTimeout(() => {
        this.listen(channel, params, handle);
      }, 200);
    } else {
      const existHandle = this.updateHandle[channel];
      if (existHandle && existHandle.length) {
        this.updateHandle[channel].push(handle);
      } else {
        this.updateHandle[channel] = [handle];
      }
      // const data = params ? ":" + JSON.stringify(params) : "";
      const msg = JSON.stringify({
        action: "Subscribe",
        ...params
      });
      this.send(msg);
    }
  }

  send(msg: string) {
    this.ws?.send(msg);
  }

  unListen(channel: string) {
    if (this.ws?.readyState === 0) {
      setTimeout(() => {
        this.unListen(channel);
      }, 200);
    } else {
      delete this.updateHandle[channel];
      this.send(JSON.stringify({ action: "Unsubscribe", channel }));
    }
  }

  handleMessage(msg: any) {
    // console.log(msg, "===msg===");
    const res = JSON.parse(msg.data);
    if (!res.data || !res.action) return;
    // console.log(res, 4564)
    switch (res.action) {
      case "Subscribe":
      case "Unsubscribe":
        break;
      case "Data":
        const data = JSON.parse(res.data);
        // console.log("method: "+ data.method, data)
        const handles = this.updateHandle[data.method];
        console.log("----method----", data.method);
        console.log("----" + data.method + "-res----", JSON.parse(data.data));
        if (handles && handles.length) {
          handles.forEach(handle => handle(JSON.parse(data.data)));
        }
        break;
      case "Error":
      // this.onError && this.onError(data);
    }
  }

  close() {
    this.ws?.close();
  }

  // 心跳检测
  heartCheck() {
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
    this.timer1 = setTimeout(() => {
      this.ws?.send(JSON.stringify({ ping: new Date().getTime() }));
      this.timer2 = setTimeout(() => {
        this.ws?.close();
      }, this.timeout);
    }, this.timeout);
  }

  reconnect() {
    if (this.lockReconnect || this.status === "close") return;
    this.lockReconnect = true;
    setTimeout(() => {
      //没连接上会一直重连，设置延迟避免请求过多
      this.connect(this.onOpen);
      this.lockReconnect = false;
    }, 2000);
  }
}

export function listen(data: Params) {
  const { url, channel, params, success } = data;
  const socket = WebSocketBuilder.sockets[url];
  if (!socket) {
    const newSocket = new WebSocketBuilder(url);
    WebSocketBuilder.sockets[url] = newSocket;
    newSocket.connect(() => {
      newSocket.listen(channel, params, success);
    });
  } else {
    if (socket.updateHandle[channel]) {
      socket.unListen(channel); // 先取消之前的
    }
    socket.listen(channel, params, success);
  }
}

export function unListen(url: string, channel: string) {
  const socket = WebSocketBuilder.sockets[url];
  if (!socket) {
    console.log("没有websocket任务，不需要关闭");
  } else {
    socket.unListen(channel);
  }
}

/* class _WebSocketBuilder {
  buildWs(url: string, handleErr: () => void) {
    return {
      status: false,
      url: url,
      onOpen: null,
      onMessage: null,
      handles: {},

      isConnected: function () {
        return this.status;
      },

      reLoad: function () {
        this.connect(this.url, this.onOpen, this.onMessage);
      },

      handleMessage: function (msg:string) {
        const data = JSON.parse(msg.data);
        switch (data.action) {
          case "Error": {
            if (handleErr) {
              handleErr(data);
            } else {
              console.error(data);
            }
            break;
          }
          case "Subscribe":
          case "Unsubscribe":
            //console.log(data);
            break;
          case "Data": {
            const handles = this.handles[data.channel];
            if (handles) {
              handles.forEach(handle => handle(data.data));
            }
          }
        }
      },

      listener: function (chancel, param, handle) {
        this.handles[chancel] = [handle];
        this.send(
          JSON.stringify({
            action: "Subscribe",
            channel: chancel + (param ? ":" + param : "")
          })
        );
      },
      unListener: function (chancel) {
        delete this.handles[chancel];
        this.send(JSON.stringify({ action: "Unsubscribe", channel: chancel }));
      },
      connect: function (onOpen) {
        this.url = url;
        this.onOpen = onOpen;
        //this.onMessage = onMessage;
        const ws = (this.ws = new WebSocket(url));

        ws.onopen = () => {
          this.status = true;
          onOpen();
        };
        ws.onmessage = this.handleMessage.bind(this);
        ws.onclose = data => {
          this.status = false;
          console.error("链接已关闭:", data);
        };
        ws.onerror = err => {
          console.error("连接发生异常:", err);
        };
      },
      send: function (msg) {
        try {
          this.ws.send(msg);
        } catch (err) {
          console.log(err);
        }
      },
      beat: function (command) {
        const sent = () => {
          setTimeout(() => {
            if (this.status) {
              try {
                this.send(command);
              } catch (e) {
                console.log(e);
              }
              sent();
            } else {
              this.reLoad();
            }
          }, 5000);
        };
        sent();
      }
    };
  }
}

const ws = {};


export function listener({wsUrl, channel, param, handle, handleErr}: ListenerParams) {
  //console.log("启动:" + channel);
  //@ts-ignore
  if (ws[wsUrl]) {
    //@ts-ignore
    ws[wsUrl].listener(channel, param, handle);
  } else {
    const wsConn = new _WebSocketBuilder().buildWs.bind({})(wsUrl, handleErr);
    wsConn.connect(() => {
      //console.log(wsUrl + " connected");
      //@ts-ignore
      ws[wsUrl] = wsConn;
      wsConn.beat(JSON.stringify({ ping: new Date().getTime() }));
      //@ts-ignore
      ws[wsUrl].listener(channel, param, handle);
    });
  }
}

export function unListener({wsUrl, channel}: ListenerParams) {
  //console.log("关闭:" + channel);
  //@ts-ignore
  if (ws[wsUrl]) {
    //@ts-ignore
    ws[wsUrl].unListener(channel);
    return;
  } else {
    console.log("没有websocket任务，不需要关闭");
  }
}
 */
