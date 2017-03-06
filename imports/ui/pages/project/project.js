import "./project.html"
import "./project_table.html"
import "./pro_type.html"
import "./pro_record.html"

let loguser;
let pro_id;
let protype_id;
let backup_id;
let _changeProtype;
let _changeProject1;
let _changeBackup;

let _this_btn;

let pagenum;
let limit=10;
let templ;

let pagenumback;
let limitback=4;

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



Template.project.onDestroyed (function(){
    _changeProtype.stop();
    _changeProject1.stop();
    _changeBackup.stop();

    pro_id=null;
    protype_id=null;
});

Template.project.rendered = function(){
    //$('.choosePro:first-child').click();
    //初始化
    //_changeProject1=Meteor.subscribe('project',loguser,function(){
    //    $('.choosePro:first-child').click();
    //});
    //$('.choosePro:first-child').click();
    $('#data_1').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
    //    .on('changeDate',function(e){
    //    var startTime = e.date;
    //    $('#data_3').datepicker('setStartDate',startTime);
    //});
    $('#data_2').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
    $('#data_3').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
    //    .on('changeDate',function(e){
    //    var endTime = e.date;
    //    $('#data_1').datepicker('setEndDate',endTime);
    //});
    $('#data_4').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });
};

Template.project.onCreated(function() {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */
    loguser=sessionStorage.getItem('loguser');
    //Session.get('loguser2');
    if(!loguser){
        FlowRouter.go('/login');
    }
    templ=this;


    //订阅数据
    $('#mengban').show();
    //this.subscribe('project','all');
    _changeProject1=this.subscribe('project',loguser,function(){
        var totle = Project.find().count();
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
        $('.choosePro:first-child').click();
    });
    this.subscribe('allusers');
    //this.subscribe('proType');
    //this.subscribe('proRecord');
    //this.subscribe('proRemark');
    //this.subscribe('dictionaries');

    _changeProtype=this.subscribe('protype',function(){
        //$('#mengban').hide();
    });
    //this.subscribe('protype');
    _changeBackup=this.subscribe('backupList',function(){
        $('#mengban').hide();
        var totle = BackUp.find().count();
        console.log(totle);
        $('.M-box2').pagination({
            totalData:totle,
            showData:limitback,
            coping:true,
            callback:function(api){
                console.log(api.getCurrent());
                pagenumback=api.getCurrent();
                console.log(pagenumback);
                templ.nowpagebackData.set(api.getCurrent());
            }
        });
    });

    //var _data= Project.find().fetch();
    var _data= Project.find().fetch();
    //ReactiveDict本地变量
    this.editorData = new ReactiveVar( _data);
    //解决项目备注在页面跳转的时候会全部罗列出来的情况
    Template.instance().editorData.set(Project.find({_id:0}).fetch());

    //项目备份恢复本地变量
    var proback_data= BackUp.find().fetch();
    //ReactiveDict本地变量
    this.probackData = new ReactiveVar( proback_data);
    ////解决项目备注在页面跳转的时候会保留的问题
    //Template.instance().protypeData.set(Projecttype.find({_id:0}).fetch());

    //当前页码
    this.nowpageData = new ReactiveVar();

    //当前备份的页码
    this.nowpagebackData = new ReactiveVar();
});

