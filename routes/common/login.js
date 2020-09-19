const ejs = require('ejs'),
  fs = require('fs'),
  mysql = require('mysql'),
  crypto = require('crypto');

const mySqlClient = mysql.createConnection(require('../../config/db_config'));
const selectPwdSql = 'select * from user where user_id = ? && password=?';
const checkTokenSql = 'select * from user where token=?';
const setTokenSql = 'update user set token = ? where id=?;';

const login = function (req, res) {
  const checkId = req.body.id;
  const checkPwd = crypto.createHash('sha512').update(req.body.password).digest('base64'); // Crypto Encryption
  mySqlClient.query(selectPwdSql, [checkId, checkPwd], function (err, row) {
    if (err) {
      console.log('select page sql ERROR>>' + err);
    } else {
      if (row[0]) {
        console.log('login sql - name:' + row[0].name + 'type:' + row[0].type);
        const id = row[0].id;
        req.session.user = {
          id: row[0].id,
          userId: checkId,
          userName: row[0].name,
          userType: row[0].type,
        };
        console.log(`Token: ${req.cookies.token}`);

        if (req.cookies.token) {
          const userType = req.session.user.userType;
          //token값이 다른 사용자에게서 사용되고 있는지 확인
          mySqlClient.query(checkTokenSql, req.cookies.token, function (err, row) {
            if (row[0]) {
              const makeTokenNullSql = 'update user set token=null where id=?';
              mySqlClient.query(makeTokenNullSql, row[0].id, function (err, row) {
                if (err) {
                  console.log('make token null err>' + err);
                } else {
                  if (tokenUpdate(setTokenSql, req.cookies.token, id)) {
                    res.writeHead(200, {
                      'Set-Cookie': 'token=; Max-Age:0',
                    });
                    console.log('200 - Set Cookie Finished');
                  }
                  if (userType === '건물주') {
                    res.redirect('/host');
                  } else if (userType === '관리인') {
                    res.redirect('/manager');
                  } else if (userType === '세입자') {
                    res.redirect('/tenant');
                  }
                }
              });
            } else {
              if (tokenUpdate(setTokenSql, req.cookies.token, id)) {
                res.writeHead(200, {
                  'Set-Cookie': 'token=; Max-Age:0',
                });
                if (userType === '건물주') {
                  res.redirect('/host');
                } else if (userType === '관리인') {
                  res.redirect('/manager');
                } else if (userType === '세입자') {
                  res.redirect('/tenant');
                }
              }
            }
          });
        } else {
          // Token이 다른 사용자가 사용중이지 않는 경우
          if (userType === '건물주') {
            res.redirect('/host');
          } else if (userType === '관리인') {
            res.redirect('/manager');
          } else if (userType === '세입자') {
            res.redirect('/tenant');
          }
        }
      } else {
        res.send(
          '<script type="text/javascript">alert("아이디 또는 비밀번호를 다시 확인해주세요."); window.location="/";</script>',
        );
      }
    }
  });
};

function tokenUpdate(setTokenSql, token, id) {
  //Token Update
  mySqlClient.query(setTokenSql, [token, id], function (err, row) {
    if (err) {
      console.log('update token error>>' + err);
    } else {
      console.log('토큰 정상 업데이트');
      return true;
    }
  });
}

module.exports = login;
