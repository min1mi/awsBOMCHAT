var moment = require('moment');
moment().format();

const express = require('express')
const datasource = require('../util/datasource')
const chatDao = require('../dao/chatDao')
const chatService = require('../service/chatService')

const connection = datasource.getConnection()
chatDao.setConnection(connection)
chatService.setChatDao(chatDao)

var clients = [];

const router = express.Router()


router.ws('/chat.json', function(ws, req) {
  console.log('router.ws 콜백함수 실행됨')
  var myMap = new Map;
  clients.push(myMap)
  console.log('client connected')


  ws.on('message', function(value) {
    // ws.send('서버에서 보냈어!' + msg);
    console.log(value)
    var obj = JSON.parse(value),
      msg = obj.message

    if (!myMap.has('user')) {
      var you = obj.you,
        me = obj.me,
        isTrainer = obj.isTrainer

      console.log(you)
      console.log(me)
      myMap.set('user', me)
      myMap.set('ws', ws)
      myMap.set('opponent', you)
      myMap.set('isTrainer', (isTrainer == 'Y' ? true : false))

      console.log('새로운 유저!\n유저 넘버: ' + myMap.get('user') +
        ', wsID: ' + myMap.get('ws')._socket._handle.fd +
        ', 상대방 넘버: ' + myMap.get('opponent'));

      setCommunicator(myMap)
      return;
    }
    var nowUTC = moment().utc(),
        now = moment().format("YYYY-MM-DD HH:mm:ss")

    if (myMap.has('oppMap')) {
      var data = JSON.stringify({
        'message': msg,
        'sender': 'you',
        'readChange': false,
        'datetime': nowUTC

      })
      broadcast(myMap, data)
    }

    if (myMap.get('isTrainer')) addTrainerChat(myMap, msg, myMap.has('oppMap'), now)
    else addChat(myMap, msg, myMap.has('oppMap'), now)
  })

  ws.on('close', function(reasonCode, description) {
    var result = removeClient(myMap)
    console.log(result)
  }) // ws,on('close')
});

function addChat(myMap, msg, confirm, now) {
  chatService.insert({
    'tno': myMap.get('opponent'),
    'mno': myMap.get('user'),
    'msg': msg,
    'date': now,
    'who': myMap.get('user'),
    'confirm': confirm ? true : false

  }, function(result) {
    console.log('DB insert success')

  }, function(error) {
    console.log('DB insert fail')
    console.log(error)

  }) //chatService.insert()
} //addChat()

function addTrainerChat(myMap, msg, confirm, now) {
  chatService.insert({
    'mno': myMap.get('opponent'),
    'tno': myMap.get('user'),
    'msg': msg,
    'date': now,
    'who': myMap.get('user'),
    'confirm': confirm ? true : false

  }, function(result) {
    console.log('DB insert success')

  }, function(error) {
    console.log('DB insert fail')
    console.log(error)

  }) //chatService.insert()
} //addTrainerChat()

function setCommunicator(myMap) {
  var oppMap;
  for (var i = 0; i < clients.length; i++) {
    oppMap = clients[i]
    if ((oppMap.get('opponent') == myMap.get('user')) &&
        (oppMap.get('user') == myMap.get('opponent'))) {
      console.log('상대도 온라인 상태');
      myMap.set('oppMap', oppMap)
      oppMap.set('oppMap', myMap)
      return;
    }
    console.log('상대는 오프라인');
  } //for()
} //broadcast()


function updateRead(myMap) {
  var data = {
    'sender': 'you',
    'readChange': true
  }

  if (myMap.get(isTrainer)) {
    chatService.update(myMap.get('opponent'), myMap.get('user'), function(result) {
      console.log('read Update')
      broadcast(myMap, JSON.stringify(data)) // 상대에게 내가 들어왔음을 알림
      myMap.get('ws').send(JSON.stringify(data)) // 나에게 상대도 온라인 상태임을 알림
    }, function(error) {
      res.status(200)
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .end('error')
      console.log(error)
    })
  } else {
    chatService.update(myMap.get('user'), myMap.get('opponent'), function(result) {
      console.log('read Update')
      broadcast(myMap, JSON.stringify(data)) // 상대에게 내가 들어왔음을 알림
      myMap.get('ws').send(JSON.stringify(data)) // 나에게 상대도 온라인 상태임을 알림
    }, function(error) {
      res.status(200)
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .end('error')
      console.log(error)
    })
  }
}


function broadcast(myMap, data) {
  console.log('브로드 캐스트 => ' + myMap.get('opponent'));
  var userMap = myMap.get('oppMap')
  console.log(userMap)
  userMap.get('ws').send(data)
}

function removeClient(myMap) {
  var result;
  var no = myMap.get('user')

  for (var i = 0; i < clients.length; i++) {
    if(clients[i].get('user') == no) {
      clients.splice(i, 1) //서버의 클라이언트 목록에서 내 map을 삭제
      result = no + " user removed from client list "
      break;
    }
  }

  for (var j = 0; j < clients.length; j++) {
    if(clients[j].get('opponent') == no) {
      var data = {"exit": "exit"}
      clients[j].get('ws').send(JSON.stringify(data))//상대에게 내가 나가는 것을 알려주어, 상대가 읽음상태를 가늠할 수 있또록 함
      clients[j].delete('oppMap')//상대의 map에서 내 map을 제거하여 상대와의 연결을 끊음
      result += "and from opponent's map"
      break;
    }
  }

  return result;
}

router.post('/listUser.json', (req, res) => {
  console.log('넘어왔다', req.body)
  chatService.listUser(req.body.myNo, req.body.yourNo, function (results) {
    res.json({
      'list': results
    })
  }, function (error) {
    res.status(200)
       .set('Content-Type', 'text/plain;charset=UTF-8')
       .end('error')
       console.log(error)
  })
})

router.post('/listTrainer.json', (req, res) => {
  console.log('넘어왔다', req.body)
  chatService.listUser(req.body.yourNo, req.body.myNo, function (results) {
    res.json({
      'list': results
    })
  }, function (error) {
    res.status(200)
       .set('Content-Type', 'text/plain;charset=UTF-8')
       .end('error')
       console.log(error)
  })
})


module.exports = router









//
