import "./projectBasic.html"

//Template.projectBasic.onDestroyed (function(){
//    console.log($('.chosetype:first-child'));
//    $('.chosetype:first-child').trigger('click');
//});
//Meteor.setTimeout(function(){
//    console.log($('.chosetype:first-child'));
//    $('.chosetype:first-child').trigger('click');
//}, 1000);
let loguser;
let choosepro;
let proType_id;
let point_id;
let imgClass_id;
let imgDetail_id;
let equipment_id;
let _changeType;
let _changePoint;
let _changeEquipment;
let _changeImageclassify;
let _changeImagedetail;
let __uploadFile;

let _this_btn;


let pagenum;
let limit=10;
let templ;

//正逆序排序
let sorttype=1;
//排序字段
let sortname='code';

//向新增点位模态框还是编辑点位模态框插入经纬度
let map;
let intoWhich;
let intolng;
let intolat;

//显隐提示
function prompt(val,shObj){
    if(!val) {
        shObj.show();
    }else{
        shObj.hide();
    }
}





//$("#myModalAddPoint").on("mouseenter",".neweqmBtn", function(e) {
//    $(e.target).find('.toremoveEqm').show();
//});





Template.projectBasic.onDestroyed (function(){
    _changeType.stop();
    _changePoint.stop();
    _changeEquipment.stop();
    _changeImageclassify.stop();
    _changeImagedetail.stop();

    proType_id=null;
    point_id=null;
    imgClass_id=null;
    imgDetail_id=null;
    equipment_id=null;


    //没用
    //Template.instance().editorTypeData.set(Projecttype.find({_id:0}).fetch());
});

Template.projectBasic.onRendered(function() {
    //	地图
    map = new BMap.Map("map");
    var point = new BMap.Point(120.193393,30.273018);
    map.centerAndZoom(point,13);
    var geoc = new BMap.Geocoder();

    //var geolocation = new BMap.Geolocation();
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

//    geolocation.getCurrentPosition(function(r){
//        if(this.getStatus() == BMAP_STATUS_SUCCESS){
//            var mk = new BMap.Marker(r.point);
////			map.addOverlay(mk);
//            map.panTo(r.point);
//        }
//        else {
//            alert('failed'+this.getStatus());
//        }
//    },{enableHighAccuracy: true});


    //定义setTimeout执行方法
    var maptime = null;
    //添加点击事件显示当前定位
    map.addEventListener("click",function(e){
        // 取消上次延时未执行的方法
        clearTimeout(maptime);
        //执行延时
        maptime = setTimeout(function(){
            //单击事件要执行的代码
            map.clearOverlays();//清楚标记

            var pt = e.point;
            var info2;
            geoc.getLocation(pt, function(rs){
                var addComp = rs.addressComponents;
                info2='当前选择点位置：'+addComp.province + " " + addComp.city + " " + addComp.district + " " + addComp.street + " " + addComp.streetNumber;
                templ.nowPointInfo2.set(info2);
                //alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
            });

            console.log('单击选择点经度：'+e.point.lng + ";单击选择点纬度：" + e.point.lat);
            var info='当前选择点经度：'+e.point.lng + "; 纬度：" + e.point.lat;
            templ.nowPointInfo.set(info);
            intolng=e.point.lng;
            intolat=e.point.lat;
            var point = new BMap.Point(e.point.lng, e.point.lat);
            //map.centerAndZoom(point, 15);
            var marker = new BMap.Marker(point);  // 创建标注
            map.addOverlay(marker);               // 将标注添加到地图中
            marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        },300);
    });

    //添加双击事件显示当前定位
    map.addEventListener("dblclick",function(e){
        // 取消上次延时未执行的方法
        clearTimeout(maptime);
        //双击事件的执行代码
        console.log('选择点经度：'+intolng + ";选择点纬度：" + intolat);
        $('.mapWarp').hide();
        templ.nowPointInfo.set(null);
        templ.nowPointInfo2.set(null);
        map.clearOverlays();//清楚标记
        if(intoWhich){
            $('#myModalAddPoint .latitude').val(intolat);
            $('#myModalAddPoint .longitude').val(intolng);
            intolng=null;
            intolat=null;
        }
        else{
            if(intolat && intolng){
                $('#myModalEditPoint .latitude').val(intolat);
                $('#myModalEditPoint .longitude').val(intolng);
                intolng=null;
                intolat=null;
            }
        }
    });
});



