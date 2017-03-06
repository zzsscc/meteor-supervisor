Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var fs = Npm.require('fs');
var resizeImg = Npm.require('resize-img');
Meteor.methods({
    //web端登陆
    'weblogin'(userName,password) {
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
    },

    //web端生成验证码
    'webCode'() {
        var code = "";
        var codeLength = 5;//验证码的长度
        var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');//所有候选组成验证码的字符，当然也可以用中文的

        for (var i = 0; i < codeLength; i++) {
            var charIndex = Math.floor(Math.random() * 36);
            code += selectChar[charIndex];
        }

        return{
            'result':code,
        }
    },


    //用户管理
    //删除在所有项目中都没有用到的业主账号，删除和编辑项目时用，方法类
    'removeUselessYZ' (){
        //将在所有项目中都没有用到的业主账号删除
        var allYZ=Users.find({'type':4}).fetch();
        var allproject=Project.find().fetch();

        var allusedYZ=[];
        for(var i=0;i<allproject.length;i++){
            allusedYZ.push(allproject[i].owner);
        }
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
        //得到去重后的所有正在使用的业主账号_id数组
        var uniqueYZ=allusedYZ.unique_zsc();
        //得到需要删除的用户(没有在任何项目中使用)的_id
        var todeluser=[];
        var iftodel=false;
        for(var i=0;i<allYZ.length;i++){
            iftodel=false;
            for(var j=0;j<uniqueYZ.length;j++){
                if(allYZ[i]._id==uniqueYZ[j]){
                    iftodel=true;
                }
            }
            if(!iftodel){
                todeluser.push(allYZ[i]._id);
            }
        }
        //进行删除
        for(var i=0;i<todeluser.length;i++){
            Users.remove({_id:todeluser[i]});
        }
    },
    //添加用户
    'addUser'(userName,entryDate,job,phone,type) {
        if(userName && entryDate && job && phone && type){
            //判断这个电话在用户表中是否已存在，若存在则提示已存在
            var hadusers=Users.find({}).fetch();
            var ifhad=false;
            for(var i=0;i<hadusers.length;i++){
                if(hadusers[i].phone==phone){
                    ifhad=true;
                }
            }
            if(!ifhad){
                var now=((Date.parse(new Date()))/ 1000).toString();
                //转MD5
                var md5_password=CryptoJS.MD5('8888888').toString();

                switch (type) {
                    case '总监理工程师':
                        type=1;
                        break;
                    case '监理工程师':
                        type=2;
                        break;
                    case '监理员':
                        type=3;
                        break;
                    default: type=3;
                }

                Users.insert({
                    'username':userName,
                    'entrydate':entryDate,
                    'job':job,
                    'phone':phone,
                    'type':type,

                    'proNum':0,
                    'lastupdatatime':now,
                    'lastlogintime':'/',
                    'avatar':'http://jianli.eshudata.com/img/profile_small.png',
                    'state':1,
                    'password':md5_password
                });

                return {
                    'success':true,
                    'result':"",
                    'msg':"添加用户成功"
                };
            }
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"此手机号已存在，添加失败"
                };
            }

        }else{
            return {
                'success':false,
                'result':"",
                'msg':"添加用户失败，信息填写不全"
            };
        }
    },
    //删除用户,oldTitle为4时是在业主管理中调用
    'removeUser'(user_id) {
        if(user_id){

            //删除用户时，原项目中对应的此人员删除
            oldTitle=Users.find({_id:user_id}).fetch()[0].type;
            //if(oldTitle!=type){
                switch (oldTitle) {
                    case 1:
                        var tochangePro=Project.find({'chiefEngineer':user_id}).fetch();
                        var tochangePro_id=[];
                        for(var i=0;i<tochangePro.length;i++){
                            tochangePro_id.push(tochangePro[i]._id);
                        }
                        for(var i=0;i<tochangePro_id.length;i++){
                            Project.update(
                                {_id:tochangePro_id[i]},
                                { $set :
                                {
                                    "chiefEngineer" : null,
                                    "chiefTel" : null
                                }
                                });
                        }
                        break;
                    case 2:
                        var tochangePro=Project.find({'supervisionEngineer':user_id}).fetch();
                        var tochangePro_id=[];
                        for(var i=0;i<tochangePro.length;i++){
                            tochangePro_id.push(tochangePro[i]._id);
                        }
                        for(var i=0;i<tochangePro_id.length;i++){
                            Project.update(
                                {_id:tochangePro_id[i]},
                                { $set :
                                {
                                    "supervisionEngineer" : null,
                                    "supEngTel" : null
                                }
                                });
                        }
                        break;
                    case 3:
                        var tochangeProtype=Projecttype.find({'supervision':{$in:[user_id]}}).fetch();
                        var tochangeProtype_id=[];
                        for(var i=0;i<tochangeProtype.length;i++){
                            tochangeProtype_id.push(tochangeProtype[i]._id);
                        }
                        for(var i=0;i<tochangeProtype_id.length;i++){
                            Projecttype.update(
                                {_id:tochangeProtype_id[i]},
                                { $pull :
                                {
                                    "supervision":user_id
                                }
                                }
                            );
                        }
                        break;
                    //删除业主时，将项目表中owner是这个用户的，和relationOwners中的这个用户删掉
                    case 4:
                        var pros=Project.find().fetch();
                        for(var i=0;i<pros.length;i++){
                            if(pros[i].owner==user_id){
                                Project.update(
                                    {_id:pros[i]._id},
                                    { $set :
                                    {
                                        "owner" : null
                                    }
                                    });
                            }
                        }
                        for(var i=0;i<pros.length;i++){
                            var tftf=false;
                            var relationOwners=pros[i].relationOwners;
                            for(var j=0;j<relationOwners.length;j++){
                                if(relationOwners[j]==user_id){
                                    tftf=true;
                                }
                            }
                            if(tftf){
                                Project.update(
                                    {_id:pros[i]._id},
                                    { $pull :
                                    {
                                        "relationOwners":user_id
                                    }
                                    }
                                );
                            }
                        }
                        break;
                }
            //}

            Users.remove({_id:user_id});
        }else{
            return {
                'msg':"删除用户失败，没有user_id"
            }
        }
    },
    //编辑用户
    'updateUser'(user_id,userName,entryDate,job,phone,type) {
        if(user_id && userName && entryDate && job && phone && type){
            //判断这个电话在用户表中（除了当前编辑的这个人）是否已存在，若存在则提示已存在
            var hadusers=Users.find({_id:{$ne:user_id}}).fetch();
            var ifhad=false;
            for(var i=0;i<hadusers.length;i++){
                if(hadusers[i].phone==phone){
                    ifhad=true;
                }
            }
            if(!ifhad){
                var now=((Date.parse(new Date()))/ 1000).toString();

                switch (type) {
                    case '总监理工程师':
                        type=1;
                        break;
                    case '监理工程师':
                        type=2;
                        break;
                    case '监理员':
                        type=3;
                        break;
                    default: type=3
                }


                //改变职称后，原项目中对应的此人员删除
                oldTitle=Users.find({_id:user_id}).fetch()[0].type;
                if(oldTitle!=type){
                    switch (oldTitle) {
                        case 1:
                            var tochangePro=Project.find({'chiefEngineer':user_id}).fetch();
                            var tochangePro_id=[];
                            for(var i=0;i<tochangePro.length;i++){
                                tochangePro_id.push(tochangePro[i]._id);
                            }
                            for(var i=0;i<tochangePro_id.length;i++){
                                Project.update(
                                    {_id:tochangePro_id[i]},
                                    { $set :
                                    {
                                        "chiefEngineer" : null,
                                        "chiefTel" : null
                                    }
                                    });
                            }
                            break;
                        case 2:
                            var tochangePro=Project.find({'supervisionEngineer':user_id}).fetch();
                            var tochangePro_id=[];
                            for(var i=0;i<tochangePro.length;i++){
                                tochangePro_id.push(tochangePro[i]._id);
                            }
                            for(var i=0;i<tochangePro_id.length;i++){
                                Project.update(
                                    {_id:tochangePro_id[i]},
                                    { $set :
                                    {
                                        "supervisionEngineer" : null,
                                        "supEngTel" : null
                                    }
                                    });
                            }
                            break;
                        case 3:
                            var tochangeProtype=Projecttype.find({'supervision':{$in:[user_id]}}).fetch();
                            var tochangeProtype_id=[];
                            for(var i=0;i<tochangeProtype.length;i++){
                                tochangeProtype_id.push(tochangeProtype[i]._id);
                            }
                            for(var i=0;i<tochangeProtype_id.length;i++){
                                Projecttype.update(
                                    {_id:tochangeProtype_id[i]},
                                    { $pull :
                                    {
                                        "supervision":user_id
                                    }
                                    }
                                );
                            }
                            break;
                    }
                }

                Users.update(
                    {_id:user_id},
                    { $set : {
                        "username" : userName,
                        "entrydate" : entryDate,
                        "job" : job,
                        "phone" : phone,
                        'type':type,

                        'lastupdatatime':now
                    }
                    });

                //更新用户的项目数
                Meteor.call('userProNum');

                return {
                    'success':true,
                    'result':"",
                    'msg':"编辑用户成功"
                };
            }
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"此手机号已存在"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"编辑用户失败，信息填写不全"
            };
        }

    },
    //编辑用户密码
    'updateUserPwd'(user_id,password) {
        if(user_id){
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
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"修改密码失败，没有user_id"
            };
        }

    },
    //用户启停
    'userAble'(user_id,state) {
        var now=((Date.parse(new Date()))/ 1000).toString();
        Users.update(
            {_id:user_id},
            { $set : {
                "state" : state,

                'lastupdatatime':now
            }
            });
    },
    //用户的项目数
    //'userProNum'(user_id){
    //    var usertype=Users.find({_id:user_id}).fetch()[0].type;
    //    var allProject=Project.find().fetch();
    //    var thispro=[];
    //    var _this_id;
    //    if(usertype==1){
    //        //总监理工程师项目
    //        for(var i=0;i<allProject.length;i++){
    //            thispro.push(allProject[i].chiefEngineer);
    //        }
    //    }
    //},
    //用户的项目数
    'userProNum'(){
        var bendiUT=Users.find({"type":{$ne:4}}).fetch();

        var bendiPT=Project.find().fetch();
        for(var i=0;i<bendiUT.length;i++){
            switch (bendiUT[i].type) {
                case 0:
                    //admin的项目
                    var _this_id=bendiUT[i]._id;

                    //更新用户表项目数量字段
                    Users.update(
                        {_id:_this_id},
                        { $set : {
                            "proNum":0
                        }
                        });
                    break;
                case 1:
                    //总监理工程师项目
                    var allZGpro=[];
                    for(var j=0;j<bendiPT.length;j++){
                        if(bendiPT[j].chiefEngineer){
                            allZGpro.push(bendiPT[j].chiefEngineer);
                        }
                    }
                    var _this_id;
                    var ZGcount=0;

                    _this_id=bendiUT[i]._id;

                    for(var j=0;j<allZGpro.length;j++){
                        if(allZGpro[j]==_this_id){
                            ZGcount++;
                        }
                    }
                    //console.log(ZGcount);
                    //更新用户表项目数量字段
                    Users.update(
                        {_id:_this_id},
                        { $set : {
                            "proNum":ZGcount
                        }
                        });
                    break;
                case 2:
                    //监理工程师项目
                    var allJLGpro=[];
                    for(var j=0;j<bendiPT.length;j++){
                        if(bendiPT[j].supervisionEngineer){
                            allJLGpro.push(bendiPT[j].supervisionEngineer);
                        }
                    }
                    var _this_id;
                    var JLGcount=0;

                    _this_id=bendiUT[i]._id;

                    for(var j=0;j<allJLGpro.length;j++){
                        if(allJLGpro[j]==_this_id){
                            JLGcount++;
                        }
                    }
                    //console.log(JLGcount);
                    //更新用户表项目数量字段
                    Users.update(
                        {_id:_this_id},
                        { $set : {
                            "proNum":JLGcount
                        }
                        });
                    break;
                case 3:
                    //监理员的项目
                    var _this_id=bendiUT[i]._id;
                    var bendiTY=Projecttype.find().fetch();
                    var sups;
                    var sups_typeid=[];
                    //得到这个监理员所有的所在项目类型的_id
                    for(var j=0;j<bendiTY.length;j++){
                        sups=bendiTY[j].supervision;
                        for(var k=0;k<sups.length;k++){
                            if(_this_id==sups[k]){
                                sups_typeid.push(bendiTY[j].belongPro);
                            }
                        }
                    }
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
                    //得到去重后的这个用户所在的项目类型的_id
                    var uniqueProid=sups_typeid.unique_zsc();
                    //console.log(uniqueProid.length);
                    //更新用户表项目数量字段
                    Users.update(
                        {_id:_this_id},
                        { $set : {
                            "proNum":uniqueProid.length
                        }
                        });
            }
        }
    },

    //业主管理
    //新增业主
    'addUserOwner'(userName,job,phone) {
        if(userName && phone){
            var now=((Date.parse(new Date()))/ 1000).toString();
            //转MD5
            var md5_password=CryptoJS.MD5('8888888').toString();

            //用户表中已有这个手机号/账号的话就不能添加，并提示错误
            var allUsers=Users.find().fetch();
            var tf=true;
            for(var i=0;i<allUsers.length;i++){
                if(allUsers[i].phone==phone){
                    tf=false;
                }
            }
            //用户表中这个电话不存在，则添加
            if(tf){
                Users.insert({
                    'username':userName,
                    'entrydate':null,
                    'job':job,
                    'phone':phone,
                    'type':4,

                    //'proNum':0,
                    'lastupdatatime':now,
                    'lastlogintime':'/',
                    'avatar':'http://jianli.eshudata.com/img/profile_small.png',
                    'state':1,
                    'password':md5_password
                });

                return {
                    'success':true,
                    'result':"",
                    'msg':"添加用户成功"
                };
            }
            //电话已存在，提示错误
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"此手机号已存在"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"添加用户失败，信息填写不全"
            };
        }
    },
    //编辑业主
    'updateUserOwner'(user_id,userName,job,phone) {
        if(user_id && userName && phone){
            var now=((Date.parse(new Date()))/ 1000).toString();

            //用户表中已有这个手机号/账号的话就不能编辑，并提示错误

            //手机号已存在判断时去掉当前这个业主
            var allUsers=Users.find({_id:{$ne:user_id}}).fetch();
            var tf=true;
            for(var i=0;i<allUsers.length;i++){
                if(allUsers[i].phone==phone){
                    tf=false;
                }
            }
            //用户表中这个电话不存在，则编辑
            if(tf){
                Users.update(
                    {_id:user_id},
                    { $set : {
                        "username" : userName,
                        "job" : job,
                        "phone" : phone,

                        'lastupdatatime':now
                    }
                    });

                return {
                    'success':true,
                    'result':"",
                    'msg':"编辑业主成功"
                };
            }
            //电话已存在，提示错误
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"此手机号已存在"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"编辑业主失败，信息填写不全"
            };
        }
    },
    //项目权限选择
    'changeProRelation'(user_id,pro_id,ifchecked) {
        console.log(user_id);
        console.log(pro_id);
        console.log(ifchecked);
        if(user_id){
            if(ifchecked){
                Project.update(
                    {_id:pro_id},
                    { $addToSet :
                    {
                        "relationOwners":user_id
                    }
                    }
                );
            }else{
                Project.update(
                    {_id:pro_id},
                    { $pull :
                    {
                        "relationOwners":user_id
                    }
                    }
                );
            }
        }else{
            return {
                'msg':"项目权限选择失败，没有user_id"
            }
        }
    },



    //项目管理
    //新增项目
    'addPro'(proName,beginDate,endDate,enger,owner,backup) {
        if(proName && beginDate && endDate && enger &&　backup){
            var now=((Date.parse(new Date()))/ 1000).toString();
            switch (backup) {
                case '请选择':
                    backup=0;
                    break;
                case '每天':
                    backup=1;
                    break;
                case '每三天':
                    backup=2;
                    break;
                case '每周':
                    backup=3;
                    break;
                case '每月':
                    backup=4;
                    break;
                default: backup=4
            }
            //转MD5
            var md5_password=CryptoJS.MD5('8888888').toString();
            //如果填写了业主电话
            if(owner){
                //判断输入的手机号在用户表的非业主数据中是否已经存在，若存在则无法添加
                var hadusers=Users.find({'type':{$in:[0,1,2,3]}}).fetch();
                console.log(hadusers);
                var ifhad=false;
                for(var i=0;i<hadusers.length;i++){
                    if(hadusers[i].phone==owner){
                        ifhad=true;
                    }
                }
                //不存在，可以添加
                if(!ifhad){
                    //如果用户表的业主数据中没有这个业主账号新增这个业主账号,如已经存在则获取旧业主账号的_id
                    var YZusers=Users.find({'type':4}).fetch();
                    var hadYZ=false;
                    var choosedYZ;
                    var choosedYZ_ID;
                    //判断输入的业主账号是否已经存在
                    for(var i=0;i<YZusers.length;i++){
                        if(YZusers[i].phone==owner){
                            hadYZ=true;
                        }
                    }
                    if(hadYZ){
                        //得到已存在的这个业主的_id
                        choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                        choosedYZ_ID=choosedYZ[0]._id;
                    }else{
                        //用户表中插入业主账号
                        Users.insert({
                            'username':'业主账号',
                            'entrydate':null,
                            'job':null,
                            'phone':owner,
                            'type':4,

                            //'proNum':0,
                            'state':1,
                            'password':md5_password,
                            'lastupdatatime':now,
                            'lastlogintime':'/',
                            'avatar':'http://jianli.eshudata.com/img/profile_small.png'
                        });

                        //得到刚才插入的业主账号的_id
                        choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                        choosedYZ_ID=choosedYZ[0]._id;
                    }


                    //如果总监理工程师不是选择请选择
                    if(enger!='请选择'){
                        //得到选择的总监理工程师在用户表中的电话和_id
                        var choosedZG=Users.find({'username':enger,'type':1}).fetch();
                        var choosedZG_ID=choosedZG[0]._id;
                        var chiefTel=choosedZG[0].phone;

                        Project.insert({
                            'proname':proName,
                            'begindate':beginDate,
                            'enddate':endDate,
                            'chiefEngineer':choosedZG_ID,
                            'chiefTel':chiefTel,
                            'owner':choosedYZ_ID,
                            'backup':backup,

                            "state" : 1,
                            "accTime" : null,
                            "supervisionEngineer" : null,
                            "supEngTel" : null,
                            "progress": null,
                            //"supervision" : [],
                            'ownerTel':null,
                            'ownername':null,
                            'owneraddr':null,
                            'proRemark':null,
                            'relationOwners':[],
                            'weekly':0,
                            'monthly':0
                        });
                    }
                    //总监理工程师选择的是请选择
                    else{
                        Project.insert({
                            'proname':proName,
                            'begindate':beginDate,
                            'enddate':endDate,
                            'chiefEngineer':null,
                            'chiefTel':null,
                            'owner':choosedYZ_ID,
                            'backup':backup,

                            "state" : 1,
                            "accTime" : null,
                            "supervisionEngineer" : null,
                            "supEngTel" : null,
                            "progress": null,
                            //"supervision" : [],
                            'ownerTel':null,
                            'ownername':null,
                            'owneraddr':null,
                            'proRemark':null,
                            'relationOwners':[],
                            'weekly':0,
                            'monthly':0
                        });
                    }

                    //更新项目进度
                    var proid=Project.find({'proname':proName,'begindate':beginDate}).fetch()[0]._id;
                    Meteor.call('proProgress',proid);

                    //更新用户的项目数
                    Meteor.call('userProNum');

                    return {
                        'success':true,
                        'result':"",
                        'msg':"新增项目成功"
                    };
                }
                //若输入的手机号在用户表的非业主数据中已经存在，无法添加
                else{
                    return {
                        'success':false,
                        'result':"",
                        'msg':"业主电话已经在用户管理中被添加了，无法重复被添加为业主"
                    };
                }
            }
            //没有填写业主电话
            else{
                //如果总监理工程师不是选择请选择
                if(enger!='请选择'){
                    //得到选择的总监理工程师在用户表中的电话和_id
                    var choosedZG=Users.find({'username':enger,'type':1}).fetch();
                    var choosedZG_ID=choosedZG[0]._id;
                    var chiefTel=choosedZG[0].phone;

                    Project.insert({
                        'proname':proName,
                        'begindate':beginDate,
                        'enddate':endDate,
                        'chiefEngineer':choosedZG_ID,
                        'chiefTel':chiefTel,
                        'owner':null,
                        'backup':backup,

                        "state" : 1,
                        "accTime" : null,
                        "supervisionEngineer" : null,
                        "supEngTel" : null,
                        "progress": null,
                        //"supervision" : [],
                        'ownerTel':null,
                        'ownername':null,
                        'owneraddr':null,
                        'proRemark':null,
                        'relationOwners':[],
                        'weekly':0,
                        'monthly':0
                    });

                    //更新项目进度
                    var proid=Project.find({'proname':proName,'begindate':beginDate}).fetch()[0]._id;
                    Meteor.call('proProgress',proid);

                    //更新用户的项目数
                    Meteor.call('userProNum');

                    return {
                        'success':true,
                        'result':"",
                        'msg':"新增项目成功"
                    };
                }
                //总监理工程师选择的是请选择
                else{
                    Project.insert({
                        'proname':proName,
                        'begindate':beginDate,
                        'enddate':endDate,
                        'chiefEngineer':null,
                        'chiefTel':null,
                        'owner':null,
                        'backup':backup,

                        "state" : 1,
                        "accTime" : null,
                        "supervisionEngineer" : null,
                        "supEngTel" : null,
                        "progress": null,
                        //"supervision" : [],
                        'ownerTel':null,
                        'ownername':null,
                        'owneraddr':null,
                        'proRemark':null,
                        'relationOwners':[],
                        'weekly':0,
                        'monthly':0
                    });

                    //更新项目进度
                    var proid=Project.find({'proname':proName,'begindate':beginDate}).fetch()[0]._id;
                    try{
                        Meteor.call('proProgress',proid);
                    }
                    catch(e) {
                       return {
                           'success':false,
                           'result':"",
                           'msg':"新增项目失败!"
                       };
                    }

                    //更新用户的项目数
                    Meteor.call('userProNum');

                    return {
                        'success':true,
                        'result':"",
                        'msg':"新增项目成功"
                    };
                }
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"新增项目失败，填写信息不全"
            };
        }

    },
    //验收项目，与驾驶舱共用
    'accPro'(pro_id,state) {
            var now=((Date.parse(new Date()))/ 1000).toString();
            if(state==1){
                Project.update(
                    {_id:pro_id},
                    { $set :
                    {   "state" : state,
                        "accTime" : null
                    }
                    });
            }else if(state==0){
                Project.update(
                    {_id:pro_id},
                    { $set :
                    {   "state" : state,
                        "accTime" : now
                    }
                    });
            }
    },
    //删除项目
    'removePro'(pro_id) {
        if(pro_id){
            Project.remove({_id:pro_id});

            //将这个项目的项目类型_id存起来
            var todeltypes=[];
            var protypes=Projecttype.find({'belongPro':pro_id}).fetch();
            for(var i=0;i<protypes.length;i++){
                todeltypes.push(protypes[i]._id);
            }
            //删除和这些项目类型有关的点位信息，方向/设备，照片类型，照片具体信息
            for(var i=0;i<todeltypes.length;i++){
                Meteor.call('removeProType',todeltypes[i]);
            }

            Projecttype.remove({'belongPro':pro_id});

            //删除在所有项目中都没有用到的业主账号
            //Meteor.call('removeUselessYZ');

            //更新用户的项目数
            Meteor.call('userProNum');
        }else{
            return {
                'msg':"删除项目失败，没有pro_id"
            }
        }

    },
    //编辑项目
    'updatePro'(pro_id,proName,beginDate,endDate,enger,owner,backup) {
        if(pro_id){
            var now=((Date.parse(new Date()))/ 1000).toString();
            if(proName && beginDate && endDate && enger && backup){
                //转MD5
                var md5_password=CryptoJS.MD5('8888888').toString();

                switch (backup) {
                    case '请选择':
                        backup=0;
                        break;
                    case '每天':
                        backup=1;
                        break;
                    case '每三天':
                        backup=2;
                        break;
                    case '每周':
                        backup=3;
                        break;
                    case '每月':
                        backup=4;
                        break;
                    default: backup=4
                }

                //如果填了业主账号
                if(owner){
                    //判断输入的手机号在用户表的非业主数据中是否已经存在，若存在则无法添加
                    var hadusers=Users.find({'type':{$in:[0,1,2,3]}}).fetch();
                    console.log(hadusers);
                    var ifhad=false;
                    for(var i=0;i<hadusers.length;i++){
                        if(hadusers[i].phone==owner){
                            ifhad=true;
                        }
                    }
                    //不存在，可以添加
                    if(!ifhad){
                        //如果总监理工程师不是选择请选择
                        if(enger!='请选择'){
                            //把当前业主存起来，后面更新用
                            //var oldowner=Project.find({_id:pro_id}).fetch()[0].owner;

                            //如果用户表中没有这个业主账号新增这个业主账号,如已经存在则获取旧业主账号的_id
                            var YZusers=Users.find({'type':4}).fetch();
                            var hadYZ=false;
                            var choosedYZ;
                            var choosedYZ_ID;


                            //判断输入的业主账号是否已经存在
                            for(var i=0;i<YZusers.length;i++){
                                if(YZusers[i].phone==owner){
                                    hadYZ=true;
                                }
                            }
                            if(hadYZ){
                                //得到已存在的这个业主的_id
                                choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                                choosedYZ_ID=choosedYZ[0]._id;
                            }else{
                                //用户表中插入业主账号
                                Users.insert({
                                    'username':'业主账号',
                                    'entrydate':null,
                                    'job':null,
                                    'phone':owner,
                                    'type':4,

                                    //'proNum':0,
                                    'state':1,
                                    'password':md5_password,
                                    'lastupdatatime':now,
                                    'lastlogintime':'/',
                                    'avatar':'http://jianli.eshudata.com/img/profile_small.png'
                                });

                                //得到刚才插入的业主账号的_id
                                choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                                choosedYZ_ID=choosedYZ[0]._id;
                            }

                            //var user_Id=Users.find({'_id':oldowner}).fetch()[0]._id;
                            ////console.log(user_Id);
                            //
                            //Users.update(
                            //    {_id:user_Id},
                            //    { $set : {
                            //        "phone" : owner
                            //    }
                            //    });
                            // 得到选择的总监理工程师在用户表中的电话和_id
                            var choosedZG=Users.find({'username':enger,'type':1}).fetch();
                            var choosedZG_ID=choosedZG[0]._id;
                            var chiefTel=choosedZG[0].phone;

                            Project.update(
                                {_id:pro_id},
                                { $set : {
                                    "proname" : proName,
                                    "begindate" : beginDate,
                                    'enddate':endDate,
                                    "chiefEngineer" : choosedZG_ID,
                                    'chiefTel':chiefTel,
                                    'owner':choosedYZ_ID,
                                    "backup" : backup
                                }
                                });
                        }
                        //如果总监理工程师选择了请选择
                        else{
                            //把当前业主存起来，后面更新用
                            //var oldowner=Project.find({_id:pro_id}).fetch()[0].owner;

                            //如果用户表中没有这个业主账号新增这个业主账号,如已经存在则获取旧业主账号的_id
                            var YZusers=Users.find({'type':4}).fetch();
                            var hadYZ=false;
                            var choosedYZ;
                            var choosedYZ_ID;


                            //判断输入的业主账号是否已经存在
                            for(var i=0;i<YZusers.length;i++){
                                if(YZusers[i].phone==owner){
                                    hadYZ=true;
                                }
                            }
                            if(hadYZ){
                                //得到已存在的这个业主的_id
                                choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                                choosedYZ_ID=choosedYZ[0]._id;
                            }else{
                                //用户表中插入业主账号
                                Users.insert({
                                    'username':'业主账号',
                                    'entrydate':null,
                                    'job':null,
                                    'phone':owner,
                                    'type':4,

                                    //'proNum':0,
                                    'state':1,
                                    'password':md5_password,
                                    'lastupdatatime':now,
                                    'lastlogintime':'/',
                                    'avatar':'http://jianli.eshudata.com/img/profile_small.png'
                                });

                                //得到刚才插入的业主账号的_id
                                choosedYZ=Users.find({'phone':owner,'type':4}).fetch();
                                choosedYZ_ID=choosedYZ[0]._id;
                            }

                            Project.update(
                                {_id:pro_id},
                                { $set : {
                                    "proname" : proName,
                                    "begindate" : beginDate,
                                    'enddate':endDate,
                                    "chiefEngineer" : null,
                                    'chiefTel':null,
                                    'owner':choosedYZ_ID,
                                    "backup" : backup
                                }
                                });
                        }

                        //更新用户的项目数
                        Meteor.call('userProNum');

                        return {
                            'success':true,
                            'result':"",
                            'msg':"编辑项目成功"
                        };
                    }
                    //此手机号已经被添加为admin、总监理工程师、监理工程师、监理员的一种，不能被添加为业主
                    else{
                        return {
                            'success':false,
                            'result':"",
                            'msg':"业主电话已经在用户管理中被添加了，无法重复被添加为业主"
                        };
                    }
                }
                //如果没填业主账号
                else{
                    //如果总监理工程师不是选择请选择
                    if(enger!='请选择'){
                        // 得到选择的总监理工程师在用户表中的电话和_id
                        var choosedZG=Users.find({'username':enger,'type':1}).fetch();
                        var choosedZG_ID=choosedZG[0]._id;
                        var chiefTel=choosedZG[0].phone;

                        Project.update(
                            {_id:pro_id},
                            { $set : {
                                "proname" : proName,
                                "begindate" : beginDate,
                                'enddate':endDate,
                                "chiefEngineer" : choosedZG_ID,
                                'chiefTel':chiefTel,
                                'owner':null,
                                "backup" : backup
                            }
                            });

                        //更新用户的项目数
                        Meteor.call('userProNum');

                        return {
                            'success':true,
                            'result':"",
                            'msg':"编辑项目成功"
                        };
                    }
                    //如果总监理工程师选择了请选择
                    else{
                        Project.update(
                            {_id:pro_id},
                            { $set : {
                                "proname" : proName,
                                "begindate" : beginDate,
                                'enddate':endDate,
                                "chiefEngineer" : null,
                                'chiefTel':null,
                                'owner':null,
                                "backup" : backup
                            }
                            });

                        //更新用户的项目数
                        Meteor.call('userProNum');

                        return {
                            'success':true,
                            'result':"",
                            'msg':"编辑项目成功"
                        };
                    }
                }
                //删除在所有项目中都没有用到的业主账号
                //Meteor.call('removeUselessYZ');
            }
            //信息不全
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"编辑项目失败，信息没有填写完全"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"无项目_id"
            };
        }

    },
    //新增项目类型
    'addProType'(pro_id,newProType) {
        if(pro_id){
            if(newProType){
                Projecttype.insert({
                    'type':newProType,
                    'belongPro':pro_id,
                    'supervision':[]
                });

                return {
                    'success':true,
                    'result':"",
                    'msg':"新增项目类型成功"
                };
            }else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"请填写项目类型"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"请先选择一个项目"
            };
        }

    },
    //删除项目类型
    'removeProType'(protype_id) {
        if(protype_id){
            Projecttype.remove({_id:protype_id});

            //将这个项目类型所有的点位信息_id保存下来
            var _thatPointinfo=Pointinfo.find({'belongProType':protype_id}).fetch();
            var _thatpoint_id=[];
            for(var i=0;i<_thatPointinfo.length;i++){
                _thatpoint_id.push(_thatPointinfo[i]._id);
            }
            //console.log(_thatpoint_id);
            //将方向/设备表中的belongPoint为上面存的那些_id的方向/设备删除
            for(var i=0;i<_thatpoint_id.length;i++){
                Equipment.remove({'belongPoint':_thatpoint_id[i]});
            }
            //删除上面存的这些点位信息
            Pointinfo.remove({'belongProType':protype_id});



            //将这个项目类型所有的照片类型_id保存下来
            var _thatImageclassify=Imageclassify.find({'belongProType':protype_id}).fetch();
            var _thatImageclassify_id=[];
            for(var i=0;i<_thatImageclassify.length;i++){
                _thatImageclassify_id.push(_thatImageclassify[i]._id);
            }
            //console.log(_thatImageclassify_id);
            //将照片具体信息表中的belongImgClass为上面存的那些_id的具体信息删除
            for(var i=0;i<_thatImageclassify_id.length;i++){
                Imagedetail.remove({'belongImgClass':_thatImageclassify_id[i]});
            }
            //删除上面存的这些照片类型
            Imageclassify.remove({'belongProType':protype_id});


            //更新用户的项目数
            Meteor.call('userProNum');
        }else{
            return {
                'msg':"删除项目类型失败，没有protype_id"
            }
        }

    },
    //保存项目备注
    'updateRemark'(pro_id,ownername,ownerTel,owneraddr,proRemark) {
        var oldowner=Project.find({_id:pro_id}).fetch()[0].owner;
        var user_Id=Users.find({'_id':oldowner}).fetch()[0]._id;

        //Users.update(
        //    {_id:user_Id},
        //    { $set : {
        //        "phone" : ownerTel,
        //    }
        //    });

        if(pro_id){
            Project.update(
                {_id:pro_id},
                { $set : {
                    "ownername" : ownername,
                    "ownerTel" : ownerTel,
                    "owneraddr" : owneraddr,
                    'proRemark':proRemark
                }
                });

            return {
                'success':true,
                'result':"",
                'msg':"保存项目备注成功"
            };
        }else{
            return {
                'success':true,
                'result':"",
                'msg':"保存项目备注失败，没有pro_id"
            };
        }
    },
    //项目进度，与驾驶舱共用，方法类
    'proProgress'(pro_id) {
        if(pro_id){
            console.log('proProgress');
            //得到这个项目所有的项目类型的_id
            var proType=[];
            var types=Projecttype.find({'belongPro':pro_id}).fetch();
            for(var i=0;i<types.length;i++){
                proType.push(types[i]._id);
            }
            //有项目类型
            if(proType.length>0){
                //得到这些项目类型所有的点位的_id
                var proPoint=[];
                var points=Pointinfo.find().fetch();
                for(var i=0;i<points.length;i++){
                    for(var j=0;j<proType.length;j++){
                        if(points[i]['belongProType']==proType[j]){
                            proPoint.push(points[i]._id);
                        }
                    }
                }
                //得到这些点位所有的方向/设备的_id,当某个方向/设备的所需照片数为0时不算在进度范围内
                var proEqm=[];
                var eqms=Equipment.find().fetch();
                for(var i=0;i<eqms.length;i++){
                    if(eqms[i].piccount>0){
                        for(var j=0;j<proPoint.length;j++){
                            if(eqms[i]['belongPoint']==proPoint[j]){
                                proEqm.push(eqms[i]._id);
                            }
                        }
                    }
                }
                //得到每个方向/设备的照片完成比例
                var allBL=0;
                var num;
                var images=Imageinfo.find().fetch();
                for(var i=0;i<proEqm.length;i++) {
                    num = 0;
                    for(var j=0;j<images.length;j++) {
                        if (proEqm[i] == images[j]['belongEquipment']) {
                            num++;
                        }
                    }
                    if(num>=Equipment.find({_id:proEqm[i]}).fetch()[0].piccount){
                        allBL=allBL+1;
                    }else{
                        allBL=allBL+(num/Equipment.find({_id:proEqm[i]}).fetch()[0].piccount);
                    }
                }
                var BL='0%';
                if(proEqm.length != 0)
                {
                    BL=Math.floor(allBL/proEqm.length * 10000)/100+'%';
                }
                //var BL=allBL/proEqm.length;
                //console.log(BL);
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "progress" : BL
                    }
                    });

                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
            //无项目类型
            else if(proType.length==0){
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "progress" : '0%'
                    }
                    });

                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"无项目_id"
            };
        }
    },


    //驾驶舱
    //编辑项目
    'updateProCK'(pro_id,proName,beginDate,endDate,enger,phone,backup) {
        if(pro_id){
            if(proName && beginDate && endDate && enger && backup){
                switch (backup) {
                    case '请选择':
                        backup=0;
                        break;
                    case '每天':
                        backup=1;
                        break;
                    case '每三天':
                        backup=2;
                        break;
                    case '每周':
                        backup=3;
                        break;
                    case '每月':
                        backup=4;
                        break;
                    default: backup=4
                }

                //如果监理工程师不是选择请选择
                if(enger!='请选择'){
                    //得到选择的监理工程师在用户表中的电话和_id
                    var choosedJLG=Users.find({'username':enger,'type':2}).fetch();
                    var choosedJLG_ID=choosedJLG[0]._id;

                    Project.update(
                        {_id:pro_id},
                        { $set : {
                            "proname" : proName,
                            "begindate" : beginDate,
                            'enddate':endDate,
                            "supervisionEngineer" : choosedJLG_ID,
                            "supEngTel" : phone,
                            "backup" : backup
                        }
                        });
                }
                //如果监理工程师选择了请选择
                else{
                    Project.update(
                        {_id:pro_id},
                        { $set : {
                            "proname" : proName,
                            "begindate" : beginDate,
                            'enddate':endDate,
                            "supervisionEngineer" : null,
                            "supEngTel" : null,
                            "backup" : backup
                        }
                        });
                }

                //更新用户的项目数
                Meteor.call('userProNum');

                return {
                    'success':true,
                    'result':"",
                    'msg':"编辑项目成功"
                };
            }
            //信息不全
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"编辑项目失败，信息没有填写完全"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"无项目_id"
            };
        }
    },
    //周报选择
    'changeWeekly'(pro_id,ifchecked) {
        console.log(pro_id);
        console.log(ifchecked);
        if(pro_id){
            if(ifchecked){
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "weekly" : 1
                    }
                    }
                );
            }else{
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "weekly" : 0
                    }
                    }
                );
            }
        }else{
            return {
                'msg':"编辑周报失败，没有user_id"
            }
        }
    },
    //月报选择
    'changeMonthly'(pro_id,ifchecked) {
        console.log(pro_id);
        console.log(ifchecked);
        if(pro_id){
            if(ifchecked){
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "monthly" : 1
                    }
                    }
                );
            }else{
                Project.update(
                    {_id:pro_id},
                    { $set : {
                        "monthly" : 0
                    }
                    }
                );
            }
        }else{
            return {
                'msg':"编辑月报失败，没有user_id"
            }
        }
    },



    //基础设置
    //新增点位
    'addPoint'(proType_id,code,name,latitude,longitude,region,equipment,pointRemark) {
        if(proType_id && code && name && region){

            //只在自己项目中判断code不重复
            _this_pro_id=Projecttype.find({_id:proType_id}).fetch()[0].belongPro;

            _this_type=Projecttype.find({'belongPro':_this_pro_id}).fetch();
            var types=[];
            for(var i=0;i<_this_type.length;i++){
                types.push(_this_type[i]._id);
            }



            //判断code在点位表中是否存在，存在的话就不新增点位，只给这个点位增加方向，不存在就增加点位，并给新点位增加方向
            var ifadd=true;
            var allPoint=Pointinfo.find({'belongProType':{"$in":types}}).fetch();
            for(var i=0;i<allPoint.length;i++){
                if(allPoint[i].code==code){
                    ifadd=false;
                }
            }

            if(ifadd){
                Pointinfo.insert({
                    'code':code,
                    'belongProType':proType_id,
                    'name':name,
                    'latitude':latitude,
                    'longitude':longitude,
                    'region':region,
                    'pointRemark':pointRemark,
                    'nowpicsum':0
                });

                //得到刚才插入的点位信息的_id
                var newAddPoint=Pointinfo.find({'belongProType':proType_id,'name':name,'latitude':latitude,'longitude':longitude,'region':region,'pointRemark':pointRemark}).fetch();
                var newAddPoint_ID=newAddPoint[0]._id;

                if(equipment){
                    for(var i=0;i<equipment.length;i++){
                        Equipment.insert({
                            'belongPoint':newAddPoint_ID,
                            'name':equipment[i].eqm,
                            'piccount':equipment[i].count
                        });
                    }
                }
                //更新点位的照片总数
                Meteor.call('calculationPiccount',newAddPoint_ID);

                //更新项目进度
                var typeid=Pointinfo.find({_id:newAddPoint_ID}).fetch()[0].belongProType;
                var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
                Meteor.call('proProgress',proid);

                return {
                    'success':true,
                    'result':"",
                    'msg':"新增点位成功"
                };

            }else{
                //得到原code点位的_id
                //var oldAddPoint=Pointinfo.find({'code':code}).fetch();
                //var oldAddPoint_ID=oldAddPoint[0]._id;

                return {
                    'success':false,
                    'result':"",
                    'msg':"点位编号已存在"
                };
            }


            //console.log(newAddPoint_ID);
            //
            //var subs=equipment.split("\"");
            //返回的是分隔过后的子数组
            //console.log(subs);
            //var trueEquipment=[];
            //for(var i=0;i<subs.length;i++){
            //    if(subs[i]){
            //        trueEquipment.push(subs[i]);
            //    }
            //}
            //console.log(trueEquipment);
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"新增点位失败"
            };
        }

    },
    //删除点位
    'removePoint'(point_id) {
        if(point_id){
            //更新项目进度
            var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;

            Equipment.remove({'belongPoint':point_id});
            Pointinfo.remove({_id:point_id});
            //删除属于这个点位的照片
            Imageinfo.remove({"belongPoint":point_id});


            //更新项目进度
            var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
            Meteor.call('proProgress',proid);

        }else{
            console.log('删除点位失败，没有point_id');
            return {
                'msg':"删除点位失败，没有point_id"
            }
        }

    },


    //编辑点位
    'editPoint'(point_id,code,name,latitude,longitude,region,pointRemark) {
        if(point_id && code && name && region){

            //只在自己项目中判断code不重复
            _that_type_id=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;

            _this_pro_id=Projecttype.find({_id:_that_type_id}).fetch()[0].belongPro;

            _this_type=Projecttype.find({'belongPro':_this_pro_id}).fetch();
            var types=[];
            for(var i=0;i<_this_type.length;i++){
                types.push(_this_type[i]._id);
            }


            //判断code在点位表中是否存在(非自身),已存在则给出错误提示，不存在则可以修改
            var oldcode=Pointinfo.find({_id:point_id}).fetch()[0].code;
            var ifadd=true;
            var allPoint=Pointinfo.find({
                'code':{$ne:oldcode},
                'belongProType':{"$in":types}
            }).fetch();
            for(var i=0;i<allPoint.length;i++){
                if(allPoint[i].code==code){
                    ifadd=false;
                }
            }

            if(ifadd){
                Pointinfo.update(
                    {_id:point_id},
                    { $set : {
                        'code':code,
                        'name':name,
                        'latitude':latitude,
                        'longitude':longitude,
                        'region':region,
                        'pointRemark':pointRemark
                    }
                    });

                //更新点位的照片总数，其实用不着
                Meteor.call('calculationPiccount',point_id);

                return {
                    'success':true,
                    'result':"",
                    'msg':"编辑点位成功"
                };
            }else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"点位编号已存在"
                };
            }


        }else{
            return {
                'success':false,
                'result':"",
                'msg':"编辑点位失败，信息不全"
            };
        }

    },


    //修改点位备注,与图片总览共用
    'editBz'(point_id,pointRemark) {
        if(point_id){
            Pointinfo.update(
                {_id:point_id},
                { $set : {
                    'pointRemark':pointRemark
                }
                });
        }else{
            return {
                'msg':"修改点位备注失败，没有point_id"
            }
        }

    },


    //添加照片分类
    'addImgClass'(proType_id,newImgClass) {
        if(proType_id){
            if(newImgClass){
                Imageclassify.insert({
                    'belongProType':proType_id,
                    'name':newImgClass
                });

                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };

            }else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"请填写照片分类"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"无proType_id"
            };
        }
    },
    //编辑照片分类
    'editImgClass'(imgClass_id,imgClass) {
        if(imgClass_id){
            if(imgClass){
                Imageclassify.update(
                    {_id:imgClass_id},
                    { $set : {
                        'name':imgClass
                    }
                    });
                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"imgClass是空的"
                };
            }
            //Imagedetail.remove({_id:imgDetail_id});
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"编辑照片分类失败，没有imgClass_id"
            }
        }
    },
    //删除照片分类
    'removeImgClass'(imgClass_id) {
        if(imgClass_id){
            Imageclassify.remove({_id:imgClass_id});

            Imagedetail.remove({'belongImgClass':imgClass_id});
        }else{
            return {
                'msg':"删除照片分类失败，没有imgClass_id"
            }
        }
    },


    //添加照片具体信息
    'addImgDetail'(imgClass_id,newImgDetail) {
        if(imgClass_id){
            if(newImgDetail){
                Imagedetail.insert({
                    'belongImgClass':imgClass_id,
                    'name':newImgDetail
                });
                return {
                    'success':true,
                    'result':"",
                    'msg':"添加照片具体信息成功"
                };
            }else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"请输入具体信息内容"
                };
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"添加照片具体信息失败，请先选择一个照片分类"
            };
        }

    },
    //编辑照片具体信息
    'editImgDetail'(imgDetail_id,imgDetail) {
        if(imgDetail_id){
            if(imgDetail){
                Imagedetail.update(
                    {_id:imgDetail_id},
                    { $set : {
                        'name':imgDetail
                    }
                    });
                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
            else{
                return {
                    'success':false,
                    'result':"",
                    'msg':"imgDetail是空的"
                };
            }
            //Imagedetail.remove({_id:imgDetail_id});
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"编辑照片具体信息失败，没有imgDetail_id"
            }
        }
    },
    //删除照片具体信息
    'removeImgDetail'(imgDetail_id) {
        if(imgDetail_id){
            Imagedetail.remove({_id:imgDetail_id});
        }else{
            return {
                'msg':"删除照片具体信息失败，没有imgDetail_id"
            }
        }
    },


    //监理员选择
    'changeJLY'(proType_id,checkedData) {
        console.log(proType_id);
        console.log(checkedData);
        if(proType_id){
            if(checkedData.jly_checked){
                Projecttype.update(
                    {_id:proType_id},
                    { $addToSet :
                    {
                        "supervision":checkedData.jly_id
                    }
                    }
                );
            }else{
                Projecttype.update(
                    {_id:proType_id},
                    { $pull :
                    {
                        "supervision":checkedData.jly_id
                    }
                    }
                );
            }

            //更新用户的项目数
            Meteor.call('userProNum');
        }else{
            return {
                'msg':"监理员选择失败，没有proType_id"
            }
        }


        //Projecttype.update(
        //    {_id:pro_id},
        //    { $addToSet :
        //    {
        //        "supervision":{'$each':[1,5]}
        //    }
        //    }
        //);
        //Projecttype.update(
        //    {_id:pro_id},
        //    { $pull :
        //    {
        //        "supervision":1,
        //    }
        //    }
        //);
    },

    //删除方向/设备
    'removeEquipment'(equipment_id) {
        if(equipment_id){
            var point_id=Equipment.find({_id:equipment_id}).fetch()[0].belongPoint;

            Equipment.remove({_id:equipment_id});

            //将这个方向/设备上的照片记录的belongEquipment更新为null
            //Imageinfo.remove({"belongEquipment":equipment_id});
            //Imageinfo.update(
            //    {"belongEquipment":equipment_id},
            //    { $set : {
            //        'belongEquipment':null
            //    }
            //    }
            //);

            //更新点位的照片总数
            Meteor.call('calculationPiccount',point_id);

            //更新项目进度
            var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;
            var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
            Meteor.call('proProgress',proid);
        }else{
            console.log("删除方向/设备失败，没有equipment_id");
            return {
                'msg':"删除方向/设备失败，没有equipment_id"
            }
        }
    },
    //计算一个点位的照片数
    //'calculationPiccount'(point_id) {
    //    if(point_id){
    //        var eqms=Equipment.find({'belongPoint':point_id}).fetch();
    //        if(eqms){
    //            var count=0;
    //            for(var i=0;i<eqms.length;i++){
    //                count+=eqms[i].piccount;
    //            }
    //
    //            return {
    //                'success':true,
    //                'result':count,
    //                'msg':""
    //            };
    //        }else{
    //            return {
    //                'success':true,
    //                'result':0,
    //                'msg':""
    //            };
    //        }
    //
    //    }
    //},
    //更新点位的照片总数,方法类
    'calculationPiccount'(point_id) {
        if(point_id){

            var count;
            var eqms=Equipment.find({'belongPoint':point_id}).fetch();
            if(eqms){
                count=0;
                for(var i=0;i<eqms.length;i++){
                    count+=eqms[i].piccount;
                }
            }else{
                count=0;
            }

            Pointinfo.update(
                {_id:point_id},
                { $set : {
                    'picsum':count
                }
                });
        }
        //不传参数，更新所有点位的需要的照片总数
        else{
            var points_id=[];
            var points=Pointinfo.find().fetch();
            for(var i=0;i<points.length;i++){
                points_id.push(points[i]._id)
            }

            var num;
            var equipments=Equipment.find().fetch();
            for(var i=0;i<points_id.length;i++){
                num=0;
                for(var j=0;j<equipments.length;j++){
                    if(equipments[j].belongPoint==points_id[i]){
                        num+=equipments[j].piccount;
                    }
                }
                Pointinfo.update(
                    {_id:points_id[i]},
                    { $set : {
                        'picsum':num
                    }
                    });
            }
        }
    },
    //更新点位已拍的照片数，方法类
    'pointNowPicSum'() {
        var points=Pointinfo.find().fetch();
        var images=Imageinfo.find().fetch();
        var count;
        for(var i=0;i<points.length;i++){
            count=0;
            for(var j=0;j<images.length;j++){
                if(images[j].belongPoint==points[i]._id){
                    count++;
                }
                Pointinfo.update(
                    {_id:points[i]._id},
                    { $set : {
                        'nowpicsum':count
                    }
                    });
            }
        }
    },
    //修改方向的照片数
    'editPicCount'(equipment_id,newcount) {
        if(equipment_id){
            if(newcount){
                Equipment.update(
                    {_id:equipment_id},
                    { $set : {
                        'piccount':newcount
                    }
                    });

                //更新点位的照片总数
                var point_id=Equipment.find({_id:equipment_id}).fetch()[0].belongPoint;
                Meteor.call('calculationPiccount',point_id);

                //更新项目进度
                var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;
                var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
                Meteor.call('proProgress',proid);
            }else{
                Equipment.update(
                    {_id:equipment_id},
                    { $set : {
                        'piccount':0
                    }
                    });

                //更新点位的照片总数
                var point_id=Equipment.find({_id:equipment_id}).fetch()[0].belongPoint;
                Meteor.call('calculationPiccount',point_id);

                //更新项目进度
                var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;
                var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
                Meteor.call('proProgress',proid);
            }
        }else{
            console.log("修改照片数量失败，没有equipment_id");
            return {
                'msg':"修改照片数量失败，没有equipment_id"
            }
        }

    },
    //新增方向/设备
    'addEquipment'(point_id,neweqm,newcount) {
        if(point_id && neweqm){
            if(newcount){
                Equipment.insert({
                    'belongPoint':point_id,
                    'name':neweqm,
                    'piccount':newcount
                });
                //更新点位的照片总数
                Meteor.call('calculationPiccount',point_id);

                //更新项目进度
                var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;
                var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
                Meteor.call('proProgress',proid);
            }else{
                Equipment.insert({
                    'belongPoint':point_id,
                    'name':neweqm,
                    'piccount':10
                });
                //更新点位的照片总数
                Meteor.call('calculationPiccount',point_id);

                //更新项目进度
                var typeid=Pointinfo.find({_id:point_id}).fetch()[0].belongProType;
                var proid=Projecttype.find({_id:typeid}).fetch()[0].belongPro;
                Meteor.call('proProgress',proid);
            }
        }else{
            return {
                'msg':"新增方向/设备失败，信息不全"
            }
        }
    },





    //照片上传
    'imageUpload'(imgdata,pro_id,proType_id,point_id,equipment_id,imgClass_id,imgDetail_id,imgRemark,byuser_id) {
        if(imgdata && pro_id && proType_id && point_id && equipment_id && imgClass_id && imgDetail_id && imgRemark && byuser_id){
            var now=((Date.parse(new Date()))/ 1000).toString();
            Imageinfo.insert({
                'createtime':now,
                'belongPro':pro_id,
                'belongProType':proType_id,
                'belongPoint':point_id,
                'belongEquipment':equipment_id,
                'belongImgClass':imgClass_id,
                'belongImgDetail':imgDetail_id,
                'byuser':byuser_id,
                'imgRemark':imgRemark,
                'base64':imgdata
            });
        }else{
            console.log('照片上传失败，信息不全');
            return {
                'msg':"照片上传失败，信息不全"
            }
        }
    },

    //删除照片
    'removeImage'(image_id) {
        if(image_id){
            //更新项目进度
            var proid=Imageinfo.find({_id:image_id}).fetch()[0].belongPro;

            Imageinfo.remove({_id:image_id});

            //更新项目进度
            Meteor.call('proProgress',proid);

            //更新点位上现有的照片数
            Meteor.call('pointNowPicSum');
        }else{
            return {
                'msg':"删除照片失败，没有image_id"
            }
        }
    },

    //个人设置
    'selfSet'(user_id,phone,oldpassword,newpassword) {
        if(user_id){
            var now=((Date.parse(new Date()))/ 1000).toString();
            if(phone && newpassword){
                //判断这个电话在用户表中（除了当前登陆的这个人）是否已存在，若存在则提示已存在
                var hadusers=Users.find({_id:{$ne:user_id}}).fetch();
                var ifhad=false;
                for(var i=0;i<hadusers.length;i++){
                    if(hadusers[i].phone==phone){
                        ifhad=true;
                    }
                }
                if(!ifhad){
                    //数据库中的密码
                    passwordinbase=Users.find({_id:user_id}).fetch()[0].password;
                    //密码对
                    if(CryptoJS.MD5(oldpassword).toString()==passwordinbase){
                        //转MD5
                        var md5_password=CryptoJS.MD5(newpassword).toString();
                        Users.update(
                            {_id:user_id},
                            { $set : {
                                "phone":phone,
                                "password" : md5_password,

                                'lastupdatatime':now
                            }
                            });

                        //如果是总监理工程师或监理工程师，修改项目中该用户的电话
                        oldTitle=Users.find({_id:user_id}).fetch()[0].type;
                        switch (oldTitle) {
                            case 1:
                                var tochangePro=Project.find({'chiefEngineer':user_id}).fetch();
                                var tochangePro_id=[];
                                for(var i=0;i<tochangePro.length;i++){
                                    tochangePro_id.push(tochangePro[i]._id);
                                }
                                for(var i=0;i<tochangePro_id.length;i++){
                                    Project.update(
                                        {_id:tochangePro_id[i]},
                                        { $set :
                                        {
                                            "chiefTel" : phone
                                        }
                                        });
                                }
                                break;
                            case 2:
                                var tochangePro=Project.find({'supervisionEngineer':user_id}).fetch();
                                var tochangePro_id=[];
                                for(var i=0;i<tochangePro.length;i++){
                                    tochangePro_id.push(tochangePro[i]._id);
                                }
                                for(var i=0;i<tochangePro_id.length;i++){
                                    Project.update(
                                        {_id:tochangePro_id[i]},
                                        { $set :
                                        {
                                            "supEngTel" : phone
                                        }
                                        });
                                }
                                break;
                        }
                        return {
                            'success':true,
                            'result':"",
                            'msg':"电话和密码修改成功"
                        };
                    }
                    //密码不对
                    else{
                        return {
                            'success':false,
                            'result':"",
                            'msg':"原密码错误"
                        };
                    }
                }
                //电话已存在，不能修改
                else{
                    return {
                        'success':false,
                        'result':"",
                        'msg':"此手机号已存在"
                    };
                }
            }
            else if(phone && !newpassword){
                //判断这个电话在用户表中（除了当前登陆的这个人）是否已存在，若存在则提示已存在
                var hadusers=Users.find({_id:{$ne:user_id}}).fetch();
                var ifhad=false;
                for(var i=0;i<hadusers.length;i++){
                    if(hadusers[i].phone==phone){
                        ifhad=true;
                    }
                }
                if(!ifhad){
                    Users.update(
                        {_id:user_id},
                        { $set : {
                            "phone":phone,

                            'lastupdatatime':now
                        }
                        });


                    //如果是总监理工程师或监理工程师，修改项目中该用户的电话
                    oldTitle=Users.find({_id:user_id}).fetch()[0].type;
                    switch (oldTitle) {
                        case 1:
                            var tochangePro=Project.find({'chiefEngineer':user_id}).fetch();
                            var tochangePro_id=[];
                            for(var i=0;i<tochangePro.length;i++){
                                tochangePro_id.push(tochangePro[i]._id);
                            }
                            for(var i=0;i<tochangePro_id.length;i++){
                                Project.update(
                                    {_id:tochangePro_id[i]},
                                    { $set :
                                    {
                                        "chiefTel" : phone
                                    }
                                    });
                            }
                            break;
                        case 2:
                            var tochangePro=Project.find({'supervisionEngineer':user_id}).fetch();
                            var tochangePro_id=[];
                            for(var i=0;i<tochangePro.length;i++){
                                tochangePro_id.push(tochangePro[i]._id);
                            }
                            for(var i=0;i<tochangePro_id.length;i++){
                                Project.update(
                                    {_id:tochangePro_id[i]},
                                    { $set :
                                    {
                                        "supEngTel" : phone
                                    }
                                    });
                            }
                            break;
                    }
                    return {
                        'success':true,
                        'result':"",
                        'msg':"电话修改成功"
                    };
                }
                //电话已存在，不能修改
                else{
                    return {
                        'success':false,
                        'result':"",
                        'msg':"此手机号已存在"
                    };
                }
            }
        }else{
            return {
                'success':false,
                'result':"",
                'msg':"无用户id"
            };
        }
    },




    //个人头像上传
    'uploadHeadPic'(imgdata,user_id) {
        if(imgdata && user_id){
            var message = "";
            var dataBuffer = new Buffer(imgdata, 'base64');
            var fileUploadPath="/mnt/jianli/upload/";//发布或测试时改称本机路径
            var fileName = new Date().getTime()+'.png';
            var host = "http://jianli.eshudata.com/upload/";//发布和测试时，改称本机地址和端口

            fs.writeFile(fileUploadPath+fileName, dataBuffer, function(err) {
                if(err){
                    console.log(err);
                }else{
                    console.log("保存成功！");
                    message = "保存成功！";
                    resizeImg(fs.readFileSync(fileUploadPath+fileName), {width: 96, height: 96});
                }
            });
            var imageUrl = host+fileName;

            var now=((Date.parse(new Date()))/ 1000).toString();
            Users.update(
                {_id:user_id},
                { $set : {
                    "avatar":imageUrl,

                    'lastupdatatime':now
                }
                });
            return {
                'success':true,
                'result':"",
                'msg':""
            };


            //return {
            //    'success':true,
            //    'msg':message,
            //    'result':imageUrl
            //}
        }else{
            console.log('照片上传失败，信息不全');
            return {
                'success':false,
                'msg':"照片上传失败，信息不全"
            }
        }
        //Meteor.call('uploadImage',imgdata,function(error,res){
        //    if(typeof error != 'undefined'){
        //        return {
        //            'success':false,
        //            'result':"",
        //            'msg':error
        //        };
        //    }else{
        //        if(res['success']==true){
        //            var now=((Date.parse(new Date()))/ 1000).toString();
        //            Users.update(
        //                {_id:user_id},
        //                { $set : {
        //                    "avatar":res['result'],
        //
        //                    'lastupdatatime':now
        //                }
        //                });
        //            return {
        //                'success':true,
        //                'result':"",
        //                'msg':""
        //            };
        //        }
        //        else{
        //            return {
        //                'success':false,
        //                'result':"",
        //                'msg':""
        //            };
        //        }
        //    }
        //
        //})
    },

    //监理证书上传
    'uploadCertificate'(imgdata,user_id) {
        Meteor.call('uploadImage',imgdata,function(error,res){
            if(typeof error != 'undefined'){
                console.log(error);
            }else{
                if(res['success']==true){
                    var now=((Date.parse(new Date()))/ 1000).toString();
                    Users.update(
                        {_id:user_id},
                        { $set : {
                            "certificate":res['result'],

                            'lastupdatatime':now
                        }
                        });
                }
            }

        })
    },

    //更新消息各个人的是否读过状态
    'updateMessageState'(chatId,thisUser_id) {
        var mes=Messages.find().fetch();
        var this_mes_id=[];
        for(var i=0;i<mes.length;i++){
            if(mes[i].chatId==chatId){
                this_mes_id.push(mes[i]._id);
            }
        }
        for(var i=0;i<this_mes_id.length;i++){
            Messages.update(
                {'_id':this_mes_id[i]},
                { $pull :
                {
                    "stateToPerson":thisUser_id
                }
                });
        }
    },
    //将某个用户的未读消息数量清零
    'updateMessageNum'(user_id) {
        if(user_id){
            var thisMessagesnum=Messagesnum.find({'userid':user_id}).fetch();
            if(thisMessagesnum.length>0){
                thisMessagesnumid=thisMessagesnum[0]._id;

                Messagesnum.update(
                    {_id:thisMessagesnumid},
                    { $set : {
                        'num':0
                    }
                    });
                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"无user_id"
            };
        }
    },
    //返回一个项目的消息总数
    'getMessageTotleBelongPro'(pro_id) {
        if(pro_id){
            messages=Messages.find({'chatId':pro_id}).fetch();

            return {
                'success':true,
                'result':messages.length,
                'msg':""
            };
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"无pro_id"
            };
        }
    },


    ////监理概况的图表数据
    'jianliData'(pro_id) {
        if(pro_id){
            //得到这个项目所有的项目类型的_id
            var proType=[];
            var types=Projecttype.find({'belongPro':pro_id}).fetch();
            for(var i=0;i<types.length;i++){
                proType.push(types[i]._id);
            }
            //有项目类型
            if(proType.length>0){
                //往要返回出去的数组里插入所有的项目类型
                var jianlidata=[];
                for(var i=0;i<types.length;i++){
                    jianlidata.push({
                        'typename':types[i].type
                    });
                }
                console.log(jianlidata);
                //得到这些项目类型所有的点位的_id
                var proPoint=[];
                var points=Pointinfo.find().fetch();
                for(var i=0;i<points.length;i++){
                    for(var j=0;j<proType.length;j++){
                        if(points[i]['belongProType']==proType[j]){
                            proPoint.push(points[i]._id);
                        }
                    }
                }
                //得到这些点位所有的方向/设备的_id,当某个方向/设备的所需照片数为0时不算在进度范围内
                //var proEqm=[];
                //var eqms=Equipment.find().fetch();
                //for(var i=0;i<eqms.length;i++){
                //    if(eqms[i].piccount>0){
                //        for(var j=0;j<proPoint.length;j++){
                //            if(eqms[i]['belongPoint']==proPoint[j]){
                //                proEqm.push(eqms[i]._id);
                //            }
                //        }
                //    }
                //}
                //计算这些项目类型所需的照片总数，和已有的照片数
                var images=Imageinfo.find().fetch();
                var eqms=Equipment.find().fetch();
                var num;
                for(var i=0;i<proType.length;i++){
                    //所需照片总数
                    var typepicsum=0;
                    //现有照片数
                    var typepicnow=0;
                    for(var j=0;j<points.length;j++){
                        if(points[j]['belongProType']==proType[i]){
                            //计算这个项目类型所需的照片总数
                            typepicsum+=points[j].picsum;
                            //得到这个项目类型已有的照片数，去掉溢出
                            for(var m=0;m<eqms.length;m++){
                                if(eqms[m].piccount>0 && eqms[m].piccount){
                                    if(eqms[m]['belongPoint']==points[j]._id){
                                        num = 0;
                                        for(var k=0;k<images.length;k++) {
                                            if (eqms[m]._id == images[k]['belongEquipment']) {
                                                num++;
                                            }
                                        }
                                        if(num>=eqms[m].piccount){
                                            num=eqms[m].piccount;
                                        }
                                        typepicnow+=num;
                                    }
                                }
                            }
                            //for(var m=0;m<proEqm.length;m++) {
                            //    num = 0;
                            //    for(var n=0;n<images.length;n++) {
                            //        if (proEqm[m] == images[n]['belongEquipment']) {
                            //            num++;
                            //        }
                            //    }
                            //    if(num>=Equipment.find({_id:proEqm[m]}).fetch()[0].piccount){
                            //        num=Equipment.find({_id:proEqm[m]}).fetch()[0].piccount;
                            //    }
                            //    typepicnow+=num;
                            //}
                        }
                    }
                    //往要返回出去的数组里插入所有的项目类型所需的照片数，和已有的照片
                    jianlidata[i].picsum=typepicsum;
                    jianlidata[i].picnow=typepicnow;
                }
                console.log(jianlidata);
                //得到这些点位所有的方向/设备的_id,当某个方向/设备的所需照片数为0时不算在进度范围内
                //var proEqm=[];
                //var eqms=Equipment.find().fetch();
                //for(var i=0;i<eqms.length;i++){
                //    if(eqms[i].piccount>0){
                //        for(var j=0;j<proPoint.length;j++){
                //            if(eqms[i]['belongPoint']==proPoint[j]){
                //                proEqm.push(eqms[i]._id);
                //            }
                //        }
                //    }
                //}
                ////得到每个方向/设备的照片完成比例
                //var num;
                //var images=Imageinfo.find().fetch();
                //for(var i=0;i<proEqm.length;i++) {
                //    num = 0;
                //    for(var j=0;j<images.length;j++) {
                //        if (proEqm[i] == images[j]['belongEquipment']) {
                //            num++;
                //        }
                //    }
                //    if(num>=Equipment.find({_id:proEqm[i]}).fetch()[0].piccount){
                //        num=Equipment.find({_id:proEqm[i]}).fetch()[0].piccount;
                //    }
                //}
                return {
                    'success':true,
                    'result':jianlidata,
                    'msg':""
                };
            }
            //无项目类型
            else if(proType.length==0){
                return {
                    'success':true,
                    'result':"",
                    'msg':""
                };
            }
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"无pro_id"
            };
        }
    },


    //APP端点位（任务）的城区
    'appRegion'(types) {
        if(types){
            var pionts=Pointinfo.find({'belongProType':{$in:types}}).fetch();
            var thatRegions=[];
            for(var i=0;i<pionts.length;i++){
                thatRegions.push(pionts[i].region);
            }
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
            //得到去重后的城区
            var unthatRegions=thatRegions.unique_zsc();

            return {
                'success':true,
                'result':unthatRegions,
                'msg':""
            };
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"无types"
            };
        }
    },

    //APP端点位（任务）
    'appPoint'(types,regions,page,search) {
        if(types && regions && page){
            console.log('。。。');
            var pionts;
            //没有搜索内容
            if(!search){
                console.log('无搜索内容');
                try {
                    pionts=Pointinfo.find({
                        'belongProType':{$in:types},
                        'region':{$in:regions}
                    },{skip:(page-1)*10,limit:10}).fetch();
                }
                catch (e){
                    console.log(e);
                }
                console.log('find完');
                console.log(pionts);

                return {
                    'success':true,
                    'result':pionts,
                    'msg':""
                };
            }
            //有搜索内容
            else{
                console.log('有搜索内容');
                try {
                    pionts=Pointinfo.find({
                        'belongProType':{$in:types},
                        'region':{$in:regions},
                        'name': {$regex: search, $options:'i'}
                    },{skip:(page-1)*10,limit:10}).fetch();
                }
                catch (e){
                    console.log(e);
                }
                console.log('find完');
                console.log(pionts);

                return {
                    'success':true,
                    'result':pionts,
                    'msg':""
                };
            }
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"条件不全"
            };
        }
    },


    //签到
    'register'(user_id,userName,lng,lat,pointName,pointCode,type_id,typeName,distance) {
        if(user_id && userName && lng && lat && pointName){
            var now=((Date.parse(new Date()))/ 1000).toString();
            if(type_id && typeName && distance){
                Register.insert({
                    'userid':user_id,
                    'userName':userName,
                    'lng':lng,
                    'lat':lat,
                    'pointName':pointName,
                    'pointCode':pointCode,
                    'typeid':type_id,
                    'typeName':typeName,
                    'distance':distance,
                    'createAt':now
                });
                return {
                    'success':true,
                    'result':"",
                    'msg':"签到成功"
                };
            }
            else{
                Register.insert({
                    'userid':user_id,
                    'userName':userName,
                    'lng':lng,
                    'lat':lat,
                    'pointName':pointName,
                    'pointCode':pointCode,
                    'createAt':now
                });
                return {
                    'success':true,
                    'result':"",
                    'msg':"签到成功"
                };
            }
        }
        else{
            return {
                'success':false,
                'result':"",
                'msg':"签到失败"
            };
        }
    },



});