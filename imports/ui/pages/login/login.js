import "./login.html"

//var code;
//var userid;
//var userType;
//var userPhone;
//function createCode() {
//    code = "";
//    var codeLength = 1;//验证码的长度
//    var checkCode = document.getElementById("checkCode");
//    var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');//所有候选组成验证码的字符，当然也可以用中文的
//
//    for (var i = 0; i < codeLength; i++) {
//        var charIndex = Math.floor(Math.random() * 36);
//        code += selectChar[charIndex];
//    }
//    //alert(code);
//    if (checkCode) {
//        $(checkCode).addClass('code');
//        checkCode.value = code;
//    }
//}

function createCode(code) {
    var checkCode = document.getElementById("checkCode");


    if (checkCode) {
        $(checkCode).addClass('codes');
        checkCode.value = code;
    }
}

function getCode(){
    Meteor.call('webCode',function(error,res){
        if(typeof error != 'undefined'){
            console.log(error);
        }else if(res['result']!='undefined'){
            createCode(res['result']);
        }
    })
}

function toLogin(){
    var form=$('.biaodan');
    var account=form.find('.account').val();
    var password=form.find('.password').val();
    var remember=form.find('.i-checks').prop("checked");
    console.log(remember);

    //验证验证码
    var inputCode = document.getElementById("vercode").value;
    if (inputCode.length <= 0) {
        alert("请输入验证码");
    } else if (inputCode != document.getElementById("checkCode").value) {
        $('#vercode').val('');
        alert("验证码输入错误");
        getCode();
    } else {
        Meteor.call('weblogin',account,password,function(error,res){
            if(typeof error != 'undefined'){
                console.log(error);
            }else{
                if(res['success']==true){
                    sessionStorage.setItem('loguser', res['result']);
                    $.cookie('loguser' , res['result']);
                    if(remember){
                        localStorage.setItem('account', account);
                        localStorage.setItem('password', password);
                    }else{
                        if(localStorage.getItem('account') && localStorage.getItem('password')){
                            localStorage.removeItem('account');
                            localStorage.removeItem('password');
                        }
                    }
                    FlowRouter.go('/cockpit');
                }else{
                    alert(res['msg']);
                }
            }
        });
    }
}

//
//
Template.login.rendered = function(){
    //createCode();
    $('.fakebody').width(document.documentElement.clientWidth);
    $('.fakebody').height(document.documentElement.clientHeight);

    //拿验证码
    getCode();
    if($.cookie('loguser')){
        sessionStorage.setItem('loguser', $.cookie('loguser'));
        FlowRouter.go('/cockpit');
    }else{
        if(localStorage.getItem('account') && localStorage.getItem('password')){
            var form=$('.biaodan');
            form.find('.account').val(localStorage.getItem('account'));
            form.find('.password').val(localStorage.getItem('password'));
            form.find('.i-checks').prop("checked",'true');
        }
    }
};
//
Template.login.onCreated(function() {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */

    //订阅数据
    //this.subscribe('allusers');

});

Template.login.events({
    "click .submit":function(e){
        e.preventDefault();
        toLogin();
    },
    "click #checkCode":function(e){
        e.preventDefault();
        //重新拿验证码
        getCode();
    },
    "keydown .biaodan":function(e){
        if(e && e.keyCode==13){
            toLogin();
        }
    },
});



//Template.login.events({
//    "click .submit":function(e){
//        e.preventDefault();
//        var form=$('.form');
//        var account=form.find('.account').val();
//        var password=form.find('.password').val();
//
//        var users= UserTable.find({}).fetch();
//        console.log(users);
//        console.log(account);
//        console.log(password);
//
//        for(var i=0;i<users.length;i++){
//            //验证账号
//            if(users[i].phone==account){
//                userType=users[i].type;
//                userid=users[i]._id;
//                userPhone=users[i].phone;
//                //验证账号的密码
//                if(users[i].password==password){
//                    //验证验证码
//                    var inputCode = document.getElementById("vercode").value;
//                    if (inputCode.length <= 0) {
//                        alert("请输入验证码！");
//                    } else if (inputCode != code) {
//                        alert("验证码输入错误！");
//                        createCode();//刷新验证码
//                    } else {
//                        alert('ok :'+ userPhone  +' '+ userType);
//                        $.cookie('user_phone' , userPhone);
//                        $.cookie('user_type' , userType);
//                        //跳转
//                        FlowRouter.go('/cockpit');
//                        //FlowRouter.go('/cockpit');
//                    }
//                }
//            }
//        }
//    },
//    "click #checkCode":function(e){
//        e.preventDefault();
//        createCode();
//    },
//});