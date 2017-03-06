import "./cockpit.html"
import "./cockpit_table.html"
// import "../common/navbar-position.html"
//import { ReactiveVar } from 'meteor/reactive-var';

let loguser;
let pro_id;
let _changeProject2;

let _this_btn;

let pagenum;
let limit=10;
let templ;

//显隐提示
function prompt(val, shObj) {
    if (!val) {
        shObj.show();
    } else {
        shObj.hide();
    }
}

//this.Pages = new Meteor.Pagination("Project",{
//    perPage: 2,
//    itemTemplate: "cockpit_table",
//    //templateName: 'Project',
//    //itemTemplate: 'cockpit'
//    //sort: {
//    //    title: 1
//    //},
//    //filters: {
//    //    count: {
//    //        $gt: 10
//    //    }
//    //},
//    //availableSettings: {
//    //    perPage: true,
//    //    sort: true
//    //}
//});




//let that_pro;
//Meteor.subscribe('cockpitTable');
//Meteor.subscribe('userTable');

Template.cockpit.onDestroyed(function () {
    _changeProject2.stop();
    pro_id = null;
    //that_pro=null;
});



Template.cockpit.rendered = function () {
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
    //初始化
    //_changeProject2=Meteor.subscribe('project',loguser,function(){
    //    that_pro=Project.find({}).fetch();
    //});
    //日期
    //$('.data_1 .input-group.date').datepicker({
    //    todayBtn: "linked",
    //    keyboardNavigation: false,
    //    forceParse: false,
    //    calendarWeeks: true,
    //    autoclose: true
    //});

    //$('.M-box1').pagination({
    //    totalData:100,
    //    showData:1,
    //    coping:true,
    //    callback:function(api){
    //        console.log(api.getCurrent());
    //        $('.now').text(api.getCurrent());
    //    }
    //});

    //分页
    //this.Pages = new Meteor.Pagination("Project",{
    //    perPage: 2,
    //    itemTemplate: "cockpit_table",
    //    templateName: 'Project',
    //    //itemTemplate: 'cockpit'
    //    //sort: {
    //    //    title: 1
    //    //},
    //    //filters: {
    //    //    count: {
    //    //        $gt: 10
    //    //    }
    //    //},
    //    //availableSettings: {
    //    //    perPage: true,
    //    //    sort: true
    //    //}
    //});

};

