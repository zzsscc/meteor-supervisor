import "./top-navbar.html"

let loguser;
let message_proid;
let _thisProject;
let _changeMessage;

let _this_btn;

let messagePage=1;
let templat;

//显隐提示
function prompt(val,shObj,toredObj){
    if(!val) {
        shObj.show();
        tored(val,toredObj);
    }else{
        shObj.hide();
        tored(val,toredObj);
    }
}

//错误红框提示
function tored(iferror,obj){
    if(!iferror) {
        obj.css("borderColor","red");
    }else{
        obj.css("borderColor","#e5e6e7");
    }
}

//判断手机号是否有效
function checkPhone(phone){
    if(!(/^1[34578]\d{9}$/.test(phone))){
        return false;
    }
    else{
        return true;
    }
}

//时间戳转换为时间格式，yyyy-mm-dd h:m:s
function formatDate_zsc(dateC) {
    var date=dateC;
    var y = date.getFullYear() + "-";
    var m = date.getMonth() + 1 + "-";
    var d = date.getDate();

    //当前小时大于12
    var h = date.getHours();
    //var am=h>12?" 下午 ":" 上午 ";
    //24小时制换为12小时制
    //h=h>12?h-12:h;
    //一位数小时数前加个0
    h = h < 10 ? "0" + h : "" + h;

    //一位数分钟数前加个0
    var mi = date.getMinutes();
    mi = mi < 10 ? "0" + mi : "" + mi;

    //一位数秒数前加个0
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : "" + s;


    //字符串拼接
    var dateTime = y + m + d + ' ' + h + ":" + mi + ":" + s;
    return dateTime;
}


function imgChange(e) {
    //console.info(e.target.files[0]);//图片文件
    //var dom = $("input[id^='imgTest']")[0];
    //console.info(dom.value);//这个是文件的路径 C:\fakepath\icon (5).png
    //console.log(e.target.value);//这个也是文件的路径和上面的dom.value是一样的
    var reader = new FileReader();
    reader.onload = (function (file) {
        return function (e) {
            return this.result; //这个就是base64的数据了
        };
    })(e.target.files[0]);
    reader.readAsDataURL(e.target.files[0]);
}

//Tracker.autorun(function () {
//    var messageWrap=document.getElementById('messageWrap');
//    this.template.scrollscroll.set(messageWrap.scrollHeight);
//    var scrollscroll=this.template.scrollscroll.get();
//    //scrollscroll=scrollscroll+'px';
//    messageWrap.scrollTop = scrollscroll;
//});

//function imgChange(e) {
//    //console.info(e.target.files[0]);//图片文件
//    //var dom = $("input[id^='imgTest']")[0];
//    //console.info(dom.value);//这个是文件的路径 C:\fakepath\icon (5).png
//    //console.log(e.target.value);//这个也是文件的路径和上面的dom.value是一样的
//    var reader = new FileReader();
//    reader.onload = (function (file) {
//        return function (e) {
//            return this.result; //这个就是base64的数据了
//        };
//    })(e.target.files[0]);
//    reader.readAsDataURL(e.target.files[0]);
//}

//$('.messageWrap').scrollTop('500px');

Template.topNavbar.rendered = function(){

    // FIXED TOP NAVBAR OPTION
    // Uncomment this if you want to have fixed top navbar
    //固定导航栏
    // $('body').addClass('fixed-nav');
    // $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');

    //$('body').addClass('fixed-nav').addClass('fixed-nav-basic');
    //$(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
};

Template.topNavbar.onDestroyed (function(){
    //_thisProject.stop();
    _changeMessage.stop();
});


Template.topNavbar.onCreated(function() {
    loguser=sessionStorage.getItem('loguser');
    //订阅数据
    //_thisProject=this.subscribe('project',loguser);
    //this.subscribe('allusers');
    this.subscribe('dictionaries');
    this.subscribe('messageNum',loguser);
    templat=this;

    //订阅项目的消息
    _changeMessage=this.subscribe('messageBelongProject');

    //消息本地变量
    var message_data= Messages.find().fetch();
    //ReactiveDict本地变量
    this.messageData = new ReactiveVar(message_data);


    this.scrollscroll = new ReactiveVar(0);

    this.messagesTotle = new ReactiveVar();

    this.messagesPage = new ReactiveVar();

});



