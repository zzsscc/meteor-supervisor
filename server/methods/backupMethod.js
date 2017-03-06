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
var jsonfile = require('jsonfile')

Meteor.methods({
    'backup'(projectId){
        console.log('backup');
        var localPath = '/mnt/jianli/dump/';
        //STEP 1:查询项目信息
        var projectInfo = Project.findOne({'_id':projectId});
        if(projectInfo == undefined || projectInfo == null)
        {
            //项目不存在，无需生成
            console.log("backup finish:项目不存在");
            return{
                'success':false,
                'msg':'项目不存在',
                'result':''
            };
        }
        var path = localPath+projectId+"/";
        if(!fs.existsSync(path))
        {
            fs.mkdirSync(path);
        }
        //STEP 2:save project base infomation
        var date = new Date();
        var backupTime = date.Format('yyyy-MM-dd')
        path = localPath+projectId+"/"+backupTime+"/";
        if(!fs.existsSync(path))
        {
            fs.mkdirSync(path);
        }
        jsonfile.writeFileSync(path+'projectInfo.json',projectInfo);

        //STEP 3:save project types
        var projectType = Projecttype.find({'belongPro':projectId}).fetch();
        jsonfile.writeFileSync(path+'projectType.json',projectType);

        //STEP 4:save point infomation
        var belongProType = [];
        for(var i = 0;i<projectType.length;i++)
        {
            belongProType.push(projectType[i]._id);
        }
        //save image classify
        var imageClassifyList = Imageclassify.find({'belongProType':{$in:belongProType}}).fetch();
        jsonfile.writeFileSync(path+'imageClassify.json',imageClassifyList);
        //save point info
        var pointList = Pointinfo.find({'belongProType':{$in:belongProType}}).fetch();
        jsonfile.writeFileSync(path+'points.json',pointList);

        var belongPoint = [];
        var belongImgClass = [];
        for(var j = 0; j < pointList.length; j++)
        {
            belongPoint.push(pointList[j]._id);
        }
        for(var m = 0; m < imageClassifyList.length; m++)
        {
            belongImgClass.push(imageClassifyList[m]._id);
        }
        //save image detail
        var imageDetailList = Imagedetail.find({'belongImgClass':{$in:belongImgClass}}).fetch();        
        jsonfile.writeFileSync(path+'imageDetail.json',imageDetailList);
        //save equipment
        var equipmentList = Equipment.find({'belongPoint':{$in:belongPoint}}).fetch();
        jsonfile.writeFileSync(path+'equipment.json',equipmentList);
        //save upload image info
        var imageInfoList = Imageinfo.find({'belongPro':projectId}).fetch();
        jsonfile.writeFileSync(path+'imageInfo.json',imageInfoList);
        //save message
        var messageList = Messages.find({'chatId':projectId}).fetch();
        jsonfile.writeFileSync(path+'message.json',messageList);

        //insert backup record
        BackUp.insert({
            'projectId':projectId,
            'createTime':backupTime,
            'remark':''
        });


        return {
            'success':true,
            'msg':'成功',
            'result':'备份完成'
        }
    },
    'restore'(backupId)
    {
        var localPath = '/mnt/jianli/dump/';
        //STEP 1:查询项目信息
        var backupInfo = BackUp.findOne({'_id':backupId});
        if(backupInfo == undefined || backupInfo == null)
        {
            //项目不存在，无需生成
            console.log("backup finish:备份不存在");
            return{
                'success':false,
                'msg':'备份不存在',
                'result':''
            };
        }
        var path = localPath+backupInfo.projectId+"/"+backupInfo.createTime+"/";
        var fileList = ['projectInfo.json','projectType.json','imageClassify.json','points.json','imageDetail.json','equipment.json','imageInfo.json','message.json'];
        //restore project infomation
        var projectInfo = jsonfile.readFileSync(path+'projectInfo.json');
        var projectTypeList = jsonfile.readFileSync(path+'projectType.json');
        var imageClassifyList = jsonfile.readFileSync(path+'imageClassify.json');
        var pointList = jsonfile.readFileSync(path+'points.json');
        var imageDetailList = jsonfile.readFileSync(path+'imageDetail.json');
        var equipmentList = jsonfile.readFileSync(path+'equipment.json');
        var imageInfoList = jsonfile.readFileSync(path+'imageInfo.json');
        var messageList = jsonfile.readFileSync(path+'message.json');
        Project.update(
            {_id:projectInfo._id},
            {
                $set :projectInfo
            }
        );
        //Project Type
        console.log("projectTypeList:"+projectTypeList);
        var inIdsList= [];
        for(var i = 0;i<projectTypeList.length;i++)
        {
            inIdsList.push(projectTypeList[i]._id);
            var temp = Projecttype.findOne({'_id':projectTypeList[i]._id});
            if(temp)
            {
                Projecttype.update({
                    _id:projectTypeList[i]._id
                },
                {
                    $set:projectTypeList[i]
                });
            }
            else
            {
                var insertResult = Projecttype.insert(
                    projectTypeList[i]
                );
                console.log("insertResult:"+insertResult);
            }
        }
        //remove not in ids records
        Projecttype.remove(
            {'belongPro':backupInfo.projectId,'_id':{$nin:inIdsList}}
        );
        var count = Projecttype.find({}).count();
        console.log("count:"+count);
        //Project Point info
        var pointIdList = [];
        for(var i = 0;i<pointList.length;i++)
        {
            pointIdList.push(pointList[i]._id);
            var temp = Pointinfo.findOne({'_id':pointList[i]._id});
            if(temp)
            {
                Pointinfo.update({_id:pointList[i]._id},{
                    $set:pointList[i]
                });
            }
            else
            {
                Pointinfo.insert(pointList[i]);
            }
        }
        Pointinfo.remove(
            {'belongProType':{$in:inIdsList},'_id':{$nin:pointIdList}}
        );
        
        //imageClassifyList
        var classifyIdsList = [];
        for(var i = 0;i<imageClassifyList.length;i++)
        {
            classifyIdsList.push(imageClassifyList[i]._id);
            var temp = Imageclassify.findOne({'_id':imageClassifyList[i]._id});
            if(temp)
            {
                Imageclassify.update(
                    {
                        _id:imageClassifyList[i]._id
                    },
                    {
                        $set:imageClassifyList[i]
                    }
                );
            }
            else
            {
                Imageclassify.insert(imageClassifyList[i]);
            }
        }
        Imageclassify.remove(
            {'belongProType':{$in:inIdsList},'_id':{$nin:classifyIdsList}}
        );

        //imageDetailList
        var imagedetailIdList = [];
        for(var i = 0;i<imageDetailList.length;i++)
        {
            imagedetailIdList.push(imageDetailList[i]._id);
            var temp = Imagedetail.findOne({'_id':imageDetailList[i]._id});
            if(temp)
            {
                Imagedetail.update(
                    {
                        _id:imageDetailList[i]._id
                    },
                    {
                        $set:imageDetailList[i]
                    }
                );
            }
            else
            {
                Imagedetail.insert(imageDetailList[i]);
            }
        }
        Imagedetail.remove(
            {'belongImgClass':{$in:classifyIdsList},'_id':{$nin:imagedetailIdList}}
        );

        
        //equipmentList
        var equipmentIdList = [];
        for(var i = 0;i<equipmentList.length;i++)
        {
            equipmentIdList.push(equipmentList[i]._id);
            var temp = Equipment.findOne({'_id':equipmentList[i]._id});
            if(temp)
            {
                Equipment.update(
                    {
                        _id:equipmentList[i]._id
                    },
                    {
                        $set:equipmentList[i]
                    }
                );
            }
            else
            {
                Equipment.insert(equipmentList[i]);
            }
        }
        Equipment.remove(
            {'belongPoint':{$in:pointIdList},'_id':{$nin:equipmentIdList}}
        );


        //imageInfoList
        var imageInfoIdList = [];
        for(var i = 0;i<imageInfoList.length;i++)
        {
            var imageId;
            if(imageInfoList[i]._id._str)
            {
                imageId = imageInfoList[i]._id._str;
            }
            else
            {
                imageId = imageInfoList[i]._id;
            }
            imageInfoIdList.push(imageId);
            imageInfoList[i]._id = imageId;
            var temp = Imageinfo.findOne({'_id':imageId});
            if(temp)
            {
                Imageinfo.update(
                    {
                        _id:imageInfoList[i]._id
                    },
                    {
                        $set:imageInfoList[i]
                    }
                );
            }
            else
            {
                console.log(imageInfoList[i]);
                Imageinfo.insert(imageInfoList[i]);
            }
        }
        Imageinfo.remove(
            {'belongPro':backupInfo.projectId,'_id':{$nin:imageInfoIdList}}
        );



        //messageList
        var messageIdList = [];
        for(var i = 0;i<messageList.length;i++)
        {
            messageIdList.push(messageList[i]._id);
            var temp = Messages.findOne({'_id':messageList[i]._id});
            if(temp)
            {
                Messages.update(
                    {
                        _id:messageList[i]._id
                    },
                    {
                        $set:messageList[i]
                    }
                );
            }
            else
            {
                Messages.insert(messageList[i]);
            }
        }
        Messages.remove(
            {'chatId':backupInfo.projectId,'_id':{$nin:messageIdList}}
        );

        return {
            'success':true,
            'result':"",
            'msg':""
        };
    }
})