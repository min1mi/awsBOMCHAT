"use strict"

module.exports = {
  setConnection(conn) {
    this.connection = conn // 변수를 알아서 만들어준다.
  },

  get(no, successFn, errorFn) {
    this.connection.query(
      'select a.alno, a.othername, a.mymno, \
      a.kinds, a.confirm, a.type, m.img, \
      date_format(a.date, "%p") as pm,\
      date_format(a.date, "%h:%i") as time,\
      date_format(a.date, "%Y-%m-%d") as date\
      from alert a inner join memb m on a.othermno = m.mno\
      where a.mymno = ?\
      order by a.alno desc',
      [no],
      function (error, result) {
        if (error) {
          errorFn(error)
        } else {
          successFn(result)
        }
      })
  },
  add(type, othername, mymno, kinds, othermno, successFn, errorFn) {
    this.connection.query(
      'insert into alert(othername, mymno, kinds, date, \
      confirm, type, othermno) values(?,?,?,now(),0,?,?)',
      [othername, mymno, kinds, type, othermno],
      function (error, result) {
        if (error) {
          errorFn(error)
        } else {
          successFn(result)
        }
      })
  },
  delete(no, successFn, errorFn) {
    this.connection.query(
      'delete from alert where alno = ?',
      [no],
      function (error, result) {
        if (error) {
          errorFn(error)
        } else {
          successFn(result)
        }
      })
  }
} // module









//
