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
Meteor.methods({
    // 'projectStatistics'(projectId) {
    //     //STEP 1:获取项目里所有监理
    //     var imageList = Imageinfo.find({'belongPro':projectId}).fetch();
    //     //STEP 2:获取各个监理上传的照片数量
    //     var tempDate = new Date(); //获取今天日期
    //     tempDate.setDate(tempDate.getDate() - 7);
    //     tempDate.setHours(0);
    //     tempDate.setMinutes(0);
    //     tempDate.setSeconds(0);
        
    //     var temp = Math.floor(tempDate.getTime()/1000);
    //     var supervisors = [];
    //     for(var i = 0;i<imageList.length;i++)
    //     {
    //         var imageInfo = imageList[0];
    //         var date = new Date(Number(imageInfo.createtime)*1000);
    //         var statisticsDate = date.Format('yyyy-MM-dd');
    //         var user = Users.findOne({_id:imageInfo.byuser});
    //         var has = false;
    //         for(var j = 0;j<supervisors.length;j++)
    //         {
    //             if(supervisors[j].userId == imageInfo.byuser)
    //             {
    //                 has = true;
    //                 supervisors[j].uploadCount ++;
    //                 //STEP 2: 7天内的统计返回
    //                 console.log(temp);
    //                 console.log(Number(imageInfo.createtime));
    //                 if(temp <= Number(imageInfo.createtime))
    //                 {
    //                     var hasDate = false;
    //                     for(var k = 0;k<supervisors[j].statistics.length;k++)
    //                     {
    //                         if(supervisors[j].statistics[k].date == statisticsDate)
    //                         {
    //                             supervisors[j].statistics[k].value += 1;
    //                             hasDate = true;
    //                             break;
    //                         }
    //                     }
    //                     if(!hasDate)
    //                     {
    //                         supervisors[j].statistics.push({'date':statisticsDate,'value':1});
    //                     }
    //                 }
    //                 break;
    //             }
    //         }
    //         if(!has)
    //         {
    //             var obj = {
    //                 'userId':imageInfo.byuser,
    //                 'name':user.username,
    //                 'uploadCount':1,
    //                 'projectTotalCount':imageList.length,
    //                 'statistics':[]
    //             }
                
    //             if(temp <= statisticsDate)
    //             {
    //                 obj.statistics.push({'date':statisticsDate,'value':1});                    
    //             }
                
    //             supervisors.push(obj);
                
    //         }
            
    //     }
        
        
    //     return {
    //         'success':true,
    //         'msg':'成功',
    //         'result':supervisors
    //     }
    // },
    'projectStatistics'(projectId) {
        //STEP 1:获取项目里所有监理
        var projectTypeList = Projecttype.find({'belongPro':projectId}).fetch();
        var supervisors = [];
        for(var i = 0;i<projectTypeList.length;i++)
        {
            for(var j = 0;j<projectTypeList[i].supervision.length;j++)
            {
                var has = false;
                for(var k = 0;k<supervisors.length;k++)
                {
                    if(projectTypeList[i].supervision[j] == supervisors[k].userId)
                    {
                        has = true;
                        break;
                    }
                }
                if(!has)
                {
                    var user = Users.findOne({_id:projectTypeList[i].supervision[j]});
                    var obj = {
                    'userId':projectTypeList[i].supervision[j],
                    'name':user.username,
                    'uploadCount':0,
                    'projectTotalCount':0,
                    'statistics':[]
                    }
                    supervisors.push(obj);
                }
            }
        }
        var imageList = Imageinfo.find({'belongPro':projectId}).fetch();
        //STEP 2:获取各个监理上传的照片数量
        var tempDate = new Date(); //获取今天日期
        tempDate.setDate(tempDate.getDate() - 7);
        tempDate.setHours(0);
        tempDate.setMinutes(0);
        tempDate.setSeconds(0);
        
        var temp = Math.floor(tempDate.getTime()/1000);
        
        for(var i = 0;i<imageList.length;i++)
        {
            var imageInfo = imageList[i];
            var date = new Date(Number(imageInfo.createtime)*1000);
            var statisticsDate = date.Format('yyyy-MM-dd');            
            var has = false;
            
            for(var j = 0;j<supervisors.length;j++)
            {
                
                if(supervisors[j].userId == imageInfo.byuser)
                {
                    has = true;
                    supervisors[j].uploadCount ++;
                    supervisors[j].projectTotalCount = imageList.length;
                    //STEP 2: 7天内的统计返回
                    if(temp <= Number(imageInfo.createtime))
                    {
                        var hasDate = false;
                        for(var k = 0;k<supervisors[j].statistics.length;k++)
                        {
                            if(supervisors[j].statistics[k].date == statisticsDate)
                            {
                                supervisors[j].statistics[k].value += 1;
                                hasDate = true;
                                break;
                            }
                        }
                        if(!hasDate)
                        {
                            supervisors[j].statistics.push({'date':statisticsDate,'value':1});
                        }
                    }
                    break;
                }
            }
        }
        
        console.log(supervisors);
        return {
            'success':true,
            'msg':'成功',
            'result':supervisors
        }
    }
})