Template.project.helpers({
    projectTable: function() {
        var page = Template.instance().nowpageData.get();
        var bendiPT=Project.find({},{skip:(page-1)*limit,limit:limit}).fetch();
        //var bendiUT=Users.find().fetch();

        if(bendiPT && bendiPT.length>0){
            for(var i=0;i<bendiPT.length;i++){
                bendiPT[i].ordinal=i+1;
                if(bendiPT[i].chiefEngineer){
                    bendiPT[i].chiefEngineer=Users.find({'_id':bendiPT[i].chiefEngineer}).fetch()[0].username;
                }
                if(bendiPT[i].owner){
                    bendiPT[i].owner=Users.find({'_id':bendiPT[i].owner}).fetch()[0].phone;
                }
                if(bendiPT[i].backup==0){
                    bendiPT[i].backup='无';
                }else{
                    bendiPT[i].backup=Dictionaries.find({"ecode":"backUp",'value':bendiPT[i].backup}).fetch()[0].name;
                }
            }
            return bendiPT;
        }
    },
    //projectTable: function() {
    //    //return CockpitTable.find();
    //    //本地插入序号
    //    var bendiCT=Project.find().fetch();
    //    for(var i=0;i<bendiCT.length;i++){
    //        bendiCT[i].ordinal=i+1;
    //    }
    //    return bendiCT;
    //},
    editorTable:function(){
        var _data=Template.instance().editorData.get();
        //console.log(_data);
        if(_data[0]){
            //debugger
            //console.log(Users.find({'_id':_data[0].owner}).fetch());
            if(_data[0].owner){
                _data[0].owner=Users.find({'_id':_data[0].owner}).fetch()[0].phone;
            }
        }
        return _data;
    },
    editorTable2:function(){
        var _data=Template.instance().editorData.get();
        return _data;
    },
    userTableZG: function() {
        return Users.find({"type":1,'state':1});
    },
    engSelect: function(a){
        //console.log(a);
        var chiefEngineer=Template.instance().editorData.get()[0].chiefEngineer;
        var engname=Users.find({'_id':chiefEngineer}).fetch()[0].username;
        if(a==engname){
            return true;
        }else{
            return false;
        }
    },
    backUp:function(){
        return Dictionaries.find({"ecode":"backUp"});
    },
    backUpSelect:function(a){
        var backup=Template.instance().editorData.get()[0].backup;
        if(a==backup){
            return true;
        }else{
            return false;
        }
    },
    //项目类型
    proType:function(){
        //订阅方式
        var bendiPType=Projecttype.find().fetch();

        //var bendiUT=Users.find().fetch();

        for(var i=0;i<bendiPType.length;i++){
            bendiPType[i].ordinal=i+1;
        }
        return bendiPType;

        //本地变量方式
        //var protype_data=Template.instance().protypeData.get();
        //console.log(protype_data.length);
        //for(var i=0;i<protype_data.length;i++){
        //    protype_data[i].ordinal=i+1;
        //}
        //return protype_data;
    },
    //项目恢复备份
    proBackup:function(){
        var page = Template.instance().nowpagebackData.get();
        var bendiBUP=BackUp.find({},{skip:(page-1)*limitback,limit:limitback}).fetch();
        for(var i=0;i<bendiBUP.length;i++){
            bendiBUP[i].ordinal=i+1;
        }
        return bendiBUP;
    },
    //单条项目恢复备份
    oneBackup:function(){
        var _data=Template.instance().probackData.get();
        return _data;
    },
});

