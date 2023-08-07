module.exports = {
  singleRTCConnect,
};

let rooms = {};

/**
 * 建立音视频聊天
 * 1. 获取房间号和当前用户名
 * 2. createRoom 邀请人会发送创建房间指令,广播给当前房间的所有人,如果被邀请者在线的话,会接受到请求,自动打开语音/视频通话界面
 * 3. peer 被邀请人收到邀请后,前端点击同意后,会携带自己的音视频流数据发送peer指令给后端,后端在发送offer指令(携带了相对于的数据)给邀请人
 * 4. answer 邀请人接受到数据后将数据进行处理后发送answer指令给被邀请人并携带自己的音视频流
 * 5. ice_candidate 双方建立音视频通道后发送ice_candidate数据
 */
async function singleRTCConnect(ws, req) {
  //获取name
  let url = req.url.split("?")[1];
  let params = new URLSearchParams(url);
  let room = params.get("room");
  let username = params.get("username");
  if (!rooms[room]) {
    rooms[room] = {};
  }
  rooms[room][username] = ws;
  ws.on("message", async (Resp_data) => {
    let message = JSON.parse(Resp_data);
    let msg;
    let receiverWs;
    const { receiver_username } = message;
    switch (message.name) {
      // 通知好友打开音视频通话界面
      case "audio":
      case "video":
        if (!LoginRooms[receiver_username]) {
          ws.send(
            JSON.stringify({ name: "notConnect", result: "对方当前不在线!!!" })
          );
          return;
        }
        if (LoginRooms[receiver_username].status) {
          ws.send(
            JSON.stringify({ name: "notConnect", result: "对方正在通话中!!!" })
          );
          return;
        }
        if (LoginRooms[username].status) {
          ws.send(
            JSON.stringify({
              name: "notConnect",
              result: "你正在通话中,请勿发送其他通话请求....",
            })
          );
          return;
        }
        LoginRooms[username].status = true;
        LoginRooms[receiver_username].ws.send(Resp_data);
      //创建房间
      case "createRoom":
        //发送邀请
        msg = {
          name: message.mode,
          sender: username,
        };
        broadcastSocket(username, room, msg);
        break;
      //新用户加入
      case "new_peer":
        msg = {
          name: "new_peer",
          sender: username,
        };
        broadcastSocket(username, room, msg);
        break;
      //被邀请方接收
      case "offer":
        //发送offer
        msg = {
          name: "offer",
          sender: username,
          data: message.data,
        };
        receiverWs = rooms[room][message.receiver];
        receiverWs.send(JSON.stringify(msg));
        break;
      //接收answer
      case "answer":
        //接收answer
        msg = {
          name: "answer",
          sender: username,
          data: message.data,
        };
        receiverWs = rooms[room][message.receiver];
        receiverWs.send(JSON.stringify(msg));
        break;
      case "ice_candidate":
        //接收answer
        msg = {
          name: "ice_candidate",
          sender: username,
          data: message.data,
        };
        receiverWs = rooms[room][message.receiver];
        receiverWs.send(JSON.stringify(msg));
        break;
      //被邀请方拒绝
      case "reject":
        //发送offer
        msg = {
          name: "reject",
          sender: username,
        };
        broadcastSocket(username, room, msg);
        NotificationUser({
          name: "reject",
          receiver_username: username,
          message: "",
        });
        break;
    }
  });
  ws.on("close", () => {
    rooms[room][username] = "";
  });
}
//发送给其他人
const broadcastSocket = (username, room, data) => {
  for (const key in rooms[room]) {
    if (key == username) {
      continue;
    }
    if (rooms[room][key]) {
      let ws = rooms[room][key];
      ws.send(JSON.stringify(data));
    }
  }
};
