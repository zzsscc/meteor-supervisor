import "./projectPicture.html"

let loguser;
let choosepro;
let proType_id;
let point_id;
let imgClass_id;
let imgDetail_id;
let image_id;
let _changeType;
let _changePoint;
let _changeEquipment;
let _changeImageclassify;
let _changeImagedetail;
let _changeImageinfo;

//筛选照片用
let tofilterEquipment_id;
let tofilterImgclass_id;
let tofilterImgdetail_id;
let tofilterAcc;


let pagenum;
let limit=10;
let templ;

//正逆序排序
let sorttype=1;
//排序字段
let sortname='code';

function tofilter(pro_id,proType_id,point_id,equipment_id,imgClass_id,imgDetail_id,acc){
    //改变照片的订阅
    $('#mengban').show();
    _changeImageinfo.stop();
    _changeImageinfo=Meteor.subscribe('imageinfo',pro_id,proType_id,point_id,equipment_id,imgClass_id,imgDetail_id,acc,function(){
        $('#mengban').hide();
        // _changeImageinfo.stop();
        // _changeImageinfo=tem;
    });
}

//时间戳转换为时间格式，yyyy-mm-dd h:m:s
function formatDate_zsc(dateC) {
    var date=new Date(dateC);
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

Template.projectPicture.onDestroyed (function(){
    _changeType.stop();
    _changePoint.stop();
    _changeEquipment.stop();
    _changeImageclassify.stop();
    _changeImagedetail.stop();
    _changeImageinfo.stop();
});

Template.projectPicture.onRendered = function(){
    document.getElementById('links').onclick = function (event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = {index: link, event: event},
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    };

};
Template.projectPicture.rendered = function(){
    //初始化
    //_changeType=Meteor.subscribe('protype',choosepro,function(){
    //    $('.chosetype:first-child').click();
    //});
    _changeType=this.subscribe('protype',choosepro,function(){
        $('.chosetype:first-child').click();
        //Meteor.subscribe('pointinfo',function(){
        //    $('.getPoint:first-child').click();
        //});
        //Meteor.subscribe('pointinfo',function(){
        //    var point_id=Pointinfo.find().fetch()[0]._id;
        //    _changeEquipment.stop();
        //    _changeEquipment=Meteor.subscribe('equipment',point_id,function(){
        //        $('#mengban').hide();
        //    });
        //
        //    $('.choseeqmall').siblings().removeClass('btn-success').addClass('btn-white');
        //    $('.choseeqmall').removeClass('btn-white').addClass('btn-success');
        //    tofilterEquipment_id="all";
        //
        //    tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);
        //})
    });
};

Template.projectPicture.onCreated(function() {
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

    //当前项目的_id
    //choosepro=sessionStorage.getItem('choosepro');
    if (typeof( Session.get('choosepro')) == 'undefined') {
        Session.setDefault('choosepro', sessionStorage.getItem('choosepro'));
    }
    choosepro=Session.get("choosepro");
    console.log(choosepro);
    //订阅数据
    //左边栏需要的订阅
    $('#mengban').show();
    this.subscribe('project',loguser);
    this.subscribe('allusers');
    //this.subscribe('dictionaries');


    //项目类型
    _changeType=this.subscribe('protype',choosepro);
    //点位信息
    _changePoint=this.subscribe('pointinfo',function(){
        var totle = Pointinfo.find().count();
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
    //方向/设备
    _changeEquipment=this.subscribe('equipment');
    //照片分类
    _changeImageclassify=this.subscribe('imageclassify');
    //照片具体信息
    _changeImagedetail=this.subscribe('imagedetail');
    //照片列表
    _changeImageinfo=this.subscribe('imageinfo',function(){
        $('#mengban').hide();
    });

    //项目类型本地变量
    var type_data= Projecttype.find().fetch();
    //ReactiveDict本地变量
    this.editorTypeData = new ReactiveVar(type_data);
    //Template.instance().editorTypeData.set(Projecttype.find().fetch());

    //点位信息本地变量
    var _data= Pointinfo.find().fetch();
    //ReactiveDict本地变量
    this.editorPointData = new ReactiveVar(_data);

    //当前页码
    this.nowpageData = new ReactiveVar();

    //清空变量
    proType_id=null;
    point_id=null;
    imgClass_id=null;
    imgDetail_id=null;
    tofilterEquipment_id="all";
    tofilterImgclass_id="all";
    tofilterImgdetail_id="all";
    tofilterAcc="all";

});

Template.projectPicture.helpers({
    //项目类型
    proType: function(){
        return Projecttype.find();
    },
    //点位信息
    pointTable: function() {
        var page = Template.instance().nowpageData.get();
        var bendiPoint=Pointinfo.find({},{skip:(page-1)*limit,limit:limit}).fetch();

        for(var i=0;i<bendiPoint.length;i++){
            bendiPoint[i].ordinal=i+1;
            //Meteor.call('calculationPiccount',bendiPoint[i]._id,function(error,res){
            //    if(typeof error != 'undefined'){
            //        console.log(error);
            //    }else{
            //        if(res['success']==true){
            //            bendiPoint[i].picsum=res['result'];
            //        }
            //    }
            //});
        }
        return bendiPoint;
    },
    //得到每个点位的照片数
    //getPiccount: function(a) {
    //    Meteor.call('calculationPiccount',a,function(error,res){
    //        return res['result'];
    //    });
    //},
    //单条点位信息
    editorPoint: function() {
        var _data=Template.instance().editorPointData.get();
        return _data;
    },
    //方向/设备
    equipment: function() {
        //return Equipment.find();
        return Equipment.find({"name":{$ne:null}});
    },
    //照片分类
    imageclassify: function(){
        return Imageclassify.find();
    },
    //照片具体信息
    imageDetail: function(){
        return Imagedetail.find();
    },
    //照片列表
    imageinfo: function(){
        var bendiImageinfo=Imageinfo.find({},{sort:{createtime:-1}}).fetch();

        for(var i=0;i<bendiImageinfo.length;i++){
            bendiImageinfo[i].createtime=formatDate_zsc(bendiImageinfo[i].createtime*1000);
            if(!bendiImageinfo[i].takeTime){
                bendiImageinfo[i].takeTime='拍摄时间：无'
            }else{
                bendiImageinfo[i].takeTime='拍摄时间：'+bendiImageinfo[i].takeTime;
            }
            if(bendiImageinfo[i].imgRemark){
                bendiImageinfo[i].imgRemark='备注：'+bendiImageinfo[i].imgRemark;
            }else{
                bendiImageinfo[i].imgRemark='备注：无';
            }
            if(bendiImageinfo[i].byusername){
                bendiImageinfo[i].byusername='拍摄者：'+bendiImageinfo[i].byusername;
            }
            else{
                bendiImageinfo[i].byusername='拍摄者：无';
            }
            if(bendiImageinfo[i].pointName){
                bendiImageinfo[i].pointName='所属点位：'+bendiImageinfo[i].pointName;
            }
            else{
                bendiImageinfo[i].pointName='所属点位：无';
            }
        }
        return bendiImageinfo;
    },
});


Template.projectPicture.events({
    'click .chosetype':function(e){
        e.preventDefault();
        proType_id=this._id;
        console.log(proType_id);


        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');

        //改变点位信息的订阅
        //$('#mengban').show();
        _changePoint.stop();
        _changePoint=Meteor.subscribe('pointinfo',proType_id,sortname,sorttype,function(){
            var pointinfos=Pointinfo.find().fetch();
            var totle = Pointinfo.find().count();
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
            //$('#mengban').hide();
            //$('.getPoint:first-child').click();
            //console.log(Pointinfo.find().fetch());
            if(pointinfos && pointinfos.length>0){
                point_id=Pointinfo.find().fetch()[0]._id;
            }
            _changeEquipment.stop();
            _changeEquipment=Meteor.subscribe('equipment',point_id,function(){

            });
            _changeImageclassify.stop();
            _changeImageclassify=Meteor.subscribe('imageclassify',proType_id,function(){

            });

            $('.choseeqmall').siblings().removeClass('btn-success').addClass('btn-white');
            $('.choseeqmall').removeClass('btn-white').addClass('btn-success');

            $('.choseimgclassall').siblings().removeClass('btn-success').addClass('btn-white');
            $('.choseimgclassall').removeClass('btn-white').addClass('btn-success');

            $('.chosedetailall').siblings().removeClass('btn-success').addClass('btn-white');
            $('.chosedetailall').removeClass('btn-white').addClass('btn-success');

            $('.choseaccall').siblings().removeClass('btn-success').addClass('btn-white');
            $('.choseaccall').removeClass('btn-white').addClass('btn-success');

            tofilterEquipment_id="all";
            tofilterImgclass_id="all";
            tofilterImgdetail_id="all";
            tofilterAcc="all";

            tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

        });

        //改变照片分类的订阅
        //$('#mengban').show();
        //_changeImageclassify.stop();
        //_changeImageclassify=Meteor.subscribe('imageclassify',proType_id,function(){
        //    $('#mengban').hide();
        //    // _changeImageclassify.stop();
        //    // _changeImageclassify=tem2;
        //});

        //取消方向/设备订阅，防止点过去第一次保留上一个type的方向/设备，照片分类，照片具体信息,照片
        //_changeEquipment.stop();
        //_changeImageclassify.stop();
        _changeImagedetail.stop();
        //_changeImageinfo.stop();


        //防止照片存留
        point_id=null;

        //设置默认筛选为全部
        //没用
        //$($('.getPoint')[0]).click();





        //$('.choseeqmall').siblings().removeClass('btn-success').addClass('btn-white');
        //$('.choseeqmall').removeClass('btn-white').addClass('btn-success');
        //
        //$('.choseimgclassall').siblings().removeClass('btn-success').addClass('btn-white');
        //$('.choseimgclassall').removeClass('btn-white').addClass('btn-success');
        //
        //$('.chosedetailall').siblings().removeClass('btn-success').addClass('btn-white');
        //$('.chosedetailall').removeClass('btn-white').addClass('btn-success');
        //
        //$('.choseaccall').siblings().removeClass('btn-success').addClass('btn-white');
        //$('.choseaccall').removeClass('btn-white').addClass('btn-success');
        //
        //tofilterEquipment_id="all";
        //tofilterImgclass_id="all";
        //tofilterImgdetail_id="all";
        //tofilterAcc="all";
        //
        //tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);





        //console.log('choosepro:'+ choosepro);
        //console.log('proType_id:'+ proType_id);
        //console.log('point_id:'+ point_id);
        //console.log('tofilterEquipment_id:'+ tofilterEquipment_id);
        //console.log('tofilterImgclass_id:'+ tofilterImgclass_id);
        //console.log('tofilterImgdetail_id:'+ tofilterImgdetail_id);
        //console.log('tofilterAcc:'+ tofilterAcc);

    },
    //表头编号的点击排序
    //'click .tosort':function(e){
    //    e.preventDefault();
    //    if($(e.target).hasClass('tosort')){
    //        if(sorttype==1){
    //            $(e.target).find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
    //            sorttype=-1;
    //        }
    //        else if(sorttype==-1){
    //            $(e.target).find('i').removeClass('fa-caret-up').addClass('fa-caret-down');
    //            sorttype=1;
    //        }
    //    }
    //    else{
    //        if(sorttype==1){
    //            $(e.target).removeClass('fa-caret-down').addClass('fa-caret-up');
    //            sorttype=-1;
    //        }
    //        else if(sorttype==-1){
    //            $(e.target).removeClass('fa-caret-up').addClass('fa-caret-down');
    //            sorttype=1;
    //        }
    //    }
    //
    //    //改变点位信息的订阅
    //    $('#mengban').show();
    //    _changePoint.stop();
    //    _changePoint=Meteor.subscribe('pointinfo',proType_id,sorttype,function(){
    //        $('#mengban').hide();
    //        //_changePoint=tem;
    //        var totle = Pointinfo.find().count();
    //        console.log(totle);
    //        $('.M-box1').pagination({
    //            totalData:totle,
    //            showData:limit,
    //            coping:true,
    //            callback:function(api){
    //                console.log(api.getCurrent());
    //                pagenum=api.getCurrent();
    //                console.log(pagenum);
    //                templ.nowpageData.set(api.getCurrent());
    //            }
    //        });
    //        $('.getPoint:first-child').click();
    //    });
    //},
    //修改备注按钮
    'click .toEditBz':function(e){
        e.preventDefault();
        point_id=this._id;
        Template.instance().editorPointData.set(Pointinfo.find({_id:point_id}).fetch());
    },
    //确认修改备注
    'click .editBz':function(e){
        e.preventDefault();
        var bzPoint=$('#myModalBzPoint');
        var pointRemark=bzPoint.find('.editPointRemark').val();
        $('#mengban').show();
        Meteor.call('editBz',point_id,pointRemark,function(error,res){
            $('#mengban').hide();
        });
    },

    //点击一行，改变下面的方向/设备订阅
    'click .getPoint':function(e){
        e.preventDefault();
        point_id=this._id;
        //改变方向/设备的订阅
        $('#mengban').show();
        _changeEquipment.stop();
        _changeEquipment=Meteor.subscribe('equipment',point_id,function(){
            $('#mengban').hide();
            // _changeEquipment.stop();
            // _changeEquipment=tem;
        });

        //$('.choseeqmall').click();
        $('.choseeqmall').siblings().removeClass('btn-success').addClass('btn-white');
        $('.choseeqmall').removeClass('btn-white').addClass('btn-success');
        tofilterEquipment_id="all";
        //$('.choseimgclassall').click();
        //$('.chosedetailall').click();
        //$('.choseaccall').click();

        //console.log('choosepro:'+ choosepro);
        //console.log('proType_id:'+ proType_id);
        //console.log('point_id:'+ point_id);
        //console.log('tofilterEquipment_id:'+ tofilterEquipment_id);
        //console.log('tofilterImgclass_id:'+ tofilterImgclass_id);
        //console.log('tofilterImgdetail_id:'+ tofilterImgdetail_id);
        //console.log('tofilterAcc:'+ tofilterAcc);
        //改变照片的订阅
        //var tem111=Meteor.subscribe('imageinfo',choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc,function(){
        //    _changeImageinfo.stop();
        //    _changeImageinfo=tem111;
        //});
        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);
        //console.log(Imageinfo.find().fetch());



        //e.currentTarget得到祖先级，具体哪个祖先级不知道
        //console.log($(e.currentTarget));
        var this_tr=e.currentTarget;
        $(this_tr).siblings().removeClass('active');
        $(this_tr).addClass('active');
    },

    //方向筛选
    'click .choseeqm':function(e){
        e.preventDefault();
        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');
    },
    //选择某个方向
    'click .choseeqmone':function(e){
        e.preventDefault();
        tofilterEquipment_id=this._id;
        console.log(tofilterEquipment_id);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //选择全部方向
    'click .choseeqmall':function(e){
        e.preventDefault();
        tofilterEquipment_id='all';
        console.log(tofilterEquipment_id);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //照片类型筛选
    'click .choseimgclass':function(e){
        e.preventDefault();
        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');
    },
    //选择一个照片类型，改变下面的具体信息
    'click .choseimgclassone':function(e){
        e.preventDefault();
        imgClass_id=this._id;
        tofilterImgclass_id=this._id;
        console.log(tofilterImgclass_id);
        //改变具体信息的订阅
        _changeImagedetail.stop();
        _changeImagedetail=Meteor.subscribe('imagedetail',imgClass_id,function(){
            // _changeImagedetail.stop();
            // _changeImagedetail=tem;
        });
        //$('.chosedetailall').click();
        $('.chosedetailall').siblings().removeClass('btn-success').addClass('btn-white');
        $('.chosedetailall').removeClass('btn-white').addClass('btn-success');
        tofilterImgdetail_id="all";

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //选择全部照片类型
    'click .choseimgclassall':function(e){
        e.preventDefault();
        tofilterImgclass_id='all';
        console.log(tofilterImgclass_id);
        //改变具体信息的订阅，全不订阅
        _changeImagedetail.stop();
        _changeImagedetail=Meteor.subscribe('imagedetail');
        //$('.chosedetailall').click();
        $('.chosedetailall').siblings().removeClass('btn-success').addClass('btn-white');
        $('.chosedetailall').removeClass('btn-white').addClass('btn-success');
        tofilterImgdetail_id="all";

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);
    },
    //照片具体信息筛选
    'click .chosedetail':function(e){
        e.preventDefault();
        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');
    },
    //选择一个照片具体信息
    'click .chosedetailone':function(e){
        e.preventDefault();
        tofilterImgdetail_id=this._id;
        console.log(tofilterImgdetail_id);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);
    },
    //选择全部照片具体信息
    'click .chosedetailall':function(e){
        e.preventDefault();
        tofilterImgdetail_id='all';
        console.log(tofilterImgdetail_id);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //验收前后筛选
    'click .choseacc':function(e){
        e.preventDefault();
        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');
    },
    //验收前
    'click .choseaccbefore':function(e){
        e.preventDefault();
        tofilterAcc='before';
        console.log(tofilterAcc);

        //var base64= 'data:image/png;base64,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';
        //Meteor.call('imageUpload',base64,choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,'ertwet3rth','ZgWB8hD5vpQgrEydF');

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //验收后
    'click .choseaccafter':function(e){
        e.preventDefault();
        tofilterAcc='after';
        console.log(tofilterAcc);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);

    },
    //验收前和后，all
    'click .choseaccall':function(e){
        e.preventDefault();
        tofilterAcc='all';
        console.log(tofilterAcc);

        tofilter(choosepro,proType_id,point_id,tofilterEquipment_id,tofilterImgclass_id,tofilterImgdetail_id,tofilterAcc);
    },


    //鼠标移到照片缩略图上时显示删除按钮
    'mouseenter .pics':function(e){
        e.preventDefault();
        $(e.target).find('.toremovePic').show();
    },
    //鼠标移到照片缩略图上时隐藏删除按钮
    'mouseleave .pics':function(e){
        e.preventDefault();
        $(e.target).find('.toremovePic').hide();
    },
    //点击照片上的删除按钮
    'click .toremovePic':function(e){
        e.preventDefault();
        image_id=this._id;
        console.log(image_id);
    },
    //确认删除照片
    'click .removePic':function(e){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removeImage',image_id,function(error,res){
            $('#mengban').hide();
        });
    },

    //双击照片打开大图
    'dblclick .jl-img':function(e){
        e.preventDefault();
        image_id=this._id;
    },

    //搜索
    'click .toSearchPoint': function(e) {
        e.preventDefault();
        var searchHTML=$('.searchPoint').val();
        console.log(searchHTML);

        $('#mengban').show();
        _changePoint.stop();
        _changeEquipment.stop();
        _changePoint=Meteor.subscribe('pointinfo',proType_id,sortname,sorttype,searchHTML,function(){
            $('#mengban').hide();
            var totle = Pointinfo.find().count();
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

    },
    'keydown .searchPoint':function(e){
        if(e && e.keyCode==13){ // enter 键
            var searchHTML=$('.searchPoint').val();
            $('#mengban').show();
            _changePoint.stop();
            _changeEquipment.stop();
            _changePoint=Meteor.subscribe('pointinfo',proType_id,sortname,sorttype,searchHTML,function(){
                $('#mengban').hide();
                var totle = Pointinfo.find().count();
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
        }
    }
});