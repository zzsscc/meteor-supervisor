import "./userManagement.html"
import "./user_table.html"

let user_id;
let loguser;
let _changeUser;

let _this_btn;

let pagenum;
let limit=10;
let templ;

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

Template.userManagement.rendered = function(){
    $('#data_1').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
    $('#data_2').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
    // Move modal to body
    // Fix Bootstrap backdrop issu with animation.css
    //$('.modal').appendTo("body");
};

Template.userManagement.onCreated(function() {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */
    loguser=sessionStorage.getItem('loguser');
    //Session.get('loguser2');
    console.log(loguser);
    if(!loguser){
        FlowRouter.go('/login');
    }
    templ=this;

    //订阅数据
    $('#mengban').show();
    _changeUser=this.subscribe('allusers',function(){
        var totle = Users.find({"type":{$ne:4}}).count();
        console.log(totle);
        $('.M-box1').pagination({
            totalData:totle,
            showData:limit,
            coping:true,
            callback:function(api){
                console.log(api.getCurrent());
                pagenum=api.getCurrent();
                console.log(pagenum);
                templ.nowpageData.set(api.getCurrent());
            }
        });
    });
    this.subscribe('suptitle');
    this.subscribe('project',loguser,function(){
        $('#mengban').hide();
    });

    var _data= Users.find().fetch();
    console.log(_data);
    //ReactiveDict本地变量
    this.editorData = new ReactiveVar( _data);


    //当前页码
    this.nowpageData = new ReactiveVar();
});

Template.userManagement.helpers({
    userTable: function() {
        //return UserTable.find();
        //return UserTable.find({"type":{$ne:4}},{sort:{type:1}});
        //return UserTable.find({"type":{$ne:4}});
        //
        var page = Template.instance().nowpageData.get();
        var bendiUT=Users.find({"type":{$ne:4}},{skip:(page-1)*limit,limit:limit,sort:{type:1}}).fetch();
        //
        ////总监理工程师项目
        //var allZGpro=[];
        //for(var i=0;i<bendiPT.length;i++){
        //    allZGpro.push(bendiPT[i].chiefEngineer);
        //}
        //
        ////监理工程师项目
        //var allJLGpro=[];
        //for(var i=0;i<bendiPT.length;i++){
        //    allJLGpro.push(bendiPT[i].supervisionEngineer);
        //}
        //
        //var _this_id;
        //var ZGcount;
        //var JLGcount;
        for(var i=0;i<bendiUT.length;i++){
            //ZGcount=0;
            //JLGcount=0;
            bendiUT[i].ordinal=i+1;
            bendiUT[i].typeZC=Dictionaries.find({"ecode":"userType",'value':bendiUT[i].type}).fetch()[0].name;


            //_this_id=bendiUT[i]._id;
            //
            //for(var j=0;j<allZGpro.length;j++){
            //    if(allZGpro[j]==_this_id){
            //        ZGcount++;
            //    }
            //}
            //for(var j=0;j<allJLGpro.length;j++){
            //    if(allJLGpro[j]==_this_id){
            //        JLGcount++;
            //    }
            //}
            //
            //bendiUT[i].ZGprocount=ZGcount;
            //bendiUT[i].JLGprocount=JLGcount;

        }
        return bendiUT;
    },
    userTableFull: function() {
        var bendiUT=Users.find({"type":{$ne:4}}).fetch();
        for(var i=0;i<bendiUT.length;i++){
            bendiUT[i].ordinal=i+1;
        }
        return bendiUT;
        //return Users.find();
    },
    userEditorTable:function(){
        var _data=Template.instance().editorData.get();
        return _data;
    },
    userType: function(){
        return Dictionaries.find({"ecode":"userType","value":{$in:[1,2,3]}});
    },
    selectdUT: function(a){
        var selectdUT=Template.instance().editorData.get()[0].type;
        if(a==selectdUT){
            return true;
        }else{
            return false;
        }
    }
});