Template.cockpit.onCreated(function () {
    /*
     * find() 返回值是一个游标。游标是一种从动数据源
     *输出内容，可以对游标使用 fetch() 来把游标转换成数组
     * */
    //
    //var userPhone=$.cookie('user_phone');
    //var userType=$.cookie('user_type');

    //得到登录用户的id
    //var _loguserId=FlowRouter.getParam('_id');
    //console.log(_loguserId);
    loguser = sessionStorage.getItem('loguser');
    //Session.get('loguser2');
    console.log(loguser);
    if (!loguser) {
        FlowRouter.go('/login');
    }
    //console.log(loguser);
    templ=this;

    //订阅数据
    $('#mengban').show();
    _changeProject2 = this.subscribe('project', loguser, function () {
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
    });
    //this.subscribe('cockpitTable_user',userPhone,userType);
    this.subscribe('allusers');
    //this.subscribe('dictionaries');

    //单条项目
    var _data = Project.find({}).fetch();
    //ReactiveDict本地变量
    this.editorData = new ReactiveVar(_data);

    //当前页码
    this.nowpageData = new ReactiveVar();

    //Meteor.call('getnum',_data,function(){
    //
    //});

    //页码本地变量
    //this.pages = new ReactiveVar();
});
Template.cockpit.helpers({
    //项目集合
    cockpitTable: function () {
        var page = Template.instance().nowpageData.get();
        var bendiPT = Project.find({},{skip:(page-1)*limit,limit:limit}).fetch();
        //Template.instance().searchData.set(that_pro);
        //var bendiPT=Template.instance().searchData.get();


        for (var i = 0; i < bendiPT.length; i++) {
            bendiPT[i].ordinal = i + 1;
            //Meteor.call('proProgress',bendiPT[i]._id,function(error,res){
            //    bendiPT[i].progress=res['result'];
            //});

            if (bendiPT[i].supervisionEngineer) {
                bendiPT[i].supervisionEngineer = Users.find({ '_id': bendiPT[i].supervisionEngineer }).fetch()[0].username;
            }
            if (bendiPT[i].backup == 0) {
                bendiPT[i].backup = '无';
            } else {
                bendiPT[i].backup = Dictionaries.find({ "ecode": "backUp", 'value': bendiPT[i].backup }).fetch()[0].name;
            }
            if (bendiPT[i].weekly) {
                bendiPT[i].weekly ='开启';
            }else{
                bendiPT[i].weekly ='关闭';
            }
            if (bendiPT[i].monthly) {
                bendiPT[i].monthly ='开启';
            }else{
                bendiPT[i].monthly ='关闭';
            }
        }
        return bendiPT;
    },
    //cockpitTable: function() {
    //    //return CockpitTable.find();
    //    var bendiCT=Project.find().fetch();
    //    for(var i=0;i<bendiCT.length;i++){
    //        bendiCT[i].ordinal=i+1;
    //    }
    //    return bendiCT;
    //},
    //单条项目集合
    editorTable: function () {
        var _data = Template.instance().editorData.get();
        return _data;
    },
    //周报是否勾选
    isweekly: function (a) {
        var pro=Project.find({_id:a}).fetch();
        if(pro[0]){
            if(pro[0].weekly==0)
            {
                return false;
            }else{
                return true;
            }
        }
    },
    //月报是否勾选
    ismonthly: function (a) {
        var pro=Project.find({_id:a}).fetch();
        if(pro[0]){
            if(pro[0].monthly==0)
            {
                return false;
            }else{
                return true;
            }
        }
    },
    //用户表中监理工程师集合
    userTableJLG: function () {
        return Users.find({ "type": 2, 'state': 1 });
    },
    //工程师选中判断
    engSelect: function (a) {
        //console.log(a);
        var supervisionEngineer = Template.instance().editorData.get()[0].supervisionEngineer;
        var engname = Users.find({ '_id': supervisionEngineer }).fetch()[0].username;
        if (a == engname) {
            return true;
        } else {
            return false;
        }
    },
    //字典表中备份方案集合
    backUp: function () {
        return Dictionaries.find({ "ecode": "backUp" });
    },
    //备份方案选中方法
    backUpSelect: function (a) {
        var backup = Template.instance().editorData.get()[0].backup;
        if (a == backup) {
            return true;
        } else {
            return false;
        }
    },
    //验收判断
    accState: function (a) {
        //0是已验收，1是未验收
        if (a == 1) {
            return false;
        } else if (a == 0) {
            return true;
        }
    },
    //是否显示操作判断
    isHandle: function () {
        var loguser = sessionStorage.getItem('loguser');
        //var _loguserId=FlowRouter.getParam('_id');
        //var loguserType=Users.find({'_id':_loguserId}).fetch()[0].type;
        var user = Users.findOne({ '_id': loguser });
        if (user) {
            var loguserType = user.type;

            //if(loguserType==1 || loguserType==0){
            if (loguserType == 1 || loguserType == 0) {
                return true;
            } else {
                return false;
            }
        }
        return false;

    }
});

Template.cockpit.onRendered(function () {
    //日期
    //$('.data_1 .input-group.date').datepicker({
    //    todayBtn: "linked",
    //    keyboardNavigation: false,
    //    forceParse: false,
    //    calendarWeeks: true,
    //    autoclose: true
    //});
    //$('.modal').appendTo("body");
    //var proSum=CockpitTable.find().count();
    //console.log(1111);
});

