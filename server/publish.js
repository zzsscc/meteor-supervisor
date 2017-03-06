
Meteor.publish('project', function(loguserid,search) {
    //if(loguserid=='all'){
    //    return Project.find();
    //}
    if(loguserid){
        //有搜索内容
        if(search){
            var loguserType=Users.find({'_id':loguserid}).fetch()[0].type;
            switch (loguserType) {
                case 0:
                    return Project.find({
                        'proname': {$regex: search, $options:'i'}
                    });
                case 1:
                    return Project.find({
                        'chiefEngineer':loguserid,
                        'proname': {$regex: search, $options:'i'}
                    });
                case 2:
                    return Project.find({
                        'supervisionEngineer':loguserid,
                        'proname': {$regex: search, $options:'i'}
                    });
                case 3:
                    var alltypes=Projecttype.find({}).fetch();
                    //得到和登录用户所有相关的项目类型的_id
                    var zz;
                    var supIntype=[];
                    for(var i=0;i<alltypes.length;i++){
                        zz=alltypes[i].supervision;
                        for(var j=0;j<zz.length;j++){
                            if(zz[j]==loguserid){
                                supIntype.push(alltypes[i]._id);
                            }
                        }
                    }
                    //console.log(supIntype);
                    //得到这些项目类型的序列化
                    var _that_types=Projecttype.find({'_id':{$in:supIntype}}).fetch();
                    //console.log(_that_types);
                    //得到和这些项目类型属于的项目的_id
                    var p=[];
                    for(var i=0;i<_that_types.length;i++){
                        p.push(_that_types[i].belongPro);
                    }
                    //console.log(p);
                    //去重
                    Array.prototype.unique_zsc = function(){
                        var res = [];
                        var json = {};
                        for(var i = 0; i < this.length; i++){
                            if(!json[this[i]]){
                                res.push(this[i]);
                                json[this[i]] = 1;
                            }
                        }
                        return res;
                    };
                    var pp=p.unique_zsc();
                    //console.log(pp);
                    //返回这个监理员的所有项目
                    return Project.find({
                        '_id':{$in:pp},
                        'proname': {$regex: search, $options:'i'}
                    });
                case 4:
                    var loguserlog=[loguserid];
                    return Project.find({
                        $or: [
                            {'owner':loguserid},
                            {'relationOwners': {$in:loguserlog}}
                        ],
                        'proname': {$regex: search, $options:'i'}
                    });
                //default: type=0
            }
        }
        //无搜索
        else{//无搜索
            var loguserType=Users.find({'_id':loguserid}).fetch()[0].type;
            switch (loguserType) {
                case 0:
                    return Project.find();
                case 1:
                    return Project.find({'chiefEngineer':loguserid});
                case 2:
                    return Project.find({'supervisionEngineer':loguserid});
                case 3:
                    var alltypes=Projecttype.find({}).fetch();
                    //得到和登录用户所有相关的项目类型的_id
                    var zz;
                    var supIntype=[];
                    for(var i=0;i<alltypes.length;i++){
                        zz=alltypes[i].supervision;
                        for(var j=0;j<zz.length;j++){
                            if(zz[j]==loguserid){
                                supIntype.push(alltypes[i]._id);
                            }
                        }
                    }
                    //console.log(supIntype);
                    //得到这些项目类型的序列化
                    var _that_types=Projecttype.find({'_id':{$in:supIntype}}).fetch();
                    //console.log(_that_types);
                    //得到和这些项目类型属于的项目的_id
                    var p=[];
                    for(var i=0;i<_that_types.length;i++){
                        p.push(_that_types[i].belongPro);
                    }
                    //console.log(p);
                    //去重
                    Array.prototype.unique_zsc = function(){
                        var res = [];
                        var json = {};
                        for(var i = 0; i < this.length; i++){
                            if(!json[this[i]]){
                                res.push(this[i]);
                                json[this[i]] = 1;
                            }
                        }
                        return res;
                    };
                    var pp=p.unique_zsc();
                    //console.log(pp);
                    //返回这个监理员的所有项目
                    return Project.find({'_id':{$in:pp}});
                case 4:
                    var loguserlog=[loguserid];
                    return Project.find({
                        $or: [
                            {'owner':loguserid},
                            {'relationOwners': {$in:loguserlog}}
                        ]
                    });
                //default: type=0
            }
        }
    }else{
        return Project.find({id:0});
        //return Project.find();
    }

    //var projectList=Project.find().fetch();
    //for(var i=0;i<projectList.length;i++){
    //    var engname=Users.find({'_id':projectList[i].chiefEngineer}).fetch().username;
    //    projectList[i].chiefEngineer=engname;
    //}
    //return projectList;

    //return Project.find();
});
//
//Meteor.publish('cockpitTable_user', function(a,b) {
//    if(b==0){
//        return CockpitTable.find();
//    }else if(b==1){
//        return CockpitTable.find({'chiefTel':a});
//    }else if(b==2){
//        return CockpitTable.find({'supTel':a});
//    }
//});

