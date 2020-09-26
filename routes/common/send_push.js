const ejs = require('ejs'),
  fs = require('fs'),
  mysql = require('mysql');

const mySqlClient = mysql.createConnection(require('../../config/db_config'));

const loadSendList_host = function (req, res) {
  if (req.session.user) {
    const loadReceiverSql =
      'SELECT buildNum, building_name, roomID, tenantID, roomNum, name AS tenant_name FROM buildings b, room r, user u WHERE b.buildingNum=r.buildNum AND r.tenantID=u.user_id AND hostID = ?;';

    const buildings_set = new Set();
    const buildings = [];
    const receivers = [];

    mySqlClient.query(loadReceiverSql, req.session.user.userId, function (err, row) {
      if (row) {
        row.forEach((element) => {
          if (!buildings_set.has(element.buildNum)) {
            buildings_set.add(element.buildNum);
            buildings.push({
              buildNum: element.buildNum,
              building_name: element.building_name,
            });
          }
          receivers.push(element);
        });

        fs.readFile('./public/common/host_mgr_message.html', 'utf8', function (error, data) {
          res.send(
            ejs.render(data, {
              buildings,
              receivers,
            }),
          );
        });
      } else {
        res.send(
          '<script type="text/javascript">alert("알림을 보낼 대상이 없습니다."); window.location="/function";</script>',
        );
      }
    });
  } else {
    res.send(
      '<script type="text/javascript">alert("로그인 후 이용하세요."); window.location="/";</script>',
    );
  }
};

const loadSendList_mgr = function (req, res) {
  if (req.session.user) {
    const loadReceiverSql =
      'SELECT buildNum, building_name, roomID, tenantID, roomNum, name AS tenant_name FROM buildings b, room r, user u WHERE b.buildingNum=r.buildNum AND r.tenantID=u.user_id AND managerID = ?;';

    const buildings_set = new Set();
    const buildings = [];
    const receivers = [];

    mySqlClient.query(loadReceiverSql, req.session.user.userId, function (err, row) {
      if (row) {
        row.forEach((element) => {
          if (!buildings_set.has(element.buildNum)) {
            buildings_set.add(element.buildNum);
            buildings.push({
              buildNum: element.buildNum,
              building_name: element.building_name,
            });
          }
          receivers.push(element);
        });

        fs.readFile('./public/common/host_mgr_message.html', 'utf8', function (error, data) {
          res.send(
            ejs.render(data, {
              buildings,
              receivers,
            }),
          );
        });
      } else {
        res.send(
          '<script type="text/javascript">alert("알림을 보낼 대상이 없습니다."); window.location="/function";</script>',
        );
      }
    });
  } else {
    res.send(
      '<script type="text/javascript">alert("로그인 후 이용하세요."); window.location="/";</script>',
    );
  }
};

const loadSendList_tenant = function (req, res) {
  if (req.session.user) {
    const loadReceiverSql =
      'SELECT tenantID, roomID, roomNum FROM buildings b, room r, user u WHERE b.buildingNum=r.buildNum AND r.tenantID=u.user_id AND buildNum = (SELECT buildNum FROM buildings b, room r, user u WHERE b.buildingNum=r.buildNum AND r.tenantID=u.user_id AND u.user_id=?);';
    const receivers = [];

    mySqlClient.query(loadReceiverSql, req.session.user.userId, function (err, row) {
      if (row) {
        row.forEach((element) => {
          receivers.push(element);
        });

        fs.readFile('./public/tenant/tenant_message.html', 'utf8', function (error, data) {
          res.send(
            ejs.render(data, {
              receivers,
            }),
          );
        });
      }
    });
  } else {
    res.send(
      '<script type="text/javascript">alert("로그인 후 이용하세요."); window.location="/";</script>',
    );
  }
};

module.exports.loadSendList_host = loadSendList_host;
module.exports.loadSendList_tenant = loadSendList_tenant;
module.exports.loadSendList_mgr = loadSendList_mgr;