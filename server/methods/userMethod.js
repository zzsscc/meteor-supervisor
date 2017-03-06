Meteor.methods({
    //用户管理
    //编辑用户密码
    'chanegPassword'(user_id,old_password,password) {
        var user = Users.findOne({_id:user_id});
        var old_password_crypto = CryptoJS.MD5(old_password).toString();
        if(user.password != old_password_crypto)
        {
            return{
                'success':false,
                'msg':"原密码错误"
            }
        }
        if(user_id && password){
            var now=((Date.parse(new Date()))/ 1000).toString();
            if(password==''){
                password='8888888';
            }
            //转MD5
            password=CryptoJS.MD5(password).toString();

            Users.update(
                {_id:user_id},
                { $set : {
                    "password" : password,

                    'lastupdatatime':now
                }
                });
                return{
                'success':true,
                'msg':"成功"
            }
        }else{
            return {
                'success':false,
                'msg':"修改密码失败，没有user_id或password"
            }
        }

    },
    //添加用户
    'login'(userName,password) {
        console.log("login");
        //验证验证码
        // var inputCode = document.getElementById("vercode").value;
        // if (inputCode.length <= 0) {
        //     return {
        //     'success':true,
        //     'result':users[i]._id,
        //     'msg':"请输入验证码"
        //     };
        // } else if (inputCode != code) {
        //     return {
        //     'success':true,
        //     'result':users[i]._id,
        //     'msg':"验证码输入错误"
        //     };
        // }
        var passwordMds=CryptoJS.MD5(password).toString();
        var users= Users.find({'phone':userName}).fetch();
        if(users.length>0)
        {
            for(var i=0;i<users.length;i++){
                //验证账号
                if(users[i].state==1) {
                    //验证账号的密码
                    if (users[i].password == passwordMds) {
                        // sessionStorage.setItem('loguser', users[i]._id);
                        return {
                        'success':true,
                        'result':users[i]._id,
                        'msg':"成功"
                        };
                    }
                    else{
                        return {
                        'success':false,
                        'result':"",
                        'msg':"密码错误"
                        };
                    }
                }
                else{
                    return {
                        'success':false,
                        'result':"",
                        'msg':"用户已冻结"
                        };
                }
            }
        }
        else{
            return {
            'success':false,
            'result':"",
            'msg':"用户不存在"
            };
        }
    }
})