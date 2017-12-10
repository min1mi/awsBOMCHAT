var params = decodeURIComponent(location.href).split('?')[1],
  myNo = parseInt(params.split('&')[0].split('=')[1]),
  yourNo = parseInt(params.split('&')[1].split('=')[1]),
  yourName = params.split('&')[2].split('=')[1],
  memberType = parseInt(params.split('&')[3].split('=')[1]),
  imgPath = params.split('&')[4].split('=')[1],
  message = $('#message'),
  sendBtn = $('#sendBtn'),
  messageBox = $('#messageBox'),
  ws,
  isOpponentOnline = 'N',
  timeBefore,
  dateBefore,
  isMyAliasBefore,
  // host = '172.20.10.3';
  host = location.host
// var ws = new WebSocket('ws://172.20.10.5:8888/chat/chat.json');
// var ws = new WebSocket('ws://192.168.0.19:8888/chat/chat.json');
// var ws = new WebSocket('ws://192.168.0.77:8888/chat/chat.json');

// window.addEventListener("load",function(){hideAddressBar();});
// window.addEventListener("orientationchange",hideAddressBar());


var url1 = decodeURIComponent(location.href);
var url2 = location.href.split('?')[0];
history.replaceState(null, null, url2);

$('.chat-header').text(yourName)
// $('.chat-header').attr('value', yourNo)

messageBox.scrollTop(messageBox.prop('scrollHeight'));
/* 채팅 시작 */
detail(memberType)
readyChat()

function detail(memberType) {
  var url;
  if(memberType == 1) url = '/chat/listUser.json'
  else url = '/chat/listTrainer.json'

console.log(url)
  $.post(url, {
    'myNo' : myNo,
    'yourNo' : yourNo

  }, function(result) {
    $.each(result.list, function (i, item) {
      console.log(item)
      appendMsg(item.msg, item.whosend == myNo, false, item.confirm, item.date)
    })
  }).done(function() {}).fail(function() {
    console.log('detail fail')
  }).always(function() {})
} // detail()

function appendMsg(event, isMyAlias, isSendData, confirm, datetime) {
  var text = event.replace(/\r?\n/g, '');
  text = text.replace(/\s/g, "");
  if (!text) return;

  var sendValue = event;

  event = event.replace(/\r?\n/g, '<br />');
  var talk = $('<div>').addClass('cd-content clearfix')
    .appendTo(messageBox)
    .append($('<span>').addClass(isMyAlias ? "me" : "you")
    .html(event))
//    .append($('<span>').html(isMyAlias ?  : ''))

    if (!isMyAlias)
      talk.append($('<img>').attr('src', imgPath))

  if (isSendData) {
    sendChat(sendValue)
    message.val('')
    message.focus()
  }
  sizeBack()
  var viewHeight
    if (messageBox.height() < messageBox.prop("scrollHeight"))
    viewHeight = messageBox.prop("scrollHeight")
    else viewHeight = messageBox.height()
    messageBox.scrollTop(viewHeight)//가장 마지막 메시지가 보일 수 있도록 스크롤을 가장 아래로 내림
}

function readyChat() {
  // ws = new WebSocket('ws://172.20.10.5:8888/chat/chat.json');
  ws = new WebSocket('wss://' + host + '/chat/chat.json');

  console.log('readyChat 실행됨');
  ws.onopen = function(event) {
    var obj = {
      'you': yourNo,
      'me': myNo,
      'isTrainer': (parseInt(memberType) == 2 ? 'Y' : 'N')
    }
    ws.send(JSON.stringify(obj))
  }

  ws.onmessage = function(event) {
    var data = JSON.parse(event.data)
    if (data.sender == 'you') appendMsg(data.message, false, false)
  };
}

function sendChat(value) {
  var obj = {
    'message': value
  }
  ws.send(JSON.stringify(obj))
}

sendBtn.on('click', function() {
  appendMsg(message.val(), true, true)
  message.val('')
  message.focus()
})

message.keyup(function(e) {
  if (e.keyCode == 13) {
    sendBtn.click() // send 버튼에 click이벤트 발생시킴, 호출X
  }
  // e.preventDefault()
})

function sizeBack() {
  message.css('height', '6vh')
}
$('.backBtn').click(function() {
  location.href = "https://"+ location.host.split(':')[0] + "/chat/chat.html"
})



//