//发布项目id
Meteor.publish('projectss', function(project_id) {
    return Project.find({'_id':project_id});
});

Meteor.publish('users', function() {
    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
    //for(var i=0;i<bendiUT.length;i++){
    //    bendiUT[i].ordinal=i+1;
    //}
    //return bendiUT;
    return Users.find({"type":{$ne:4}});
});

Meteor.publish('allusers', function(search) {
    if(search){
        return Users.find({
            $or: [
                {'type': 0},
                {'username': {$regex: search, $options:'i'}}
            ]
        });
    }else{
        return Users.find();
    }
});

//Meteor.publish('loguser', function(loguserid) {
//    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
//    //for(var i=0;i<bendiUT.length;i++){
//    //    bendiUT[i].ordinal=i+1;
//    //}
//    //return bendiUT;
//    return Users.find({"_id":loguserid});
//});

//监理职称字典
Meteor.publish('suptitle', function() {
    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
    //return bendiUT;
    //return Dictionaries.find({"ecode":"userType","value":{$in:[1,2,3]}});
    return Dictionaries.find({"ecode":"userType"});
});


//备份方案字典
Meteor.publish('backup', function() {
    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
    //return bendiUT;
    return Dictionaries.find({"ecode":"backUp"});
});

//全部字典
Meteor.publish('dictionaries', function() {
    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
    //return bendiUT;
    return Dictionaries.find();
});

//项目类型
Meteor.publish('protype', function(belongProid) {
    //var bendiUT=Users.find({"type":{$ne:4}}).fetch();
    //return bendiUT;
    //return Dictionaries.find({"ecode":"userType","value":{$in:[1,2,3]}});
    if(belongProid){
        return Projecttype.find({'belongPro':belongProid});
    }
    else{
        return Projecttype.find({_id:0});
    }
});



//点位信息
Meteor.publish('pointinfo', function(protype_id,type,order,search) {
    //console.log(type);
    //console.log(typeof type);
    //console.log(order);
    //console.log(typeof order);
    function handlesort (key) {
        this.rule = eval ("(" + "{\"" + key + "\": "+order+"}" + ")");
    }
    var sortjosn = new handlesort(type);
    if(protype_id){
        if(search){
            return Pointinfo.find({
                'belongProType':protype_id,
                $or: [
                    {'code': {$regex: search, $options:'i'}},
                    {'name': {$regex: search, $options:'i'}}
                ],
            },{sort:sortjosn.rule});
        }else{
            //console.log(Pointinfo.find({'belongProType':protype_id},{sort:{type : order}}).fetch());
            return Pointinfo.find({'belongProType':protype_id},{sort:sortjosn.rule});
        }
    }else{
        return Pointinfo.find({_id:0});
    }
});
//点位信息发布，不传参
Meteor.publish('pointinfos', function() {

    return Pointinfo.find({});

});

//方向/设备信息
Meteor.publish('equipment', function(point_id) {
    if(point_id){
        return Equipment.find({'belongPoint':point_id});
    }else{
        return Equipment.find({_id:0});
    }
});

//照片分类
Meteor.publish('imageclassify', function(protype_id) {
    if(protype_id){
        return Imageclassify.find({'belongProType':protype_id});
    }else{
        return Imageclassify.find({_id:0});
    }
});

//照片具体信息
Meteor.publish('imagedetail', function(imgclass_id) {
    if(imgclass_id){
        return Imagedetail.find({'belongImgClass':imgclass_id});
    }else{
        return Imagedetail.find({_id:0});
    }
});