Template.projectBasic.rendered = function(){

    // Initialize i-check plugin
    //$('.i-checks').iCheck({
    //    checkboxClass: 'icheckbox_square-green',
    //    radioClass: 'iradio_square-green'
    //});

    //Meteor.setTimeout(function(){
    //    $('.chosetype:first-child').click();
    //    Meteor.setTimeout(function(){
    //        $('.getImgClass:first-child').click();
    //    }, 100);
    //}, 100);

    _changeType=Meteor.subscribe('protype',choosepro,function(){
        $('.chosetype:first-child').click();
        Meteor.subscribe('imageclassify',function(){
            $('.getImgClass:first-child').click();
        })
        Meteor.subscribe('pointinfo',function(){
            $('.getPoint:first-child').click();
        })
    });



};

Template.projectBasic.onCreated(function() {
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

    sorttype=1;

    //当前项目的_id
    //var choosepro=sessionStorage.getItem('choosepro');
    if (typeof( Session.get('choosepro')) == 'undefined') {
        Session.setDefault('choosepro', sessionStorage.getItem('choosepro'));
    }
    choosepro=Session.get("choosepro");
    console.log(choosepro);
    //订阅数据
    //左边栏需要的订阅
    $('#mengban').show();
    this.subscribe('project',loguser);
    this.subscribe('allusers',function(){
        // Initialize i-check plugin
        //$('.i-checks').iCheck({
        //    checkboxClass: 'icheckbox_square-green',
        //    radioClass: 'iradio_square-green'
        //});
    });
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
    _changeImagedetail=this.subscribe('imagedetail', function () {
        $('#mengban').hide();
    });


    //项目类型本地变量
    var type_data= Projecttype.find().fetch();
    //ReactiveDict本地变量
    this.editorTypeData = new ReactiveVar(type_data);
    Template.instance().editorTypeData.set(Projecttype.find({_id:0}).fetch());

    //点位信息本地变量
    var _data= Pointinfo.find().fetch();
    //ReactiveDict本地变量
    this.editorPointData = new ReactiveVar(_data);


    //照片分类本地变量
    var Imageclass_data= Imageclassify.find().fetch();
    //ReactiveDict本地变量
    this.editorImageclassData = new ReactiveVar(Imageclass_data);

    //照片具体信息本地变量
    var Imagedetail_data= Imagedetail.find().fetch();
    //ReactiveDict本地变量
    this.editorImagedetailData = new ReactiveVar(Imagedetail_data);


    //初始化监理员选择，未选择项目类型时，勾选监理员不执行更新表操作
    //proType_id=null;
    //console.log(proType_id);

    ////方向/设备本地变量
    //var eqm_data= Equipment.find().fetch();
    ////ReactiveDict本地变量
    //this.editorEqmData = new ReactiveVar(eqm_data);
    ////Template.instance().editorEqmData.set(Equipment.find({_id:0}).fetch());
    this.currentUpload = new ReactiveVar(false);

    //当前页码
    this.nowpageData = new ReactiveVar();

    //当前地图选点的信息
    this.nowPointInfo = new ReactiveVar();
    //当前地图选点的地理位置信息
    this.nowPointInfo2 = new ReactiveVar();
});