Template.topNavbar.helpers({
    //消息框左边栏项目列表
    messageProject: function() {
        var bendiPT=Project.find().fetch();
        for(var i=0;i<bendiPT.length;i++){
            if(bendiPT[i].proname.length>10){
                bendiPT[i].proname=bendiPT[i].proname.substr(0,10);
                bendiPT[i].proname=bendiPT[i].proname+'...';
            }
        }
        return bendiPT;
    },
    //右边的消息列表
    messageList: function() {
        var bendiMT=Messages.find({},{sort:{createAt:1}}).fetch();

        //console.log(1);
        //var messageWrap=document.getElementById('messageWrap');
        //var scrollscroll=Template.instance().scrollscroll.get();
        ////scrollscroll=scrollscroll+'px';
        //messageWrap.scrollTop = scrollscroll;

        for(var i=0;i<bendiMT.length;i++){
            //周报
            if(bendiMT[i].senderId=='week_report'){
                bendiMT[i].sendSup="周报";
                bendiMT[i].avatar='http://jianli.eshudata.com/img/profile_small.png';
                bendiMT[i].senderName="周报";
            }
            else if(bendiMT[i].senderId=='month_report'){
                bendiMT[i].sendSup="月报";
                bendiMT[i].avatar='http://jianli.eshudata.com/img/profile_small.png';
                bendiMT[i].senderName="月报";
            }
            //非周报、月报
            else{
                bendiMT[i].sendSup=Dictionaries.find({"ecode":"userType",'value':Users.find({_id:bendiMT[i].senderId}).fetch()[0].type}).fetch()[0].name;
                bendiMT[i].avatar=Users.find({_id:bendiMT[i].senderId}).fetch()[0].avatar;
                if(Users.find({_id:bendiMT[i].senderId}).fetch()[0].type==4){
                    bendiMT[i].senderName=Project.find({_id:message_proid}).fetch()[0].ownername;
                }
            }
            if(bendiMT[i].createAt){
                if(typeof bendiMT[i].createAt == "string")
                {
                    bendiMT[i].createAt = new Date(bendiMT[i].createAt);
                }
                bendiMT[i].createAt=formatDate_zsc(bendiMT[i].createAt);
            }
        }

        return bendiMT;
    },
    //根据用户左右显示消息
    messageLOR: function(a){
        if(a==loguser){
            return true;
        }else{
            return false;
        }
    },
    //监理员不能发送消息
    messageDisable: function(){
        var user = Users.findOne({ '_id': loguser });
        if (user) {
            var loguserType = user.type;
            if (loguserType == 3) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    },
    //是否显示更多消息按钮
    ifMessageMore:function(){
        var totle=Template.instance().messagesTotle.get();
        var page=Template.instance().messagesPage.get();
        if(page>=totle/10){
            return false;
        }
        else{
            return true;
        }
    },
    //新消息数量
    newMessageNum:function(){
        var messagesnum= Messagesnum.find().fetch();
        console.log("newMessageNum");
        if(messagesnum.length>0){
            return messagesnum[0].num;
        }
        else{
            return 0;
        }
    },
    //newMessageNum:function(){
    //    var messages= Messages.find().fetch();
    //    var newcount=0;
    //    console.log("newMessageNum");
    //    for(var i=0;i<messages.length;i++){
    //        if(messages[i].stateToPerson){
    //            for(var j=0;j<messages[i].stateToPerson.length;j++){
    //                if(messages[i].stateToPerson[j]==loguser){
    //                    newcount++
    //                }
    //            }
    //        }
    //
    //    }
    //    return newcount;
    //},
    //个人设置
    selfSetting: function(){
        return Users.find({_id:loguser}).fetch();
    },
});


Template.topNavbar.events({

    // Toggle left navigation
    'click #navbar-minimalize': function(event){

        event.preventDefault();

        // Toggle special class
        $("body").toggleClass("mini-navbar");

        // Enable smoothly hide/show menu
        if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            $('#side-menu').hide();
            // For smoothly turn on menu
            setTimeout(
                function (){
                    $('#side-menu').fadeIn(400);
                }, 200);
        } else if ($('body').hasClass('fixed-sidebar')) {
            $('#side-menu').hide();
            setTimeout(
                function () {
                    $('#side-menu').fadeIn(400);
                }, 200);
        } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            $('#side-menu').removeAttr('style');
        }
    },

    'click .tologout':function(e){
        if(sessionStorage.getItem('loguser')){
            sessionStorage.removeItem("loguser");
        }
        if(sessionStorage.getItem('choosepro')){
            sessionStorage.removeItem("choosepro");
        }
        if(Session.get("choosepro")){
            Session.set("choosepro",0);
        }
        if($.cookie('loguser')){
            $.removeCookie('loguser');
        }
    },
    'click .messages':function(e){
        e.preventDefault();
        Meteor.call('updateMessageNum',loguser);
        if($('.projectList')){
            console.log(11);
            $($('.projectList')[0]).click();
        }
    },

    'click .projectList':function(e,template){
        e.preventDefault();
        message_proid=this._id;
        messagePage=1;
        templat.messagesPage.set(messagePage);


        var this_li=e.target;
        $(this_li).siblings().removeClass('active');
        $(this_li).addClass('active');

        Meteor.call('updateMessageState',message_proid,loguser);

        Meteor.call('getMessageTotleBelongPro',message_proid,function(error,res){
            if(typeof error != 'undefined'){
                console.log(error);
            }else{
                if(res['success']==true){
                    templat.messagesTotle.set(res['result']);
                    return;
                }else{
                    alert(res['msg']);
                }
            }
        });

        _changeMessage.stop();
        _changeMessage=Meteor.subscribe('messageBelongProject',message_proid,messagePage,function(){
            var messageWrap=document.getElementById('messageWrap');
            template.scrollscroll.set(messageWrap.scrollHeight);
            var scrollscroll=template.scrollscroll.get();
            //if(  messageWrap.scrollHeight>messageWrap.offsetHeight){
            //    console.log('有滚动条');
            //}
            //else{
            //    console.log('无滚动条');
            //}
            //console.log(scrollscroll);
            //scrollscroll=scrollscroll+'px';
            //messageWrap.scrollTop = scrollscroll;
            var mesnum=Messages.find({}).count();
            console.log(mesnum);
            if(mesnum>=4){
                var scro=setInterval(function(){
                    console.log('scro');
                    $(messageWrap).scrollTop(10000000000);
                    //$(messageWrap).scrollTop(Number.MAX_VALUE);
                    console.log($(messageWrap).scrollTop());
                    if($(messageWrap).scrollTop()!=0){
                        clearInterval(scro);
                    }
                    else{
                        $(messageWrap).scrollTop(10000000000);
                    }
                },100)
            }
            //更新消息读过状态
            //var mes=Messages.find().fetch();
            //var this_mes_id=[];
            //for(var i=0;i<mes.length;i++){
            //    if(mes[i].chatId==message_proid){
            //        this_mes_id.push(mes[i]._id);
            //    }
            //}
            //for(var i=0;i<this_mes_id.length;i++){
            //Meteor.call('updateMessageState',message_proid,loguser);
            //}
            //Meteor.call('updateMessageState',message_proid,loguser);
            //console.log(Messages.find().fetch());

        });
    },
    'click .tosendMessage':function(e,template){
        e.preventDefault();
        var newMessage=$.trim($('#myModalMessages').find('.sendMessageText').val());
        if(newMessage){
            console.log(loguser);
            console.log(message_proid);
            console.log(newMessage);
            Meteor.call('addMessage',loguser,message_proid,newMessage,function(error,res){
                $('#myModalMessages').find('.sendMessageText').val('');
                var messageWrap=document.getElementById('messageWrap');
                template.scrollscroll.set(messageWrap.scrollHeight);
                var scrollscroll=template.scrollscroll.get();
                //scrollscroll=scrollscroll+'px';
                //messageWrap.scrollTop = scrollscroll;
                var scro=setInterval(function(){
                    $(messageWrap).scrollTop(10000000000);
                    if($(messageWrap).scrollTop()!=0){
                        clearInterval(scro);
                    }
                    else{
                        $(messageWrap).scrollTop(10000000000);
                    }
                },100)
            });
            //得到消息总数
            Meteor.call('getMessageTotleBelongPro',message_proid,function(error,res){
                if(typeof error != 'undefined'){
                    console.log(error);
                }else{
                    if(res['success']==true){
                        templat.messagesTotle.set(res['result']);
                        return;
                    }else{
                        alert(res['msg']);
                    }
                }
            });
        }
        //提示消息不能为空
        else{
            $('.messageSendEmpty').show();
            var emptyscro=setInterval(function(){
                console.log('关闭消息为空提示框定时器');
                $('.messageSendEmpty').hide();
                clearInterval(emptyscro);
            },1000)
        }

    },
    //发送消息
    'keydown #myModalMessages':function(e,template){
        if(e && e.keyCode==13 && e.ctrlKey){ // enter 键
            var newMessage=$.trim($('#myModalMessages').find('.sendMessageText').val());
            if(newMessage){
                console.log(loguser);
                console.log(message_proid);
                console.log(newMessage);
                //var newMessage=newMessage.replace(/\n/g,"&#10;");
                Meteor.call('addMessage',loguser,message_proid,newMessage,function(error,res){
                    $('#myModalMessages').find('.sendMessageText').val('');
                    var messageWrap=document.getElementById('messageWrap');
                    template.scrollscroll.set(messageWrap.scrollHeight);
                    var scrollscroll=template.scrollscroll.get();
                    //scrollscroll=scrollscroll+'px';
                    //messageWrap.scrollTop = scrollscroll;
                    var scro=setInterval(function(){
                        $(messageWrap).scrollTop(10000000000);
                        if($(messageWrap).scrollTop()!=0){
                            clearInterval(scro);
                        }
                        else{
                            $(messageWrap).scrollTop(10000000000);
                        }
                    },100)
                    //$(messageWrap).scrollTop(Number.MAX_VALUE);
                });
                //得到消息总数
                Meteor.call('getMessageTotleBelongPro',message_proid,function(error,res){
                    if(typeof error != 'undefined'){
                        console.log(error);
                    }else{
                        if(res['success']==true){
                            templat.messagesTotle.set(res['result']);
                            return;
                        }else{
                            alert(res['msg']);
                        }
                    }
                });
            }
            //提示消息不能为空
            else{
                $('.messageSendEmpty').show();
                var emptyscro=setInterval(function(){
                    console.log('关闭消息为空提示框定时器');
                    $('.messageSendEmpty').hide();
                    clearInterval(emptyscro);
                },1000)
            }

        }
    },

    //'keydown .sendMessageText':function(event,template){
    //    if(event.keyCode == 13 && event.ctrlKey)
    //    {
    //        var selectText = document.selection.createRange();
    //        if(selectText)
    //        {
    //            if(selectText.text.length > 0)
    //                selectText.text += "\r\n";
    //            else
    //                selectText.text = "\r\n";
    //            selectText.select();
    //        }
    //    }
    //},
    //查看更多消息
    'click .messageMore':function(e){
        e.preventDefault();
        messagePage++;
        templat.messagesPage.set(messagePage);
        _changeMessage.stop();
        _changeMessage=Meteor.subscribe('messageBelongProject',message_proid,messagePage,function(){
            //更新消息读过状态
            //var mes=Messages.find().fetch();
            //var this_mes_id=[];
            //for(var i=0;i<mes.length;i++){
            //    if(mes[i].chatId==message_proid){
            //        this_mes_id.push(mes[i]._id);
            //    }
            //}
            //for(var i=0;i<this_mes_id.length;i++){
            //Meteor.call('updateMessageState',message_proid,loguser);
            //}
            //Meteor.call('updateMessageState',message_proid,loguser);
            //console.log(Messages.find().fetch());

        });
    },
    'click .closeMessage':function(e){
        e.preventDefault();
    },
    'click .personSet':function(e){
        e.preventDefault();
        _this_btn=$(e.target);
        $('#myModalSetting .phoneNone').hide();
        $('#myModalSetting .passwordNot').hide();
        $('#myModalSetting .serverRes').html('');
        $('#myModalSetting .serverRes').hide();

        $('#myModalSetting .phone').css("borderColor","#e5e6e7");
        $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
        $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
        $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

        var setting=$('#myModalSetting');
        setting.find('.oldpassword').val('');
        setting.find('.newpassword').val('');
        setting.find('.renewpassword').val('');
    },
    'click .tosetting':function(e){
        e.preventDefault();
        var setting=$('#myModalSetting');
        var phone=$.trim(setting.find('.phone').val());
        var oldpassword=$.trim(setting.find('.oldpassword').val());
        var newpassword=$.trim(setting.find('.newpassword').val());
        var renewpassword=$.trim(setting.find('.renewpassword').val());

        prompt(phone,$('#myModalSetting .phoneNone'),$('#myModalSetting .phone'));

        var user = Users.findOne({_id:loguser});
        if(user)
        {
            var type=user.type;
            //不是管理员，则必须验证手机号规则
            if(type!=0){
                if(!checkPhone(phone)){
                    $('#myModalSetting .phoneNone').hide();
                    $('#myModalSetting .passwordNot').hide();
                    $('#myModalSetting .serverRes').html('');
                    $('#myModalSetting .serverRes').hide();

                    $('#myModalSetting .serverRes').html('请输入正确的手机号');
                    $('#myModalSetting .serverRes').show();

                    $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                    $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                    $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                    $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                    tored(false,$('#myModalSetting .phone'))
                }

                if(phone && !newpassword && checkPhone(phone)){
                    $('#myModalSetting .serverRes').hide();
                    Meteor.call('selfSet',loguser,phone,function(error,res){
                        if(typeof error != 'undefined'){
                            console.log(error);
                        }else{
                            if(res['success']==true){
                                $('.modal-backdrop').remove();
                                $('.modal').hide();
                                _this_btn.click();
                                return;
                            }else{
                                $('#myModalSetting .serverRes').html(res['msg']);
                                $('#myModalSetting .serverRes').show();
                            }
                        }
                    });
                }
                else if(phone && newpassword && checkPhone(phone)){
                    if(newpassword || renewpassword){
                        //有原密码
                        if(oldpassword){
                            if(newpassword!=renewpassword) {
                                $('#myModalSetting .phoneNone').hide();
                                $('#myModalSetting .passwordNot').hide();
                                $('#myModalSetting .serverRes').html('');
                                $('#myModalSetting .serverRes').hide();

                                $('#myModalSetting .serverRes').hide();
                                $('#myModalSetting .passwordNot').html('两次密码输入不一致');
                                $('#myModalSetting .passwordNot').show();


                                $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                                $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                                $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                                $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                                tored(false,$('#myModalSetting .newpassword'));
                                tored(false,$('#myModalSetting .renewpassword'));
                            }else{
                                $('#myModalSetting .passwordNot').html('');
                                $('#myModalSetting .passwordNot').hide();
                                Meteor.call('selfSet',loguser,phone,oldpassword,newpassword,function(error,res){
                                    if(typeof error != 'undefined'){
                                        console.log(error);
                                    }else{
                                        if(res['success']==true){
                                            $('.modal-backdrop').remove();
                                            $('.modal').hide();
                                            _this_btn.click();
                                            return;
                                        }else{
                                            $('#myModalSetting .serverRes').html(res['msg']);
                                            $('#myModalSetting .serverRes').show();

                                            $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                                            tored(false,$('#myModalSetting .oldpassword'));
                                        }
                                    }
                                });
                            }
                        }
                        //没有原密码
                        else{
                            $('#myModalSetting .phoneNone').hide();
                            $('#myModalSetting .passwordNot').hide();
                            $('#myModalSetting .serverRes').html('');
                            $('#myModalSetting .serverRes').hide();

                            $('#myModalSetting .passwordNot').html('请输入原密码');
                            $('#myModalSetting .passwordNot').show();

                            $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                            $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                            $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                            $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                            tored(false,$('#myModalSetting .oldpassword'));
                        }
                    }
                }
            }
            else if(type==0){
                if(phone && !newpassword){
                    $('#myModalSetting .serverRes').hide();
                    Meteor.call('selfSet',loguser,phone,function(error,res){
                        if(typeof error != 'undefined'){
                            console.log(error);
                        }else{
                            if(res['success']==true){
                                $('.modal-backdrop').remove();
                                $('.modal').hide();
                                _this_btn.click();
                                return;
                            }else{
                                $('#myModalSetting .serverRes').html(res['msg']);
                                $('#myModalSetting .serverRes').show();
                            }
                        }
                    });
                }
                else if(phone && newpassword){
                    if(newpassword || renewpassword){
                        //有原密码
                        if(oldpassword){
                            if(newpassword!=renewpassword) {
                                $('#myModalSetting .phoneNone').hide();
                                $('#myModalSetting .passwordNot').hide();
                                $('#myModalSetting .serverRes').html('');
                                $('#myModalSetting .serverRes').hide();

                                $('#myModalSetting .serverRes').hide();
                                $('#myModalSetting .passwordNot').html('两次密码输入不一致');
                                $('#myModalSetting .passwordNot').show();


                                $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                                $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                                $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                                $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                                tored(false,$('#myModalSetting .newpassword'));
                                tored(false,$('#myModalSetting .renewpassword'));
                            }else{
                                $('#myModalSetting .passwordNot').html('');
                                $('#myModalSetting .passwordNot').hide();
                                Meteor.call('selfSet',loguser,phone,oldpassword,newpassword,function(error,res){
                                    if(typeof error != 'undefined'){
                                        console.log(error);
                                    }else{
                                        if(res['success']==true){
                                            $('.modal-backdrop').remove();
                                            $('.modal').hide();
                                            _this_btn.click();
                                            return;
                                        }else{
                                            $('#myModalSetting .serverRes').html(res['msg']);
                                            $('#myModalSetting .serverRes').show();

                                            $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                                            $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                                            tored(false,$('#myModalSetting .oldpassword'));
                                        }
                                    }
                                });
                            }
                        }
                        //没有原密码
                        else{
                            $('#myModalSetting .phoneNone').hide();
                            $('#myModalSetting .passwordNot').hide();
                            $('#myModalSetting .serverRes').html('');
                            $('#myModalSetting .serverRes').hide();

                            $('#myModalSetting .passwordNot').html('请输入原密码');
                            $('#myModalSetting .passwordNot').show();

                            $('#myModalSetting .phone').css("borderColor","#e5e6e7");
                            $('#myModalSetting .newpassword').css("borderColor","#e5e6e7");
                            $('#myModalSetting .renewpassword').css("borderColor","#e5e6e7");
                            $('#myModalSetting .oldpassword').css("borderColor","#e5e6e7");

                            tored(false,$('#myModalSetting .oldpassword'));
                        }
                    }
                }
            }
        }

    },
    //头像上传
    'change #uploadHead':function(e){

        var base64;
        var reader = new FileReader();
        reader.onload = (function (file){
            return function (e){
                base64= this.result; //base64
                base64 = base64.replace(/^(data:\s*image\/(\w+);base64,)/, "");
                //console.log(base64);
                Meteor.call('uploadHeadPic',base64,loguser,function(error,res){
                    console.log(res['success']);
                });
            };
        })(e.target.files[0]);
        reader.readAsDataURL(e.target.files[0]);
        //console.log(base64);
    },
    //监理证书上传
    'change #certificate':function(e){

        var base64;
        var reader = new FileReader();
        reader.onload = (function (file){
            return function (e) {
                base64= this.result; //base64
                base64 = base64.replace(/^(data:\s*image\/(\w+);base64,)/, "");
                //console.log(base64);
                Meteor.call('uploadCertificate',base64,loguser);
            };
        })(e.target.files[0]);
        reader.readAsDataURL(e.target.files[0]);
        //console.log(base64);
    }
});
