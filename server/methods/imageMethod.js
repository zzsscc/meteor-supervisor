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
    //照片上传
    'uploadImageToDB'(imgdata,pro_id,proType_id,point_id,equipment_id,imgClass_id,imgDetail_id,imgRemark,byuser_id,takeTime,longitude,latitude,userName,pointName) {
        console.log("uploadImageToDB");
        //if(imgdata && pro_id && proType_id && point_id && equipment_id && imgClass_id && imgDetail_id && imgRemark && byuser_id){
        if(imgdata && pro_id && proType_id && point_id && byuser_id && userName && pointName){
            var now = new Date();
            var message = "";
            var dataBuffer = new Buffer(imgdata, 'base64');
            var fileUploadPath="/mnt/jianli/upload/";//发布或测试时改称本机路径
            var fileName = now.getTime()+'.png';
            var host = "http://jianli.eshudata.com/upload/";//发布和测试时，改称本机地址和端口
            fs.writeFile(fileUploadPath+fileName, dataBuffer, function(err) {
                if(err){
                console.log(err);
                }else{
                console.log("保存成功！");
                message = "保存成功！";
                }
            });
            var imageUrl = host+fileName;
            var nowStr=((Date.parse(now))/ 1000).toString();
            var formatDate = now.Format('yyyy-MM-dd');
            Imageinfo.insert({
                'modifyTime':formatDate,
                'createtime':nowStr,
                'belongPro':pro_id,
                'belongProType':proType_id,
                'belongPoint':point_id,
                'belongEquipment':equipment_id,
                'belongImgClass':imgClass_id,
                'belongImgDetail':imgDetail_id,
                'byuser':byuser_id,
                'imgRemark':imgRemark,
                'base64':imageUrl,
                'takeTime':takeTime,
                'longitude':longitude,
                'latitude':latitude,
                'byusername':userName,
                'pointName':pointName
            });

            //更新点位上现有的照片数
            Meteor.call('pointNowPicSum');

            //更新项目进度
            Meteor.call('proProgress',pro_id);

            return {
                'success':true,
                'msg':message,
                'result':imageUrl
            }
        }else{
            return {
                'success':false,
                'msg':"照片上传失败，信息不全"
            }
        }
    },
    'uploadImage'(imgdata) {
        console.log("uploadImage");
        if(imgdata){
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
            return {
                'success':true,
                'msg':message,
                'result':imageUrl
            }
        }else{
            return {
                'success':false,
                'msg':"照片上传失败，信息不全"
            }
        }
    }

})