Template.projectBasic.helpers({
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
        }
        return bendiPoint;
    },
    //当前地图选点的信息
    nowChoosePoint: function() {
        var nowChoosePoint = Template.instance().nowPointInfo.get();
        return nowChoosePoint;
    },
    //当前地图选点的地理位置信息
    nowChooseGeoc: function() {
        var nowChooseGeoc = Template.instance().nowPointInfo2.get();
        return nowChooseGeoc;
    },
    //单条点位信息
    editorPoint: function() {
        var _data=Template.instance().editorPointData.get();
        return _data;
    },
    //单条点位信息的方向/设备
    editorEqm: function() {
        var bendiEquipment=Equipment.find().fetch();
        for(var i=0;i<bendiEquipment.length;i++){
            if(!bendiEquipment[i].name){
                bendiEquipment[i].name="无";
            }
        }
        return bendiEquipment;
    },
    //方向/设备
    equipment: function() {
        var bendiEquipment=Equipment.find().fetch();

        return bendiEquipment;
    },
    //照片分类
    imageclassify: function(){
        var bendiImgClass=Imageclassify.find().fetch();

        for(var i=0;i<bendiImgClass.length;i++){
            bendiImgClass[i].ordinal=i+1;
        }
        return bendiImgClass;
    },
    editimageClass: function(){
        return Template.instance().editorImageclassData.get();
    },
    //
    imageDetail: function(){
        var bendiImgDetail=Imagedetail.find().fetch();

        for(var i=0;i<bendiImgDetail.length;i++){
            bendiImgDetail[i].ordinal=i+1;
        }
        return bendiImgDetail;
    },
    editimageDetail: function(){
        return Template.instance().editorImagedetailData.get();
    },
    selectJLY: function(){
        return Users.find({'type':3,'state':1});
    },
    JLYchecked: function(a){
        console.log('JLYchecked');
        var _data=Template.instance().editorTypeData.get();
        console.log(_data);
        var user=Users.find({_id:a}).fetch();
        console.log(user);
        if(_data[0] && user[0])
        {
            var _this_supervision=_data[0].supervision;
            console.log(_this_supervision);
            var ischecked=false;
            for(var i=0;i<_this_supervision.length;i++){
                if(_this_supervision[i]==user[0]._id){
                    ischecked=true;
                    console.log(_this_supervision[i]);
                    console.log(user[0]._id);
                    console.log('true');
                }
            }
            return ischecked;
        }
        return false;
    },
    currentUpload: function () {
        return Template.instance().currentUpload.get();
    },
    //监理员和业主隐藏操作功能
    ifToChange:function(){
        var user = Users.findOne({_id:loguser});
        if(user)
        {
            var type=user.type;

            if(type==3 || type==4){
                return false;
            }else{
                return true;
            }
        }
        return false;
    }
});