Template.userManagement.events({
    //点击页面中的添加用户按钮时重置模态框内容，下拉框有问题
    'click .addUser': function(e) {
        //alert(1);
        e.preventDefault();
        var addUser=$('#myModalAddUser');
        addUser.find('.userName').val('');
        addUser.find('.entryDate').val('');
        addUser.find('.job').val('');
        addUser.find('.phone').val('');
        addUser.find('.supTitle option:first-child').attr("selected",true);

        _this_btn=$(e.target);
        $('#myModalAddUser .userNameNone').hide();
        $('#myModalAddUser .entryDateNone').hide();
        $('#myModalAddUser .jobNone').hide();
        $('#myModalAddUser .phoneNone').hide();

        $('#myModalAddUser .userName').css("borderColor","#e5e6e7");
        $('#myModalAddUser .entryDate').css("borderColor","#e5e6e7");
        $('#myModalAddUser .job').css("borderColor","#e5e6e7");
        $('#myModalAddUser .phone').css("borderColor","#e5e6e7");


        $('#myModalAddUser .serverRes').html('');
        $('#myModalAddUser .serverRes').hide();
    },
    //确认添加用户
    'click .adduser': function(e) {
        //alert(1);
        e.preventDefault();
        var addUser=$('#myModalAddUser');
        var userName=$.trim(addUser.find('.userName').val());
        var entryDate=$.trim(addUser.find('.entryDate').val());
        var job=$.trim(addUser.find('.job').val());
        var phone=$.trim(addUser.find('.phone').val());
        var type=addUser.find('.supTitle option:selected').val();

        prompt(userName,$('#myModalAddUser .userNameNone'),$('#myModalAddUser .userName'));
        prompt(entryDate,$('#myModalAddUser .entryDateNone'),$('#myModalAddUser .entryDate'));
        prompt(job,$('#myModalAddUser .jobNone'),$('#myModalAddUser .job'));
        prompt(phone,$('#myModalAddUser .phoneNone'),$('#myModalAddUser .phone'));

        if(!checkPhone(phone)){
            $('#myModalAddUser .serverRes').html('请输入正确的手机号');
            $('#myModalAddUser .serverRes').show();
            tored(false,$('#myModalAddUser .phone'))
        }

        if(userName && entryDate && job && phone && checkPhone(phone)){
            $('#mengban').show();
            Meteor.call('addUser',userName,entryDate,job,phone,type,function(error,res){
                $('#mengban').hide();
                if(typeof error != 'undefined'){
                    console.log(error);
                }else{
                    if(res['success']==true){
                        $('.modal-backdrop').remove();
                        $('.modal').hide();
                        _this_btn.click();
                        return;
                    }else{
                        $('#myModalAddUser .serverRes').html(res['msg']);
                        $('#myModalAddUser .serverRes').show();
                    }
                }
            });
        }

        //Users.insert({
        //    'username':userName,
        //    'entrydate':entryDate,
        //    'job':job,
        //    'phone':phone,
        //    'type':type,
        //
        //    //'proNum':0,
        //    'lastlogintime':'/',
        //    'lastupdatatime':'/',
        //    'avatar':'/',
        //    'state':1,
        //    'password':'8888888'
        //});
        //var proNumber=CockpitTable.find({}).sort({number:-1}).limit(1);
        //CockpitTable.find({}, { sort: { number: -1 } }).limit(1);
    },
    //删除用户
    'click .del': function(e) {
        e.preventDefault();
        user_id = this._id;
        Template.instance().editorData.set(Users.find({_id:user_id}).fetch());
    },
    //确认删除用户
    'click .deluser': function(e) {
        e.preventDefault();
        //Users.remove({_id:user_id});
        $('#mengban').show();
        Meteor.call('removeUser',user_id,function(error,res){
            $('#mengban').hide();
        });
    },
    //编辑用户
    "click .editor":function(e){
        e.preventDefault();
        user_id = this._id;
        _this_btn=$(e.target);
        $('#myModalEditorUser .userNameNone').hide();
        $('#myModalEditorUser .entryDateNone').hide();
        $('#myModalEditorUser .jobNone').hide();
        $('#myModalEditorUser .phoneNone').hide();
        Template.instance().editorData.set(Users.find({_id:user_id}).fetch());

        $('#myModalEditorUser .userName').css("borderColor","#e5e6e7");
        $('#myModalEditorUser .entryDate').css("borderColor","#e5e6e7");
        $('#myModalEditorUser .job').css("borderColor","#e5e6e7");
        $('#myModalEditorUser .phone').css("borderColor","#e5e6e7");

        $('#myModalEditorUser .serverRes').html('');
        $('#myModalEditorUser .serverRes').hide();
    },
    //编辑用户时间控件
    "click #data_2":function(){
        $('#data_2').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });
    },
    //确认编辑用户
    'click .editoruser': function(e) {
        e.preventDefault();
        var userEdit=$('#myModalEditorUser');

        var userName=$.trim(userEdit.find('.userName').val());
        var entryDate=$.trim(userEdit.find('.entryDate').val());
        var job=$.trim(userEdit.find('.job').val());
        var phone=$.trim(userEdit.find('.phone').val());
        var type=userEdit.find('.supTitle option:selected').val();

        prompt(userName,$('#myModalEditorUser .userNameNone'),$('#myModalEditorUser .userName'));
        prompt(entryDate,$('#myModalEditorUser .entryDateNone'),$('#myModalEditorUser .entryDate'));
        prompt(job,$('#myModalEditorUser .jobNone'),$('#myModalEditorUser .job'));
        prompt(phone,$('#myModalEditorUser .phoneNone'),$('#myModalEditorUser .phone'));

        if(!checkPhone(phone)){
            $('#myModalEditorUser .serverRes').html('请输入正确的手机号');
            $('#myModalEditorUser .serverRes').show();
            tored(false,$('#myModalEditorUser .phone'))
        }

        if(userName && entryDate && job && phone && checkPhone(phone)){
            $('#mengban').show();
            Meteor.call('updateUser',user_id,userName,entryDate,job,phone,type,function(error,res){
                $('#mengban').hide();
                if(typeof error != 'undefined'){
                    console.log(error);
                }else{
                    if(res['success']==true){
                        $('.modal-backdrop').remove();
                        $('.modal').hide();
                        _this_btn.click();
                        return;
                    }else{
                        $('#myModalEditorUser .serverRes').html(res['msg']);
                        $('#myModalEditorUser .serverRes').show();
                    }
                }
            });
        }


        //Users.update(
        //    {_id:user_id},
        //    { $set : {
        //        "username" : userName,
        //        "entrydate" : entryDate,
        //        "job" : job,
        //        "phone" : phone,
        //        'type':type,
        //    }
        //    });
    },
    //点击页面中的修改密码按钮时重置模态框内容
    'click .editpwd': function(e) {
        //alert(1);
        e.preventDefault();
        user_id = this._id;
        Template.instance().editorData.set(Users.find({_id:user_id}).fetch());
        var editorPasd=$('#myModalEditorPasd');
        editorPasd.find('.password').val('');
    },
    //确认修改密码
    'click .editorpasd': function(e) {
        e.preventDefault();
        var editorPasd=$('#myModalEditorPasd');

        var password=editorPasd.find('.password').val();

        $('#mengban').show();
        Meteor.call('updateUserPwd',user_id,password,function(error,res){
            $('#mengban').hide();
        });
        //if(password==''){
        //    password='8888888';
        //}
        //Users.update(
        //    {_id:user_id},
        //    { $set : {
        //        "password" : password,
        //    }
        //    });
    },
    //启停用户
    "click .able":function(e){
        e.preventDefault();
        user_id = this._id;
        //
        var state = this.state;
        if(state==0){
            state=1;
            //Meteor.call('userAble',user_id,state);
        }else if(state==1){
            state=0;
            //Meteor.call('userAble',user_id,state);
        }
        $('#mengban').show();
        Meteor.call('userAble',user_id,state,function(error,res){
            $('#mengban').hide();
        });
    },


    //搜索
    'click .toSearchUser': function(e) {
        e.preventDefault();
        var searchHTML=$('.searchUser').val();
        console.log(searchHTML);
        $('#mengban').show();
        _changeUser.stop();
        _changeUser=Meteor.subscribe('allusers',searchHTML,function(){
            $('#mengban').hide();
            var totle = Users.find({"type":{$ne:4}}).count();
            console.log(totle);
            $('.M-box1').pagination({
                totalData:totle,
                showData:limit,
                coping:true,
                callback:function(api){
                    console.log(api.getCurrent());
                    pagenum=api.getCurrent();
                    console.log(pagenum);
                    templ.nowpageData.set(api.getCurrent());
                }
            });
            //_changeUser.stop();
            //_changeUser=tem;
        });


    },
    'keydown .searchUser':function(e){
        if(e && e.keyCode==13){ // enter 键
            var searchHTML=$('.searchUser').val();
            $('#mengban').show();
            _changeUser.stop();
            _changeUser=Meteor.subscribe('allusers',searchHTML,function(){
                $('#mengban').hide();
                var totle = Users.find({"type":{$ne:4}}).count();
                console.log(totle);
                $('.M-box1').pagination({
                    totalData:totle,
                    showData:limit,
                    coping:true,
                    callback:function(api){
                        console.log(api.getCurrent());
                        pagenum=api.getCurrent();
                        console.log(pagenum);
                        templ.nowpageData.set(api.getCurrent());
                    }
                });
                //_changeUser.stop();
                //_changeUser=tem;
            });
        }
    }
});