Template.project.events({
    //点击页面中的添加项目按钮时重置模态框内容，下拉框有问题
    'click .addPro': function(e) {
        //alert(1);
        e.preventDefault();

        var addPro=$('#myModalAddPro');
        addPro.find('.proName').val('');
        addPro.find('.beginDate').val('');
        addPro.find('.endDate').val('');
        addPro.find('.enger option:first-child').attr("selected",true);
        addPro.find('.owner').val('');
        //addPro.find('.owner option:first-child').attr("selected",true);
        addPro.find('.backup option:first-child').attr("selected",true);

        _this_btn=$(e.target);
        $('#myModalAddPro .proNameNone').hide();
        $('#myModalAddPro .beginDateNone').hide();
        $('#myModalAddPro .endDateNone').hide();

        $('#myModalAddPro .proName').css("borderColor","#e5e6e7");
        $('#myModalAddPro .beginDate').css("borderColor","#e5e6e7");
        $('#myModalAddPro .endDate').css("borderColor","#e5e6e7");
        $('#myModalAddPro .owner').css("borderColor","#e5e6e7");

        $('#myModalAddPro .serverRes').html('');
        $('#myModalAddPro .serverRes').hide();
    },
    //确认添加项目
    'click .addpro': function(e) {
        //alert(1);
        e.preventDefault();
        var addPro=$('#myModalAddPro');
        var proName=$.trim(addPro.find('.proName').val());
        var beginDate=$.trim(addPro.find('.beginDate').val());
        var endDate=$.trim(addPro.find('.endDate').val());
        var enger=addPro.find('.enger option:selected').val();
        //var tel=addPro.find('.tel').val();
        var owner=$.trim(addPro.find('.owner').val());
        var backup=addPro.find('.backup option:selected').val();
        //var proname=addpro.find('.modal-body').find('input:first-child').val();
        //console.log(text);

        //得到选择的总监理工程师在用户表中的电话
        //var choosedZG=Users.find({'userName':enger,'type':1}).fetch();
        //var chiefTel=choosedZG[0].phone;

        prompt(proName,$('#myModalAddPro .proNameNone'),$('#myModalAddPro .proName'));
        prompt(beginDate,$('#myModalAddPro .beginDateNone'),$('#myModalAddPro .beginDate'));
        prompt(endDate,$('#myModalAddPro .endDateNone'),$('#myModalAddPro .endDate'));

        var phonetrue=true;
        if(owner){
            phonetrue=true;
            if(!checkPhone(owner)){
                $('#myModalAddPro .serverRes').html('请输入正确的手机号');
                $('#myModalAddPro .serverRes').show();
                tored(false,$('#myModalAddPro .owner'));
                phonetrue=false;
            }
        }

        if(proName && beginDate &&　endDate && phonetrue){
            $('#mengban').show();
            Meteor.call('addPro',proName,beginDate,endDate,enger,owner,backup,function(error,res){
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
                        $('#myModalAddPro .serverRes').html(res['msg']);
                        $('#myModalAddPro .serverRes').show();
                    }
                }
            });
        }
    },
    //验收项目
    "click .acc":function(e){
        e.preventDefault();
        pro_id = this._id;


        var state = this.state;
        if(state==0){
            state=1;
            //Project.update({_id:pro_id},{ $set : { "state" : state,"accTime" : null} });
        }else if(state==1){
            state=0;
            //var timestamp = ((Date.parse(new Date()))/ 1000).toString();
            //Project.update({_id:pro_id},{ $set : { "state" : state,"accTime" : timestamp} });
        }
        $('#mengban').show();
        Meteor.call('accPro',pro_id,state,function(error,res){
            $('#mengban').hide();
        });
    },
    //删除项目
    'click .del': function(e) {
        e.preventDefault();
        pro_id = this._id;
    },
    //确认删除项目
    'click .delpro': function(e) {
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removePro',pro_id,function(error,res){
            $('#mengban').hide();
        });
        if($('.choosePro').length>0){
            pro_id=null;
            $('.choosePro:first-child').click();
        }else{
            pro_id=null;
        }
    },
    //编辑项目
    "click .editor":function(e){
        e.preventDefault();
        pro_id = this._id;
        _this_btn=$(e.target);
        $('#myModalEditorPro .proNameNone').hide();
        $('#myModalEditorPro .beginDateNone').hide();
        $('#myModalEditorPro .endDateNone').hide();
        Template.instance().editorData.set(Project.find({_id:pro_id}).fetch());
        //console.log(Template.instance().editorData.get());

        $('#myModalEditorPro .proName').css("borderColor","#e5e6e7");
        $('#myModalEditorPro .beginDate').css("borderColor","#e5e6e7");
        $('#myModalEditorPro .endDate').css("borderColor","#e5e6e7");
        $('#myModalEditorPro .owner').css("borderColor","#e5e6e7");


        $('#myModalEditorPro .serverRes').html('');
        $('#myModalEditorPro .serverRes').hide();
    },
    //编辑项目开始时间控件
    "click #data_2":function(){
        $('#data_2').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });
    },
    //编辑项目到期时间控件
    "click #data_4":function(){
        $('#data_4').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });
    },
    //确认编辑项目
    'click .editorpro': function(e) {
        e.preventDefault();
        var editorPro=$('#myModalEditorPro');

        //存起来当前的业主账号
        //var oldowner=Project.find({_id:pro_id}).fetch()[0].owner;

        var proName=$.trim(editorPro.find('.proName').val());
        var beginDate=$.trim(editorPro.find('.beginDate').val());
        var endDate=$.trim(editorPro.find('.endDate').val());
        var enger=editorPro.find('.enger option:selected').val();
        var owner=$.trim(editorPro.find('.owner').val());
        //var tel=editorPro.find('.tel').val();
        var backup=editorPro.find('.backup option:selected').val();

        prompt(proName,$('#myModalEditorPro .proNameNone'),$('#myModalEditorPro .proName'));
        prompt(beginDate,$('#myModalEditorPro .beginDateNone'),$('#myModalEditorPro .beginDate'));
        prompt(endDate,$('#myModalEditorPro .endDateNone'),$('#myModalEditorPro .endDate'));

        var phonetrue=true;
        if(owner){
            phonetrue=true;
            if(!checkPhone(owner)){
                $('#myModalEditorPro .serverRes').html('请输入正确的手机号');
                $('#myModalEditorPro .serverRes').show();
                tored(false,$('#myModalEditorPro .owner'));
                phonetrue=false;
            }
        }

        if(proName && beginDate && endDate && phonetrue){
            $('#mengban').show();
            Meteor.call('updatePro',pro_id,proName,beginDate,endDate,enger,owner,backup,function(error,res){
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
                        $('#myModalEditorPro .serverRes').html(res['msg']);
                        $('#myModalEditorPro .serverRes').show();
                    }
                }
            });
        }
    },
    //选择一条项目改变下面3栏的内容
    'click .choosePro': function(e) {
        e.preventDefault();
        //$(this).parents('.modal').hide();
        pro_id = this._id;
        Template.instance().editorData.set(Project.find({_id:pro_id}).fetch());
        //Template.instance().protypeData.set(Projecttype.find({'belongPro':pro_id}).fetch());


        //改变项目类型的订阅
        $('#mengban').show();
        _changeProtype.stop();
        _changeProtype=Meteor.subscribe('protype',pro_id,function(){
            //$('#mengban').hide();
            //_changeProtype.stop();
            //_changeProtype=tem;
        });

        //改变备份恢复的订阅
        $('#mengban').show();
        _changeBackup.stop();
        _changeBackup=Meteor.subscribe('backupList',pro_id,function(){
            $('#mengban').hide();
            var totle = BackUp.find().count();
            console.log(totle);
            $('.M-box2').pagination({
                totalData:totle,
                showData:limitback,
                coping:true,
                callback:function(api){
                    console.log(api.getCurrent());
                    pagenumback=api.getCurrent();
                    console.log(pagenumback);
                    templ.nowpagebackData.set(api.getCurrent());
                }
            });
            //_changeProtype.stop();
            //_changeProtype=tem;
        });



        //e.currentTarget得到祖先级，具体哪个祖先级不知道
        console.log($(e.currentTarget));
        var this_tr=e.currentTarget;
        $(this_tr).siblings().removeClass('active');
        $(this_tr).addClass('active');

        //$(this).siblings().removeClass('active');
        //$(this).addClass('active');
    },
    //点击项目列表的详情按钮，跳到对应的项目
    'click .jumpPro': function(e) {
        e.preventDefault();
        //$(this).parents('.modal').hide();
        pro_id = this._id;
        sessionStorage.setItem('choosepro', pro_id);
        Session.set("choosepro",pro_id);
        FlowRouter.go('/projectOverview');
    },

    //添加项目类型
    'click .toaddProType': function(e) {
        e.preventDefault();
        _this_btn=$(e.target);
        $('#myModalAddType .newProTypeNone').hide();
        $('#myModalAddType').find('.newProType').val('');
    },
    //确认添加项目类型
    'click .addProType': function(e) {
        e.preventDefault();
        var newProType=$.trim($('#myModalAddType').find('.newProType').val());

        prompt(newProType, $('#myModalAddType .newProTypeNone'));

        if(newProType){
            $('#mengban').show();
            Meteor.call('addProType',pro_id,newProType,function(error,res){
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
                        alert(res['msg']);
                    }
                }
            });
        }

    },
    //删除项目类型
    'click .removeProType': function(e) {
        e.preventDefault();
        protype_id = this._id;
    },
    //确认删除项目类型
    'click .delprotype': function(e) {
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removeProType',protype_id,function(error,res){
            $('#mengban').hide();
        });
    },

    //修改项目备注
    'click .pro-remark-save': function(e) {
        e.preventDefault();
        var ownername=$('.ownername').val();
        var ownerTel=$('.ownerTel').val();
        var owneraddr=$('.owneraddr').val();
        var proRemark=$('.proRemark').val();

        $('#mengban').show();
        Meteor.call('updateRemark',pro_id,ownername,ownerTel,owneraddr,proRemark,function(error,res){
            $('#mengban').hide();
            if(typeof error != 'undefined'){
                console.log(error);
            }else{
                if(res['success']==true){
                    return;
                }else{
                    alert(res['msg']);
                }
            }
        });

    },

    //搜索
    'click .toSearchPro': function(e) {
        e.preventDefault();
        var searchHTML=$('.searchPro').val();
        console.log(searchHTML);
        Template.instance().editorData.set(Project.find({_id:0}).fetch());
        pro_id = null;
        $('#mengban').show();
        _changeProtype.stop();
        _changeProject1.stop();
        _changeProject1=Meteor.subscribe('project',loguser,searchHTML,function(){
            $('#mengban').hide();
            var totle = Project.find().count();
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
            //pro_id = null;
            //_changeProtype.stop();
            //_changeProject1.stop();
            //_changeProject1=tem;
            //$('.choosePro:first-child').click();
        });

        //var choosePro=$('.choosePro');
        //var searchTd=choosePro.find('td:not(:last-child)');
        //console.log(searchHTML);
        //console.log(searchTd);
        //
        //if(searchHTML){
        //    choosePro.css('display','none');
        //    for(var i=0;i<searchTd.length;i++){
        //        if($(searchTd[i]).html().indexOf(searchHTML)!=-1){
        //            $(searchTd[i]).parents('tr').css('display','table-row');
        //        }
        //    }
        //    var choseP=[];
        //    for(var i=0;i<choosePro.length;i++){
        //        if($(choosePro[i]).css('display')=='table-row'){
        //            choseP.push($(choosePro[i]));
        //        }
        //    }
        //    if(choseP.length>0){
        //        $(choseP[0]).click();
        //    }else{
        //        Template.instance().editorData.set(Project.find({_id:0}).fetch());
        //    }
        //}else{
        //    choosePro.css('display','table-row');
        //    $(choosePro[0]).click();
        //}


    },
    'keydown .searchPro':function(e){
        if(e && e.keyCode==13){ // enter 键
            var searchHTML=$('.searchPro').val();
            pro_id = null;
            $('#mengban').show();
            _changeProtype.stop();
            _changeProject1.stop();
            _changeProject1=Meteor.subscribe('project',loguser,searchHTML,function(){
                $('#mengban').hide();
                var totle = Project.find().count();
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
                //pro_id = null;
                //_changeProtype.stop();
                //_changeProject1.stop();
                //_changeProject1=tem;
                //$('.choosePro:first-child').click();
            });
        }
    },
    //点击恢复按钮
    'click .HF': function(e){
        e.preventDefault();
        backup_id=this._id;
        Template.instance().probackData.set(BackUp.find({_id:backup_id}).fetch());
    },
    //确认恢复
    'click .toHF': function(e){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('restore',backup_id,function(error,res){
            $('#mengban').hide();
        });
    },

    'click .weekReport': function(e){
        e.preventDefault();

        Meteor.call('weekReport');
    },

    'click .monthReport': function(e){
        e.preventDefault();

        Meteor.call('monthReport');
    }

});
