import "./ownerManagement.html"

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

Template.ownerManagement.onCreated(function() {
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
        var totle = Users.find({"type":4}).count();
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

    //用户本地变量
    var _data= Users.find().fetch();
    console.log(_data);
    //ReactiveDict本地变量
    this.editorData = new ReactiveVar(_data);

    //项目本地变量
    //var pro_data= Users.find().fetch();
    //console.log(pro_data);
    ////ReactiveDict本地变量
    //this.relationProData = new ReactiveVar(pro_data);

    //搜索
    this.searchData = new ReactiveVar();

    //当前页码
    this.nowpageData = new ReactiveVar();
});

Template.ownerManagement.helpers({
    userTable: function(){
        var searchHTML=Template.instance().searchData.get();
        var page = Template.instance().nowpageData.get();
        if(searchHTML){
            var bendiUT=Users.find({
                "type":4,
                'username': {$regex: searchHTML, $options:'i'}
            },{skip:(page-1)*limit,limit:limit}).fetch();

            for(var i=0;i<bendiUT.length;i++){
                bendiUT[i].ordinal=i+1;
            }
        }
        else{
            var bendiUT=Users.find({"type":4},{skip:(page-1)*limit,limit:limit}).fetch();

            for(var i=0;i<bendiUT.length;i++){
                bendiUT[i].ordinal=i+1;
            }
        }
        return bendiUT;
    },
    //用户编辑取单条
    userEditorTable:function(){
        var _data=Template.instance().editorData.get();
        return _data;
    },
    //启用停用业主
    ableState: function(a){
        //0是停用，1是启用
        if(a==1){
            return false;
        }else if(a==0){
            return true;
        }
    },
    //项目权限列出全部项目
    selectPro: function(){
        return Project.find();
    },
    //每个业主项目权限中的项目是否被选中
    ProChecked: function(a){
        var uesr_data=Template.instance().editorData.get();
        var pro=Project.find({_id:a}).fetch();
        if(pro[0] && uesr_data[0])
        {
            var this_pro_owner=pro[0].owner;
            var this_user_id=uesr_data[0]._id;
            var _this_relationOwners=pro[0].relationOwners;
            var ischecked=false;
            for(var i=0;i<_this_relationOwners.length;i++){
                if(_this_relationOwners[i]==this_user_id){
                    ischecked=true;
                }
            }
            if(this_pro_owner==this_user_id){
                ischecked=true;
            }
            return ischecked;
        }
        return false;
    },
    //这个项目的业主联系人在权限管理中不能取消对这个项目的权限
    UserCheckedAble: function(a){
        var uesr_data=Template.instance().editorData.get();
        var pro=Project.find({_id:a}).fetch();
        if(pro[0] && uesr_data[0])
        {
            var this_pro_owner=pro[0].owner;
            var this_user_id=uesr_data[0]._id;
            var ischecked=false;
            if(this_pro_owner==this_user_id){
                ischecked=true;
            }
            return ischecked;
        }
        return false;
    },
});


Template.ownerManagement.events({
    //点击页面中的添加用户按钮时重置模态框内容，下拉框有问题
    'click .addUser': function(e) {
        //alert(1);
        e.preventDefault();
        var addUser=$('#myModalAddUser');
        addUser.find('.userName').val('');
        addUser.find('.job').val('');
        addUser.find('.phone').val('');

        _this_btn=$(e.target);
        $('#myModalAddUser .userNameNone').hide();
        $('#myModalAddUser .phoneNone').hide();

        $('#myModalAddUser .userName').css("borderColor","#e5e6e7");
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
        var job=$.trim(addUser.find('.job').val());
        var phone=$.trim(addUser.find('.phone').val());

        prompt(userName,$('#myModalAddUser .userNameNone'),$('#myModalAddUser .userName'));
        //prompt(job,$('#myModalAddUser .jobNone'));
        prompt(phone,$('#myModalAddUser .phoneNone'),$('#myModalAddUser .phone'));

        if(!checkPhone(phone)){
            $('#myModalAddUser .serverRes').html('请输入正确的手机号');
            $('#myModalAddUser .serverRes').show();
            tored(false,$('#myModalAddUser .phone'))
        }

        if(userName && phone && checkPhone(phone)){
            $('#myModalAddUser .serverRes').hide();
            $('#mengban').show();
            Meteor.call('addUserOwner',userName,job,phone,function(error,res){
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
        $('#myModalEditorUser .phoneNone').hide();

        $('#myModalEditorUser .userName').css("borderColor","#e5e6e7");
        $('#myModalEditorUser .phone').css("borderColor","#e5e6e7");

        $('#myModalEditorUser .serverRes').html('');
        $('#myModalEditorUser .serverRes').hide();

        Template.instance().editorData.set(Users.find({_id:user_id}).fetch());
    },
    //确认编辑用户
    'click .editoruser': function(e) {
        e.preventDefault();
        var userEdit=$('#myModalEditorUser');

        var userName=$.trim(userEdit.find('.userName').val());
        var job=$.trim(userEdit.find('.job').val());
        var phone=$.trim(userEdit.find('.phone').val());

        prompt(userName,$('#myModalEditorUser .userNameNone'),$('#myModalEditorUser .userName'));
        //prompt(job,$('#myModalEditorUser .jobNone'));
        prompt(phone,$('#myModalEditorUser .phoneNone'),$('#myModalEditorUser .userName'));


        if(!checkPhone(phone)){
            $('#myModalEditorUser .serverRes').html('请输入正确的手机号');
            $('#myModalEditorUser .serverRes').show();
            tored(false,$('#myModalEditorUser .phone'))
        }

        if(userName && phone && checkPhone(phone)){
            $('#mengban').show();
            Meteor.call('updateUserOwner',user_id,userName,job,phone,function(error,res){
                $('#myModalEditorUser .serverRes').hide();
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
    //点击项目权限按钮
    'click .relation': function(e) {
        e.preventDefault();
        user_id = this._id;
        console.log(user_id);
        Template.instance().editorData.set(Users.find({_id:user_id}).fetch());
        //Template.instance().editorData.set(Users.find({_id:user_id}).fetch());
    },
    //项目权限选择的过程
    'click .checkboxProRelation':function(e){
        //console.log(e.target.checked);
        //console.log(this._id);
        //var changeProRelation={
        //    'pro_id':this._id,
        //    'proRelation_checked':e.target.checked
        //};
        var pro_id=this._id;
        var proRelation_checked=e.target.checked;


        //console.log($('.checkboxJLY'));
        $('#mengban').show();
        Meteor.call('changeProRelation',user_id,pro_id,proRelation_checked,function(error,res){
            $('#mengban').hide();
        });
    },


    //搜索
    'click .toSearchUser': function(e){
        e.preventDefault();
        Template.instance().searchData.set($('.searchUser').val());
        //searchHTML=$('.searchUser').val();
    },
    'keydown .searchUser':function(e){
        if(e && e.keyCode==13){ // enter 键
            Template.instance().searchData.set($('.searchUser').val());
        }
    }
});