//照片数量
Meteor.publish('imageinfonum', function(belong_id,prototype_id,userId) {
    //有项目id
    if(belong_id){
        //项目类型为全部
        if(prototype_id=="all"){
            //监理员选择为全部
            if(userId =="all"){
                return Imageinfo.find({
                    "belongPro":belong_id,
                    //"createtime":{$gt:start_time,$lte:end_time}
                });
            }
            //监理员不为全部，且有监理员id
            else if(userId !="all"&&userId){
                return Imageinfo.find({
                    "byuser":userId,
                    "belongPro":belong_id,
                    //"createtime":{$gt:start_time,$lte:end_time}
                });
            }
        }
        //项目类型不为全部，且有项目类型id
        else if(prototype_id!="all"&&prototype_id){
            //监理员选择为全部
            if(userId =="all"){
                return Imageinfo.find({
                    "belongProType":prototype_id,
                    "belongPro":belong_id,
                    //"createtime":{$gt:start_time,$lte:end_time}
                });
            }
            //监理员不为全部，且有监理员id
            else if(userId != "all"&&userId){
                return Imageinfo.find({
                    "belongProType":prototype_id,
                    "byuser":userId,
                    "belongPro":belong_id,
                    //"createtime":{$gt:start_time,$lte:end_time}
                });
            }
        }
    //无项目id
    }else{
        return Imageinfo.find({_id:0});
    }
});
Meteor.publish('imageinfonums', function(belong_id,vision_id,day_index) {
    if(belong_id){
       if(vision_id == "all"){
        return Imageinfo.find({"belongPro":belong_id});
       }else if(vision_id != "all" && vision_id){
            return Imageinfo.find({"byuser":vision_id,"belongPro":belong_id});
       }else{
            return Imageinfo.find({_id:0});
       }
    }else{
        return Imageinfo.find({_id:0});
    }
});