Template.cockpit.events({
    //'click .add': function(e) {
    //    //alert(1);
    //    e.preventDefault();
    //    var addPro=$('#myModalAddpro');
    //    //var proname=addpro.find('.modal-body').find('input:first-child').val();
    //    //const target = e.target;
    //    //const text = target.text.value;
    //    //console.log(text);
    //    console.log(pro_id);
    //    CockpitTable.insert({'number':10,'proName':'11'});
    //    //var proNumber=CockpitTable.find({}).sort({number:-1}).limit(1);
    //    //CockpitTable.find({}, { sort: { number: -1 } }).limit(1);
    //},
    //验收项目
    "click .acc": function (e) {
        e.preventDefault();
        pro_id = this._id;

        var state = this.state;
        if (state == 0) {
            state = 1;
            //Project.update({_id:pro_id},{ $set : { "state" : state,"accTime" : null} });
        } else if (state == 1) {
            state = 0;
            //var timestamp = ((Date.parse(new Date()))/ 1000).toString();
            //Project.update({_id:pro_id},{ $set : { "state" : state,"accTime" : timestamp} });
        }
        $('#mengban').show();
        Meteor.call('accPro', pro_id, state, function (error, res) {
            $('#mengban').hide();
        });
        //function base64_decode(base64str, file) {
        //    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
        //    var bitmap = new Buffer(base64str, 'base64');
        //    // write buffer to file
        //    fs.writeFileSync(file, bitmap);
        //    console.log('******** File created from base64 encoded string ********');
        //}
        //
        //base64_decode('iVBORw0KGgoAAAANSUhEUgAAADQAAAAlCAYAAAAN8srVAAACTUlEQVR42u3Wv2sTcRiA8VPBxUKwEAxU3NxPIoFAl1bIkkmwYKAKRbqbRSWQCGJ+rMUibjo4FARBl0AgUIh/QXFxFIpKJHAQKA56r0/hDbyEK5VrDH2hBx+ud+Ga9+G+uSQQkVOv0+lMZNBFHoFRwABZb0F9CCITVdRjQd9b0CoOTNSGiRkidBWkljGGINb9CCECd0FqE7GJqkxeMxccK8UbJzppUPGIO5SfR9DCjINsTIR1RDbKXvAakuB9yqAsvuLaDIN6Jqag5/IaIxjYCxaxDzFGyKUMegdBb4ZBGfQmMUaIXeSmLyhDjHspl9wdiPHgJEGlUumf2UGml96HlJ+hRQwhRoSleQfZgfawlDJoB5KgO4OgDLrIT4UUMEA2xdNpro/t6aA+BJGJKuqxoJ9ikLmzQas4MFEbJmYIHz99GNRaxhiCWPcjhAjcBalNxCaqgsBrUPGIO5T3GGRjIqwjslHegnompqDn8hojGHgLyqA3iTFC7CLnLOh4Z0Gn3FnQf2O3ZrN5iZ9aVw81Go3zQfLmI4iIx/gBUXvtdnvNXZDGbEMI2Gf/BFsQPXffVRADr+jgn1hylwPdOL6Bn7w2brVaV9wEMfALBheGDu3QGvVQ79RtT0FvGDyu1WoXE4JWNKjiack916HXEoJecT7GLTdBLLXrDPwbEX+Xq9XqucPHNzFVzv3B93q9fsHbU+4uhAhh/wXfIMaWqyBdXjfxluE/63fQM/Yt8/je9hQ0vdnQpybqJRZcB2nUI4J+QVB2H6RRHzUoTPo/fwGr9gNcek8bXAAAAABJRU5ErkJggg==', 'copy.jpg');


        //Meteor.call('imageUpload2');


    },
    //编辑项目
    "click .editor": function (e) {
        e.preventDefault();
        pro_id = this._id;
        _this_btn = $(e.target);
        $('#myModalEditorPro .proNameNone').hide();
        $('#myModalEditorPro .beginDateNone').hide();
        Template.instance().editorData.set(Project.find({ _id: pro_id }).fetch());

    },
    //编辑项目开始时间控件
    "click #data_1":function(){
        $('#data_1').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });
    },
    //编辑项目到期时间控件
    "click #data_2":function(){
        $('#data_2').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });
    },
    //周报复选框
    "click .checkboxWeekly": function (e) {
        e.preventDefault();
        var weekly_checked=e.target.checked;
        $('#mengban').show();
        Meteor.call('changeWeekly',pro_id,weekly_checked,function(){
            $('#mengban').hide();
        });
    },
    //月报复选框
    "click .checkboxMonthly": function (e) {
        e.preventDefault();
        var monthly_checked=e.target.checked;
        $('#mengban').show();
        Meteor.call('changeMonthly',pro_id,monthly_checked,function(){
            $('#mengban').hide();
        });
    },
    //确认编辑项目
    'click .editorpro': function (e) {
        e.preventDefault();
        console.log(pro_id);
        var editorPro = $('#myModalEditorPro');
        var proName = $.trim(editorPro.find('.proName').val());
        var beginDate = $.trim(editorPro.find('.beginDate').val());
        var endDate = $.trim(editorPro.find('.endDate').val());
        var enger = editorPro.find('.enger option:selected').val();
        var phone = editorPro.find('.tel').html();
        var backup = editorPro.find('.backup option:selected').val();

        prompt(proName, $('#myModalEditorPro .proNameNone'));
        prompt(beginDate, $('#myModalEditorPro .beginDateNone'));
        prompt(endDate, $('#myModalEditorPro .endDateNone'));

        if (proName && beginDate && endDate) {
            $('#mengban').show();
            Meteor.call('updateProCK', pro_id, proName, beginDate,endDate, enger, phone, backup, function (error, res) {
                $('#mengban').hide();
                if (typeof error != 'undefined') {
                    console.log(error);
                } else {
                    if (res['success'] == true) {
                        //$('body').removeClass('modal-open');
                        //$('body').css("paddingRight",'0');
                        //$('#myModalEditorPro').removeClass('in');
                        $('.modal-backdrop').remove();
                        $('.modal').hide();
                        _this_btn.click();
                        //alert(res['msg']);
                        return;
                    } else {
                        alert(res['msg']);
                    }
                }
            });
        }



        ////得到选择的监理工程师在用户表中的电话
        //var choosedJLG=Users.find({'userName':enger,'type':2}).fetch();
        //var supTel=choosedJLG[0].phone;
        //
        //Project.update(
        //    {_id:pro_id},
        //    { $set : {
        //        "proName" : proName,
        //        "beginDate" : beginDate,
        //        "supervisionEngineer" : enger,
        //        "supTel" : supTel,
        //        "backup" : backup,
        //        }
        //    });
    },

    //监理工程师选择过程中改变下面的电话
    'change .enger': function (e) {
        e.preventDefault();
        var editorPro = $('#myModalEditorPro');
        var enger = editorPro.find('.enger option:selected').val();

        //得到选择的监理工程师在用户表中的电话
        if (enger != '请选择') {
            var choosedJLG = Users.find({ 'username': enger, 'type': 2 }).fetch();
            var supTel = choosedJLG[0].phone;
        } else {
            var supTel = '';
        }

        editorPro.find('.tel').html(supTel);
    },
    //点击日期input
    //'click .data_1': function() {
    //    $('.data_1 .input-group.date').datepicker({
    //        todayBtn: "linked",
    //        keyboardNavigation: false
    //        //forceParse: false,
    //        //calendarWeeks: true,
    //        //autoclose: true
    //    });
    //    //$('.data_1 .date').datepicker();
    //
    //},


    //点击项目列表的详情按钮，跳到对应的项目
    'click .jumpPro': function (e) {
        e.preventDefault();
        pro_id = this._id;
        sessionStorage.setItem('choosepro', pro_id);
        Session.set("choosepro", pro_id);
        FlowRouter.go('/projectOverview');
        //FlowRouter.go('/projectBasic');
    },

    //搜索
    //'click .toSearchPro': function(e) {
    //'change .searchPro': function(e) {
    //    e.preventDefault();
    //    var searchHTML=$('.searchPro').val();
    //    var choosePro=$('.choosePro');
    //    var searchTd=choosePro.find('td:not(:last-child)');
    //    console.log(searchHTML);
    //    console.log(searchTd);
    //
    //    if(searchHTML){
    //        choosePro.css('display','none');
    //        for(var i=0;i<searchTd.length;i++){
    //            if($(searchTd[i]).html().indexOf(searchHTML)!=-1){
    //                $(searchTd[i]).parents('tr').css('display','table-row');
    //            }
    //        }
    //    }else{
    //        choosePro.css('display','table-row');
    //    }
    //},
    'click .toSearchPro': function (e) {
        e.preventDefault();
        var searchHTML = $('.searchPro').val();
        $('#mengban').show();
        _changeProject2.stop();
        _changeProject2 = Meteor.subscribe('project', loguser, searchHTML, function () {
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
            //_changeProject2.stop();
            //_changeProject2=tem;
        });
    },
    'keydown .searchPro': function (e) {
        if (e && e.keyCode == 13) { // enter 键
            var searchHTML = $('.searchPro').val();
            $('#mengban').show();
            _changeProject2.stop();
            _changeProject2 = Meteor.subscribe('project', loguser, searchHTML, function () {
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
                //_changeProject2.stop();
                //_changeProject2=tem;
            });
        }
    },


    //'click.bbb .M-box1 a': function (e) {
    //    console.log('翻页了');
    //    Template.instance().nowpageData.set(pagenum);
    //}

});