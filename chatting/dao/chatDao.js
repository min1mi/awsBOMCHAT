"use strict"

module.exports = {
  setConnection(conn) {
    this.connection = conn // 변수를 알아서 만들어준다.
  },

  selectUser : function(memberNo, trainerNo, successFn, errorFn) {
    this.connection.query(
      'select cno, confirm, c.date, msg, \
      c.tno as opponent, c.mno as user, whosend \
      from chat c \
      inner join tcher t on c.tno = t.tno \
      where c.mno = ? and c.tno = ?',
      [memberNo, trainerNo],
      function (error, result) {
        if (error) {
          errorFn(error)

        } else {
          successFn(result)

        }
      })
  },

  selectTrainer : function(memberNo, trainerNo, successFn, errorFn) {
    this.connection.query(
      'select cno, confirm, c.date, msg, \
      c.tno as user, c.mno as opponent, whosend \
      from chat c \
      inner join tcher t on c.tno = t.tno \
      where c.mno = ? and c.tno = ?',
      [memberNo, trainerNo],
      function (error, result) {
        if (error) {
          errorFn(error)

        } else {
          successFn(result)

        }
      })
  },

  insert: function(chat, successFn, errorFn) {
    this.connection.query(
      'insert into chat(tno, mno, confirm, msg, date, whosend) \
      values(?, ?, ?, ?, ?, ?)',
      [chat.tno, chat.mno, chat.confirm, chat.msg, chat.date, chat.who],

      function(error, result) {
        if (error) {
          errorFn(error)

        } else {
          successFn(result)

        }
      }) //connection.query()
  }, // insert()

  update: function(memberNo, trainerNo, successFn, errorFn) {
    this.connection.query(
      "update chat set confirm = true \
      where mno=? and tno=? and confirm = false",
      [memberNo, trainerNo],

      function(error, result) {
        if (error) {
          errorFn(error)

        } else {
          successFn(result)

        }
      }) //connection.query()
  } //update()
} // module









//