Template.projectBasic.events({
    'click .chosetype':function(e){
        e.preventDefault();
        proType_id=this._id;
        //console.log(proType_id);

        //清空搜索框
        $('.searchPoint').val('');

        //清空照片分类
        imgClass_id=null;

        //得到这个类型对应的监理员
        Template.instance().editorTypeData.set(Projecttype.find({_id:proType_id}).fetch());

        $(e.target).siblings().removeClass('btn-success').addClass('btn-white');
        $(e.target).removeClass('btn-white').addClass('btn-success');

        //取消方向/设备订阅，防止点过去第一次保留上一个type的方向/设备，照片分类，照片具体信息
        _changeEquipment.stop();
        _changeImageclassify.stop();
        _changeImagedetail.stop();
        //改变点位信息的订阅
        $('#mengban').show();
        _changePoint.stop();
        _changePoint=Meteor.subscribe('pointinfo',proType_id,sortname,sorttype,function(){
            $('#mengban').hide();
            //_changePoint=tem;
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
            //$('.getPoint:first-child').click();
            _changeEquipment.stop();
        });

        //改变照片分类的订阅
        $('#mengban').show();
        _changeImageclassify.stop();
        _changeImageclassify=Meteor.subscribe('imageclassify',proType_id,function(){
            $('#mengban').hide();
            //_changeImageclassify=tem2;
            $('.getImgClass:first-child').click();
        });
    },
    //表头编号的点击排序
    'click .tosort':function(e){
        e.preventDefault();
        if($(e.target).hasClass('tosort')){
            if(sorttype==1){
                $(e.target).find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
                sorttype=-1;
                sortname= $(e.target).find('i').attr('data');
            }
            else if(sorttype==-1){
                $(e.target).find('i').removeClass('fa-caret-up').addClass('fa-caret-down');
                sorttype=1;
                sortname= $(e.target).find('i').attr('data');
            }
        }
        else{
            if(sorttype==1){
                $(e.target).removeClass('fa-caret-down').addClass('fa-caret-up');
                sorttype=-1;
                sortname= $(e.target).attr('data');
            }
            else if(sorttype==-1){
                $(e.target).removeClass('fa-caret-up').addClass('fa-caret-down');
                sorttype=1;
                sortname= $(e.target).attr('data');
            }
        }

        //改变点位信息的订阅
        $('#mengban').show();
        _changePoint.stop();
        _changePoint=Meteor.subscribe('pointinfo',proType_id,sortname,sorttype,function(){
            $('#mengban').hide();
            //_changePoint=tem;
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
            //$('.getPoint:first-child').click();
            _changeEquipment.stop();
        });
    },
    'click .toaddpoint':function(e){
        e.preventDefault();

        intoWhich=true;

        var addPoint=$('#myModalAddPoint');
        addPoint.find('.code').val('');
        addPoint.find('.loadName').val('');
        addPoint.find('.latitude').val('');
        addPoint.find('.longitude').val('');
        addPoint.find('.region').val('');
        addPoint.find('.equipment').val('');
        addPoint.find('.pointRemark').val('');

        addPoint.find('.neweqm').val('');
        addPoint.find('.newcount').val('');
        addPoint.find('.neweqmBtn').detach();

        _this_btn=$(e.target);
        $('#myModalAddPoint .serverRes').html('');
        $('#myModalAddPoint .serverRes').hide();
        $('#myModalAddPoint .codeNone').hide();
        $('#myModalAddPoint .loadNameNone').hide();
        $('#myModalAddPoint .regionNone').hide();
    },
    'click .addpoint':function(e){
        e.preventDefault();
        var addPoint=$('#myModalAddPoint');
        var code=$.trim(addPoint.find('.code').val());
        var loadName=$.trim(addPoint.find('.loadName').val());
        var latitude=$.trim(addPoint.find('.latitude').val());
        var longitude=$.trim(addPoint.find('.longitude').val());
        var region=$.trim(addPoint.find('.region').val());
        var pointRemark=addPoint.find('.pointRemark').val();

        //处理输入的方向/设备
        //if(equipment && equipment.search(/\n/ig)!= -1){
        //    equipment=equipment.replace(/(\n)+/ig,'\n');
        //    equipment=equipment.replace(/(\n)$/ig,'');
        //    equipment=equipment.replace(/(\n)/ig,'\"\"');
        //    equipment = '"'+equipment+'"';
        //}else if(equipment && equipment.search(/\n/ig)== -1){
        //    equipment='"'+equipment+'"';
        //}
        var equipment=addPoint.find('.neweqmBtn');
        var neweqm;
        var newcount;
        var equipmentPP=[];
        for(var i=0;i<equipment.length;i++){
            neweqm=$(equipment[i]).find('.eqm').html();
            newcount=$(equipment[i]).find('.pics').val();
            newcount=parseInt(newcount);
            equipmentPP.push({
                'eqm':neweqm,
                'count':newcount
            })
        }
        //console.log(equipmentPP);

        prompt(code,$('#myModalAddPoint .codeNone'));
        prompt(loadName,$('#myModalAddPoint .loadNameNone'));
        prompt(region,$('#myModalAddPoint .regionNone'));


        if(code && loadName && region){
            $('#mengban').show();
            Meteor.call('addPoint',proType_id,code,loadName,latitude,longitude,region,equipmentPP,pointRemark,function(error,res){
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
                        $('#myModalAddPoint .serverRes').html(res['msg']);
                        $('#myModalAddPoint .serverRes').show();
                    }
                }
            });
        }
    },
    //新增、编辑点位地图选择经纬度
    'click .gomap':function(e){
        e.preventDefault();
        $('.mapWarp').show();
        //新增点位时默认位置在杭州中心
        if(intoWhich){
            map.centerAndZoom("杭州",13);
        }
        //编辑点位时默认位置在该点位
        else{
            var _thispoint = new BMap.Point(Pointinfo.find({_id:point_id}).fetch()[0].longitude,Pointinfo.find({_id:point_id}).fetch()[0].latitude);
            //map.centerAndZoom(point, 15);
            var marker = new BMap.Marker(_thispoint);  // 创建标注
            map.addOverlay(marker);               // 将标注添加到地图中
            marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
            //map.panTo(_thispoint,13);
            setTimeout(function(){
                console.log("到点位去");
                map.panTo(_thispoint,13);
            }, 100);
        }
    },
    //关闭地图按钮
    'click .mapClose':function(e){
        e.preventDefault();
        map.clearOverlays();//清楚标记
        $('.mapWarp').hide();
        templ.nowPointInfo.set(null);
        templ.nowPointInfo2.set(null);
        intolng=null;
        intolat=null;
    },
    //删除点位信息按钮
    'click .toRemovePoint':function(e){
        e.preventDefault();
        point_id=this._id;
        console.log(point_id);
    },
    //确认删除点位信息
    'click .delpoint':function(e){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removePoint',point_id,function(error,res){
            $('#mengban').hide();
        });
        if($('.getPoint').length>0){
            point_id=null;
            $('.getPoint:first-child').click();
        }else{
            point_id=null;
        }
    },

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

    //编辑点位按钮
    'click .toEditPoint':function(e){
        e.preventDefault();

        intoWhich=false;

        point_id=this._id;
        var editPoint=$('#myModalEditPoint');
        editPoint.find('.neweqm').val('');

        _this_btn=$(e.target);
        $('#myModalEditPoint .serverRes').html('');
        $('#myModalEditPoint .serverRes').hide();
        $('#myModalEditPoint .codeNone').hide();
        $('#myModalEditPoint .loadNameNone').hide();
        $('#myModalEditPoint .regionNone').hide();

        Template.instance().editorPointData.set(Pointinfo.find({_id:point_id}).fetch());

        //Template.instance().editorEqmData.set(Equipment.find({'belongPoint':point_id}).fetch());
    },
    //确认编辑点位
    'click .editpoint':function(e){
        e.preventDefault();
        var editPoint=$('#myModalEditPoint');
        var code=$.trim(editPoint.find('.code').val());
        var loadName=$.trim(editPoint.find('.loadName').val());
        var latitude=$.trim(editPoint.find('.latitude').val());
        var longitude=$.trim(editPoint.find('.longitude').val());
        var region=$.trim(editPoint.find('.region').val());
        var pointRemark=editPoint.find('.pointRemark').val();

        prompt(code,$('#myModalEditPoint .codeNone'));
        prompt(loadName,$('#myModalEditPoint .loadNameNone'));
        prompt(region,$('#myModalEditPoint .regionNone'));

        if(code && loadName && region){
            $('#mengban').show();
            Meteor.call('editPoint',point_id,code,loadName,latitude,longitude,region,pointRemark,function(error,res){
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
                        $('#myModalEditPoint .serverRes').html(res['msg']);
                        $('#myModalEditPoint .serverRes').show();
                    }
                }
            });
        }

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
            // _changeEquipment=tem;
            //Template.instance().editorEqmData.set(Equipment.find({'belongPoint':point_id}).fetch());
        });
        //Template.instance().editorEqmData.set(Equipment.find({'belongPoint':point_id}).fetch());


        //e.currentTarget得到祖先级，具体哪个祖先级不知道
        console.log($(e.currentTarget));
        var this_tr=e.currentTarget;
        $(this_tr).siblings().removeClass('active');
        $(this_tr).addClass('active');
    },


    //添加照片分类按钮
    'click .toaddimgclass':function(e){
        e.preventDefault();
        var addImgClass=$('#myModalAddImgClass');

        _this_btn=$(e.target);
        $('#myModalAddImgClass .newImgClassNone').hide();

        addImgClass.find('.newImgClass').val('');
    },
    //确定添加照片分类
    'click .addImgClass':function(e){
        e.preventDefault();
        var addImgClass=$('#myModalAddImgClass');
        var newImgClass=$.trim(addImgClass.find('.newImgClass').val());

        prompt(newImgClass,$('#myModalAddImgClass .newImgClassNone'));

        if(newImgClass){
            $('#mengban').show();
            Meteor.call('addImgClass',proType_id,newImgClass,function(error,res){
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
    //编辑照片分类
    'click .toeditimgclass':function(e){
        e.preventDefault();
        imgClass_id=this._id;
        _this_btn=$(e.target);
        Template.instance().editorImageclassData.set(Imageclassify.find({_id:imgClass_id}).fetch());

        $('#myModalEditImgClass .ImgClassNone').hide();
    },
    //确定编辑照片分类
    'click .editImgClass':function(e){
        e.preventDefault();
        var editImgClass=$('#myModalEditImgClass');

        var imgClass=$.trim(editImgClass.find('.ImgClass').val());

        prompt(imgClass,$('#myModalEditImgClass .ImgClassNone'));

        if(imgClass){
            $('#mengban').show();
            Meteor.call('editImgClass',imgClass_id,imgClass,function(error,res){
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
    //删除照片分类按钮
    'click .toremoveimgclass':function(e){
        e.preventDefault();
        imgClass_id=this._id;
        console.log(imgClass_id);
    },
    //确认删除照片分类
    'click .removeImgClass':function(e){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removeImgClass',imgClass_id,function(error,res){
            $('#mengban').hide();
        });
        if($('.getImgClass').length>0){
            imgClass_id=null;
            $('.getImgClass:first-child').click();
        }else{
            imgClass_id=null;
        }
    },
    //点击一行，改变右边的具体信息
    'click .getImgClass':function(e){
        e.preventDefault();
        imgClass_id=this._id;
        //改变具体信息的订阅
        $('#mengban').show();
        _changeImagedetail.stop();
        _changeImagedetail=Meteor.subscribe('imagedetail',imgClass_id,function(){
            $('#mengban').hide();
            // _changeImagedetail=tem;
        });

        //e.currentTarget得到祖先级，具体哪个祖先级不知道
        console.log($(e.currentTarget));
        var this_tr=e.currentTarget;
        $(this_tr).siblings().removeClass('active');
        $(this_tr).addClass('active');
    },


    //添加照片具体信息按钮
    'click .toaddimgdetail':function(e){
        e.preventDefault();
        var addImgDetail=$('#myModalAddImgDetail');

        _this_btn=$(e.target);
        $('#myModalAddImgDetail .serverRes').html('');
        $('#myModalAddImgDetail .serverRes').hide();
        $('#myModalAddImgDetail .newImgDetailNone').hide();

        addImgDetail.find('.newImgDetail').val('');
    },
    //确定添加照片具体信息
    'click .addImgDetail':function(e){
        e.preventDefault();
        var addImgDetail=$('#myModalAddImgDetail');
        var newImgDetail=$.trim(addImgDetail.find('.newImgDetail').val());

        prompt(newImgDetail,$('#myModalAddImgDetail .newImgDetailNone'));

        if(newImgDetail){
            $('#mengban').show();
            Meteor.call('addImgDetail',imgClass_id,newImgDetail,function(error,res){
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
                        $('#myModalAddImgDetail .serverRes').html(res['msg']);
                        $('#myModalAddImgDetail .serverRes').show();
                    }
                }
            });
        }
    },
    //编辑照片具体信息
    'click .toeditimgdetail':function(e){
        e.preventDefault();
        imgDetail_id=this._id;
        _this_btn=$(e.target);
        Template.instance().editorImagedetailData.set(Imagedetail.find({_id:imgDetail_id}).fetch());

        $('#myModalEditImgDetail .ImgDetailNone').hide();
    },
    //确定编辑照片具体信息
    'click .editImgDetail':function(e){
        e.preventDefault();
        var editImgDetail=$('#myModalEditImgDetail');

        var imgDetail=$.trim(editImgDetail.find('.ImgDetail').val());

        prompt(imgDetail,$('#myModalEditImgDetail .ImgDetailNone'));

        if(imgDetail){
            $('#mengban').show();
            Meteor.call('editImgDetail',imgDetail_id,imgDetail,function(error,res){
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
    //删除照片具体信息按钮
    'click .toremoveimgdetail':function(e){
        e.preventDefault();
        imgDetail_id=this._id;
        console.log(imgDetail_id);
    },
    //确认删除照片具体信息
    'click .removeImgDetail':function(e){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('removeImgDetail',imgDetail_id,function(error,res){
            $('#mengban').hide();
        });
    },


    //监理员选择的过程
    'click .checkboxJLY':function(e){
        //console.log(e.target.checked);
        //console.log(this._id);
        var changedJLY={
            'jly_id':this._id,
            'jly_checked':e.target.checked
        };

        //console.log($('.checkboxJLY'));
        $('#mengban').show();
        Meteor.call('changeJLY',proType_id,changedJLY,function(error,res){
            $('#mengban').hide();
        });
    },

    //鼠标移入方向/设备按钮时显示删除按钮
    'mouseenter .eqmBtn':function(e){
        e.preventDefault();
        $(e.target).find('.toremoveEqm').show();
    },
    //鼠标移出方向/设备按钮时隐藏删除按钮
    'mouseleave .eqmBtn':function(e){
        e.preventDefault();
        $(e.target).find('.toremoveEqm').hide();
    },
    //点击方向/设备上的删除按钮
    'click .toremoveEqm':function(e){
        e.preventDefault();
        equipment_id=this._id;
        if(confirm( '是否确定删除此方向？ ')==true){
            $('#mengban').show();
            Meteor.call('removeEquipment',equipment_id,function(error,res){
                $('#mengban').hide();
            });
        }
    },
    //点击增加方向/设备按钮
    'click .toaddeqm':function(e){
        e.preventDefault();
        var editPoint=$('#myModalEditPoint');
        var neweqm=editPoint.find('.neweqm').val();
        var newcount=editPoint.find('.newcount').val();
        newcount=parseInt(newcount);

        $('#mengban').show();
        Meteor.call('addEquipment',point_id,neweqm,newcount,function(error,res){
            $('#mengban').hide();
            editPoint.find('.neweqm').val('');
            editPoint.find('.newcount').val('');
        });
    },
    //改变某个方向的图片数量
    'change .editpics':function(e){
        e.preventDefault();
        equipment_id=this._id;
        var newcount=$(e.target).val();
        newcount=parseInt(newcount);

        $('#mengban').show();
        Meteor.call('editPicCount',equipment_id,newcount,function(){
            $('#mengban').hide();
        });
    },
    //新增项目时添加方向
    'click .tonewaddeqm':function(e){
        e.preventDefault();
        var addPoint=$('#myModalAddPoint');
        var neweqm=addPoint.find('.neweqm').val();
        var newcount=addPoint.find('.newcount').val();
        newcount=parseInt(newcount);

        if(neweqm){
            if(newcount){
                $(e.target).parent().before(
                    '<button class="btn btn-white neweqmBtn" type="button" style="margin-bottom: 10px;position: relative;width: 100%;text-align: left"><span class="eqm">'+ neweqm+
                        '</span><input type="text" class="form-control pics" style="width: 50px;height: 20px;display: inline-block;text-align: center;float: right" value="'+newcount+'">'+
                        '<span style="float:right;font-size: 12px;padding-top: 3px">所需照片数：</span>'+
                        '<button class="btn btn-default btn-circle btn-sm toremoveEqm" type="button" style="position: absolute;top:-7px;right: -7px;display: none"><i class="fa fa-minus"></i></button>'+
                    '</button>'
                );
                addPoint.find('.neweqm').val('');
                addPoint.find('.newcount').val('');
            }else{
                $(e.target).parent().before(
                    '<button class="btn btn-white neweqmBtn" type="button" style="margin-bottom: 10px;position: relative;width: 100%;text-align: left"><span class="eqm">'+ neweqm+
                        '</span><input type="text" class="form-control pics" style="width: 50px;height: 20px;display: inline-block;text-align: center;float: right" value="'+0+'">'+
                        '<span style="float:right;font-size: 12px;padding-top: 3px">所需照片数：</span>'+
                        '<button class="btn btn-default btn-circle btn-sm toremoveEqm" type="button" style="position: absolute;top:-7px;right: -7px;display: none"><i class="fa fa-minus"></i></button>'+
                    '</button>'
                );
                addPoint.find('.neweqm').val('');
                addPoint.find('.newcount').val('');
            }
        }
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
            // _changePoint=tem;
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
                // _changePoint=tem;
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
    },
    'change #fileInput': function (e, template) {
    },
    'click .uploadFile': function(e,template) {
        e.preventDefault();
        if (document.getElementById("fileInput").files && document.getElementById("fileInput").files[0]) {
            var upload = UploadExcel.insert({
                file: document.getElementById("fileInput").files[0],
                streams: 'dynamic',
                chunkSize: 'dynamic',
                meta:{'projectId':choosepro}
            }, false);

            upload.on('start', function () {
                $('#mengban').show();
                template.currentUpload.set(this);
            });

            upload.on('end', function (error, fileObj){
                $('#mengban').hide();
                if (error) {
                    $('.modal-backdrop').fadeOut();
                    $('.modal').fadeOut();
                    //更新所有点位的照片总数
                    Meteor.call('calculationPiccount');
                    //更新点位上现有的照片数
                    Meteor.call('pointNowPicSum');
                    //更新项目进度
                    Meteor.call('proProgress',choosepro);

                    alert('导入失败'+error+'!');
                } else {
                    $('.modal-backdrop').fadeOut();
                    $('.modal').fadeOut();

                    //更新所有点位的照片总数
                    Meteor.call('calculationPiccount');
                    //更新点位上现有的照片数
                    Meteor.call('pointNowPicSum');
                    //更新项目进度
                    Meteor.call('proProgress',choosepro);


                    alert('导入成功！');
                }
                template.currentUpload.set(false);
            });

            upload.start();
        }
    },
    'click .dataExport':function(e,template){
        e.preventDefault();
        $('#mengban').show();
        Meteor.call('exportImages',choosepro,function(error,res){
            $('#mengban').hide();
            if(typeof error != 'undefined'){
                console.log(error);
            }else{
                if(res['success']==true){
                    //console.log(res['result'])
                    window.open(res['result'],'_blank');
                }else{
                    alert(res['msg']);
                }
            }
        });
    }
});