//照片存储信息
Meteor.publish('imageinfo', function(pro_id,proType_id,point_id,equipment_id,imgClass_id,imgDetail_id,acc) {
    if(pro_id){
        //得到该项目的验收状态
        var proState=Project.find({_id:pro_id}).fetch()[0].state;
        //如果项目是未验收状态，则选择验收状态为全部和验收前都展示该项目所有照片，选择验收后展示为空
        if(proState==1){
            //有项目类型，做筛选
            if(proType_id){
                //选择验收后，则不管前面条件是什么都返回空集合
                if(acc=='after'){
                    console.log('项目还未验收');
                    return Imageinfo.find({_id:0});
                }
                //选择验收为全部或验收前，则对前面条件做判断
                else if(acc=='all' || acc=='before'){
                    //有点位
                    if(point_id){
                        //方向选择了全部,其他都没选择全部
                        if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //方向和照片类型选了全部（那么照片具体信息只能是全部）
                        else if(equipment_id=='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id
                            })
                        }
                        //方向选择了全部，照片类型没有选全部，照片具体信息选了全部
                        else if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id
                            })
                        }



                        //方向和其他都没选择全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //方向没有选择全部，照片类型选择了全部（那么照片具体信息只能是全部
                        if(equipment_id!='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id
                            })
                        }
                        //方向没有选择全部，照片类型没有选择全部，照片具体信息选择了全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id
                            })
                        }

                    }
                    //没有选点位,
                    else{
                        //照片类型和具体信息都没有选全部
                        if(imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //照片类型选了全部（那么照片具体信息只能是全部）
                        else if(imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id
                            })
                        }
                        //照片类型没有选全部，照片具体信息选了全部
                        else if(imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id
                            })
                        }
                    }
                }
            }
            //无项目类型，返回空集合
            else{
                console.log('无proType_id');
                return Imageinfo.find({_id:0})
            }
        }
        //如果项目是已验收状态，则对选择的验收状态分别做判断
        else if(proState==0){
            //得到该项目的验收时间，时间戳
            var proAcctime=Project.find({_id:pro_id}).fetch()[0].accTime;
            //有项目类型，做筛选
            if(proType_id){
                //选择验收为全部，只对前面条件做判断
                if(acc=='all'){
                    //有点位
                    if(point_id){
                        //方向选择了全部,其他都没选择全部
                        if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //方向和照片类型选了全部（那么照片具体信息只能是全部）
                        else if(equipment_id=='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id
                            })
                        }
                        //方向选择了全部，照片类型没有选全部，照片具体信息选了全部
                        else if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id
                            })
                        }



                        //方向和其他都没选择全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //方向没有选择全部，照片类型选择了全部（那么照片具体信息只能是全部）
                        if(equipment_id!='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id
                            })
                        }
                        //方向没有选择全部，照片类型没有选择全部，照片具体信息选择了全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id
                            })
                        }

                    }
                    //没有选点位,
                    else{
                        //照片类型和具体信息都没有选全部
                        if(imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id
                            })
                        }
                        //照片类型选了全部（那么照片具体信息只能是全部）
                        else if(imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id
                            })
                        }
                        //照片类型没有选全部，照片具体信息选了全部
                        else if(imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id
                            })
                        }
                    }
                }
                //选择验收为验收前，增加条件照片的createtime要小于项目验收时间proAcctime
                else if(acc=='before'){
                    //有点位
                    if(point_id){
                        //方向选择了全部,其他都没选择全部
                        if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //方向和照片类型选了全部（那么照片具体信息只能是全部）
                        else if(equipment_id=='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //方向选择了全部，照片类型没有选全部，照片具体信息选了全部
                        else if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }



                        //方向和其他都没选择全部，验收类型选了全部或验收前
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //方向没有选择全部，照片类型选择了全部（那么照片具体信息只能是全部）
                        if(equipment_id!='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //方向没有选择全部，照片类型没有选择全部，照片具体信息选择了全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }

                    }
                    //没有选点位,
                    else{
                        //照片类型和具体信息都没有选全部
                        if(imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //照片类型选了全部（那么照片具体信息只能是全部）
                        else if(imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                        //照片类型没有选全部，照片具体信息选了全部
                        else if(imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$lte:proAcctime}
                            })
                        }
                    }
                }
                //选择验收为验收前，增加条件照片的createtime要大于项目验收时间proAcctime
                else if(acc=='after'){
                    //有点位
                    if(point_id){
                        //方向选择了全部,其他都没选择全部
                        if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //方向和照片类型选了全部（那么照片具体信息只能是全部）
                        else if(equipment_id=='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //方向选择了全部，照片类型没有选全部，照片具体信息选了全部
                        else if(equipment_id=='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }



                        //方向和其他都没选择全部，验收类型选了全部或验收前
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //方向没有选择全部，照片类型选择了全部（那么照片具体信息只能是全部）
                        if(equipment_id!='all' && imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //方向没有选择全部，照片类型没有选择全部，照片具体信息选择了全部
                        if(equipment_id!='all' && imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongPoint':point_id,
                                'belongEquipment':equipment_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }

                    }
                    //没有选点位,
                    else{
                        //照片类型和具体信息都没有选全部
                        if(imgClass_id!='all' && imgDetail_id!='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'belongImgDetail':imgDetail_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //照片类型选了全部（那么照片具体信息只能是全部）
                        else if(imgClass_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                        //照片类型没有选全部，照片具体信息选了全部
                        else if(imgClass_id!='all' && imgDetail_id=='all'){
                            return Imageinfo.find({
                                'belongProType':proType_id,
                                'belongImgClass':imgClass_id,
                                'createtime':{$gt:proAcctime}
                            })
                        }
                    }
                }
            }
            //无项目类型，返回空集合
            else{
                console.log('无proType_id');
                return Imageinfo.find({_id:0})
            }
        }
    }
    //项目的_id为空，返回空集合
    else{
        console.log('无pro_id');
        return Imageinfo.find({_id:0});
    }
});

//消息
Meteor.publish('messageBelongProject', function(projectId,page) {
    if(projectId){
        return Messages.find({'chatId':projectId},{sort:{createAt:-1},skip:0,limit:page*10});
    }else{
        return Messages.find({'_id':0});
    }
});

//消息数量表
Meteor.publish('messageNum', function(userid) {
    if(userid){
        return Messagesnum.find({'userid':userid});
    }else{
        return Messagesnum.find({'_id':0});
    }
});

//备份列表
Meteor.publish('backupList', function(projectId) {
    if(projectId){
        return BackUp.find({'projectId':projectId});
    }else{
        return BackUp.find({'_id':0});
    }
});

//签到
Meteor.publish('registerList', function(userid,typeid) {
    if(userid){
        if(typeid == 'all'){
            return Register.find({
                'userid':userid
            },{sort:{createAt:1}});
        }
        else{
            return Register.find({
                'userid':userid,
                'typeid':typeid
            },{sort:{createAt:1}});
        }
    }else{
        return Register.find({'_id':0});
    }
});