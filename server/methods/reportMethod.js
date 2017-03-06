var msPerDay = 1000*60*60*24;
var JPush = Npm.require("jpush-sdk");
var client = JPush.buildClient('712d04e9bed985901f9b5e34', '61147d64ba0930abb64e47ec');
//计算天数差的函数，通用
function  DateDiff(sDate1,  sDate2){    //sDate1和sDate2是2006-12-18格式
    var  aDate,  oDate1,  oDate2,  iDays;
    aDate  =  sDate1.split("-")
    oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);    //转换为12-18-2006格式
    aDate  =  sDate2.split("-")
    oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);
    if(oDate2>oDate1){
        iDays  =  parseInt((oDate2  -  oDate1)  /  1000  /  60  /  60  /24);    //把相差的毫秒数转换为天数
        return  iDays
    }
    else{
        return  0
    }
    //iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24);    //把相差的毫秒数转换为天数

}
//时间格式化yyyy-mm-dd
function formatDay(dateC) {
    var date=dateC;
    var y = date.getFullYear() + "-";
    var m = date.getMonth() + 1;
    var d = date.getDate();

    m = m < 10 ? "0" + m : "" + m;
    m = m + "-";
    d = d < 10 ? "0" + d : "" + d;
    //字符串拼接
    var dateday = y + m + d;
    return dateday;
}
Meteor.methods({
    'weekReport'(){
        var tempDate = new Date(); //获取今天日期
        // console.log(tempDate.getDay());
        // if(tempDate.getDay() != 5)
        // {
        //     return;
        // }
        console.log("build report");
        tempDate.setHours(0);
        tempDate.setMinutes(0);
        tempDate.setSeconds(0);
        var temp = Math.floor((tempDate.getTime()-msPerDay*7)/1000);

        var projectList = Project.find({}).fetch();
        for(var i = 0;i<projectList.length;i++)
        {
            if(projectList[i].weekly == 0)
            {
                continue;
            }
            var imageInfoList = Imageinfo.find({'belongPro':projectList[i]._id,'createtime':{$gt:''+temp}}).fetch();

            //得到用时百分比和剩余时间
            var begin=Project.find({ _id: projectList[i]._id }).fetch()[0].begindate;
            var end=Project.find({ _id: projectList[i]._id }).fetch()[0].enddate;
            var today=formatDay(new Date());
            console.log('begin: '+begin);
            console.log('end: '+end);
            console.log('today: '+today);
            var allDay=DateDiff(begin,end);
            var usedDay=DateDiff(begin,today);
            var surplusDay=DateDiff(today,end);
            var uesdPercent=(usedDay/allDay*100);
            if(uesdPercent<=100){
                uesdPercent=uesdPercent.toFixed(2)+'%';
            }
            else{
                uesdPercent='100%';
            }

            var projectTypeList = Projecttype.find({'belongPro':projectList[i]._id}).fetch();
            var content =  '截止今天17：00点，项目已用时'+uesdPercent+'(剩余'+surplusDay+'天)，'+'项目监理实时进度为'+projectList[i].progress+'。';
            var totalSum = 0;
            var currentSum = 0;
            var typeContent = '';
            for(var j = 0;j<projectTypeList.length;j++)
            {
                var currentTypePicSum = 0;
                var currentTypePicTotal = 0;
                var pointList = Pointinfo.find({'belongProType':projectTypeList[j]._id}).fetch();
                for(var k = 0;k<pointList.length;k++)
                {
                    var pointImageList = Imageinfo.find({'belongPro':projectList[i]._id,'belongPoint':pointList[k]._id,'createtime':{$gt:''+temp}}).fetch(); 
                    totalSum += pointList[k].picsum;
                    currentSum += pointImageList.length;
                    currentTypePicSum += pointImageList.length;
                }
                typeContent += projectTypeList[j].type+currentTypePicSum+'张';
                if(j<projectTypeList.length-1)
                {
                    typeContent+='、';
                }
                else{
                    typeContent+='。';
                }
            }
            var progress = 0;
            if(totalSum!=0)
            {
                progress = Math.floor(imageInfoList.length/totalSum * 100);
                if(progress>100){
                    progress=100;
                }
            }
            content += '本周共上传图片'+imageInfoList.length+'张，完成总进度的'+progress+'%';
            if(typeContent!='')
            {
                content += '，其中'+typeContent;
            }
            Messages.insert({
                    'chatId':projectList[i]._id,
                    'content':content,
                    'senderId':'week_report',
                    'senderName':'周报',
                    'senderHeadImage':'',
                    'createAt':new Date(),
                    'stateToPerson':[]
                });

            //消息方法中拷过来的，稍微改了点
            //得到刚插入的这条消息的_id
            var thismessage_id=Messages.find({
                'chatId':projectList[i]._id,
                'content':content,
                'senderId':'week_report',
            }).fetch()[0]._id;


            var allperson=[];
            //得到admin
            var admin=Users.findOne({'type':0})._id;
            allperson.push(admin);
            //得到这个项目的总监理工程师，监理工程师，业主
            var project = Project.findOne({'_id':projectList[i]._id});
            if(project.chiefEngineer){
                var chiefEngineer=project.chiefEngineer;
            }
            allperson.push(chiefEngineer);
            if(project.supervisionEngineer){
                var supervisionEngineer=project.supervisionEngineer;
            }
            allperson.push(supervisionEngineer);
            if(project.owner){
                var owner=project.owner;
            }
            allperson.push(owner);

            //得到这个项目的监理员
            var projecttype = Projecttype.find({'belongPro':projectList[i]._id}).fetch();
            for(var x=0;x<projecttype.length;x++){
                for(var j=0;j<projecttype[x].supervision.length;j++){
                    allperson.push(projecttype[x].supervision[j]);
                }
            }


            for(var x=0;x<allperson.length;x++){
                Messages.update(
                    {_id:thismessage_id},
                    { $addToSet :
                    {
                        "stateToPerson":allperson[x]
                    }
                    }
                );
            }


            //推送消息給所有项目组成员
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
            //得到去重后的这条消息要发送的人
            allperson=allperson.unique_zsc();
            //JPush.buildClient("f90075a80351cfec3059c6f8", "11b97a114860f55dd5b42ce7");
            client.push().setPlatform('ios', 'android')
                //client.push().setPlatform(JPush.ALL)
                .setAudience(JPush.tag(allperson))
                //.setAudience(JPush.tag('DDL3q4BeW8MyKKDqb'))
                //.setAudience(JPush.ALL)
                .setNotification(content, JPush.ios(content), JPush.android(content, null, 1))
                .setMessage(content)
                .setOptions(null, 60)
                .send(function(err, res) {
                    if (err) {
                        console.log(err.message)
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id)
                    }
                });

        }
    },
    'monthReport'(){
        var tempDate = new Date(); //获取今天日期
        tempDate.setMonth(tempDate.getMonth()-1);
        console.log(tempDate.getMonth());
        console.log(tempDate.getFullYear());
        tempDate.setHours(0);
        tempDate.setMinutes(0);
        tempDate.setSeconds(0);
        var temp = Math.floor(tempDate.getTime()/1000);




        var projectList = Project.find({}).fetch();
        for(var i = 0;i<projectList.length;i++)
        {
            if(projectList[i].monthly == 0)
            {
                continue;
            }
            var imageInfoList = Imageinfo.find({'belongPro':projectList[i]._id,'createtime':{$gt:''+temp}}).fetch();

            //得到用时百分比和剩余时间
            var begin=Project.find({ _id: projectList[i]._id }).fetch()[0].begindate;
            var end=Project.find({ _id: projectList[i]._id }).fetch()[0].enddate;
            var today=formatDay(new Date());
            console.log('begin: '+begin);
            console.log('end: '+end);
            console.log('today: '+today);
            var allDay=DateDiff(begin,end);
            var usedDay=DateDiff(begin,today);
            var surplusDay=DateDiff(today,end);
            var uesdPercent=(usedDay/allDay*100);
            if(uesdPercent<=100){
                uesdPercent=uesdPercent.toFixed(2)+'%';
            }
            else{
                uesdPercent='100%';
            }

            var projectTypeList = Projecttype.find({'belongPro':projectList[i]._id}).fetch();
            var content =  '截止今天09：00点，项目已用时'+uesdPercent+'(剩余'+surplusDay+'天)，'+'项目监理实时进度为'+projectList[i].progress+'。';
            var totalSum = 0;
            var currentSum = 0;
            var typeContent = '';
            for(var j = 0;j<projectTypeList.length;j++)
            {
                var currentTypePicSum = 0;
                var currentTypePicTotal = 0;
                var pointList = Pointinfo.find({'belongProType':projectTypeList[j]._id}).fetch();
                for(var k = 0;k<pointList.length;k++)
                {
                    var pointImageList = Imageinfo.find({'belongPro':projectList[i]._id,'belongPoint':pointList[k]._id,'createtime':{$gt:''+temp}}).fetch(); 
                    totalSum += pointList[k].picsum;
                    currentTypePicTotal += pointList[k].picsum;
                    currentSum += pointImageList.length;
                    currentTypePicSum += pointImageList.length;
                }
                if(currentTypePicTotal!=0){
                    if(Math.floor(currentTypePicSum/currentTypePicTotal*100)>100){
                        typeContent += projectTypeList[j].type+currentTypePicSum+'张，监理进度100%';
                    }else{
                        typeContent += projectTypeList[j].type+currentTypePicSum+'张，监理进度'+Math.floor(currentTypePicSum/currentTypePicTotal*100)+'%';
                    }
                }else{
                    typeContent += projectTypeList[j].type+currentTypePicSum+'张，监理进度100%（未设置所需拍摄数量）';
                }
                if(j<projectTypeList.length-1)
                {
                    typeContent+='；';
                }
                else{
                    typeContent+='。';
                }
            }
            var progress = 0;
            if(totalSum!=0)
            {
                progress = Math.floor(imageInfoList.length/totalSum * 100);
                if(progress>100){
                    progress=100;
                }
            }
            content += '本月共上传图片'+imageInfoList.length+'张，完成总进度的'+progress+'%';
            if(typeContent!='')
            {
                content += '，其中'+typeContent;
            }
            Messages.insert({
                    'chatId':projectList[i]._id,
                    'content':content,
                    'senderId':'month_report',
                    'senderName':'月报',
                    'senderHeadImage':'',
                    'createAt':new Date(),
                    'stateToPerson':[]
                });


            //消息方法中拷过来的，稍微改了点
            //得到刚插入的这条消息的_id
            var thismessage_id=Messages.find({
                'chatId':projectList[i]._id,
                'content':content,
                'senderId':'month_report',
            }).fetch()[0]._id;


            var allperson=[];
            //得到admin
            var admin=Users.findOne({'type':0})._id;
            allperson.push(admin);
            //得到这个项目的总监理工程师，监理工程师，业主
            var project = Project.findOne({'_id':projectList[i]._id});
            if(project.chiefEngineer){
                var chiefEngineer=project.chiefEngineer;
            }
            allperson.push(chiefEngineer);
            if(project.supervisionEngineer){
                var supervisionEngineer=project.supervisionEngineer;
            }
            allperson.push(supervisionEngineer);
            if(project.owner){
                var owner=project.owner;
            }
            allperson.push(owner);

            //得到这个项目的监理员
            var projecttype = Projecttype.find({'belongPro':projectList[i]._id}).fetch();
            for(var x=0;x<projecttype.length;x++){
                for(var j=0;j<projecttype[x].supervision.length;j++){
                    allperson.push(projecttype[x].supervision[j]);
                }
            }


            for(var x=0;x<allperson.length;x++){
                Messages.update(
                    {_id:thismessage_id},
                    { $addToSet :
                    {
                        "stateToPerson":allperson[x]
                    }
                    }
                );
            }


            //推送消息給所有项目组成员
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
            //得到去重后的这条消息要发送的人
            allperson=allperson.unique_zsc();
            //JPush.buildClient("f90075a80351cfec3059c6f8", "11b97a114860f55dd5b42ce7");
            client.push().setPlatform('ios', 'android')
                //client.push().setPlatform(JPush.ALL)
                .setAudience(JPush.tag(allperson))
                //.setAudience(JPush.tag('DDL3q4BeW8MyKKDqb'))
                //.setAudience(JPush.ALL)
                .setNotification(content, JPush.ios(content), JPush.android(content, null, 1))
                .setMessage(content)
                .setOptions(null, 60)
                .send(function(err, res) {
                    if (err) {
                        console.log(err.message)
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id)
                    }
                });

        }
    }
})