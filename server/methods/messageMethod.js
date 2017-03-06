var JPush = Npm.require("jpush-sdk");
var client = JPush.buildClient('712d04e9bed985901f9b5e34', '61147d64ba0930abb64e47ec');

//var tags = new Array("12205","test");
//JPush.setTags(tags);

Meteor.methods({
    'addMessage'(uid,chatId,content) {
        console.log(content);
        // check(chatId, nonEmptyString);
        // check(content, nonEmptyString);
        var user = Users.findOne({'_id':uid});
        Messages.insert({
            'chatId':chatId,
            'content':content,
            'senderId':uid,
            'senderName':user.username,
            'senderHeadImage':user.avatar,
            'createAt':new Date(),
            'stateToPerson':[]
        });
        //得到刚插入的这条消息的_id
        var thismessage_id=Messages.find({
            'chatId':chatId,
            'content':content,
            'senderId':uid,
            'senderName':user.username,
            'senderHeadImage':user.avatar,
        }).fetch()[0]._id;

        var allperson=[];
        //得到admin
        var admin=Users.findOne({'type':0})._id;
        allperson.push(admin);
        //得到这个项目的总监理工程师，监理工程师，业主
        var project = Project.findOne({'_id':chatId});
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
        var projecttype = Projecttype.find({'belongPro':chatId}).fetch();
        for(var i=0;i<projecttype.length;i++){
            for(var j=0;j<projecttype[i].supervision.length;j++){
                allperson.push(projecttype[i].supervision[j]);
            }
        }

        //去掉发消息的那个人
        for(var i=0;i<allperson.length;i++){
            if(allperson[i]==uid){
                allperson.splice(i,1);
            }
        }
        console.log(allperson);


        for(var i=0;i<allperson.length;i++){
            Messages.update(
                {_id:thismessage_id},
                { $addToSet :
                {
                    "stateToPerson":allperson[i]
                }
                }
            );
        }
        //上面的操作为更新消息表，并得到要推送消息的人

        //下面为更新每个人消息总数的表

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

        var allMessagesnum=Messagesnum.find().fetch();
        var thismessagenumid;
        var thismessagenum;
        for(var i=0;i<allperson.length;i++){
            var ifinsert=true;
            for(var j=0;j<allMessagesnum.length;j++){
                if(allperson[i]==allMessagesnum[j].userid){
                    ifinsert=false;
                    thismessagenumid=Messagesnum.find({'userid':allperson[i]}).fetch()[0]._id;
                    thismessagenum=Messagesnum.find({'userid':allperson[i]}).fetch()[0].num;
                }
            }
            //已存在则更新，不存在则插入
            if(ifinsert){
                Messagesnum.insert({
                    'userid':allperson[i],
                    'num':1
                });
            }
            else{
                thismessagenum++;
                Messagesnum.update(
                    {_id:thismessagenumid},
                    { $set : {
                        'num':thismessagenum
                    }
                    }
                );
            }
        }



        //推送消息給所有项目组成员，除了自己
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
})