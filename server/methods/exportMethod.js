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
var archiver = require('archiver');
Meteor.methods({
    'exportImages'(projectId){
        var localPath = '/mnt/jianli/';
        // var localPath = '/data/';
        var urlPath = 'http://jianli.eshudata.com/';
        console.log("exportImages");
        //STEP 1:查询项目信息
        var projectInfo = Project.findOne({'_id':projectId});
        if(projectInfo == undefined || projectInfo == null)
        {
            //项目不存在，无需生成
            console.log("exportImages finish:项目不存在");
            return{
                'success':false,
                'msg':'项目不存在',
                'result':''
            };
        }
        
        //STEP 2:查询到所有分类
        var projectType = Projecttype.find({'belongPro':projectId}).fetch();
        var path = localPath+"export/"+projectInfo.proname+"/";
        if(!fs.existsSync(path))
        {
            fs.mkdirSync(path);
        }
        for(var i = 0;i<projectType.length;i++)
        {
            var typeDir = path+projectType[i].type+"/";
            if(!fs.existsSync(typeDir))
            {
                fs.mkdirSync(typeDir);
            }
            var pointList = Pointinfo.find({'belongProType':projectType[i]._id}).fetch();
            for(var j = 0; j < pointList.length; j++)
            {
                var pointDir = typeDir+pointList[j].name+"/";
                if(!fs.existsSync(pointDir))
                {
                    fs.mkdirSync(pointDir);
                }
                var directionList = Equipment.find({'belongPoint':pointList[j]._id}).fetch();
                for(var k = 0; k < directionList.length; k++)
                {
                    var  directionDir = pointDir+directionList[k].name+"/";
                    if(!fs.existsSync(directionDir))
                    {
                        fs.mkdirSync(directionDir);
                    }
                    var imageList = Imageinfo.find({'belongPro':projectId,'belongProType':projectType[i]._id,'belongPoint':pointList[j]._id,'belongEquipment':directionList[k]._id}).fetch();
                    for(var n = 0; n < imageList.length;n++)
                    {
                        var fileName = imageList[n].base64.replace(urlPath,localPath);
                        var copyFileName = fileName.replace(".png","").replace(localPath+"upload/","");
                        var file = fs.readFileSync(fileName);
                        var date = new Date(Number(copyFileName));
                        fs.writeFileSync(directionDir+date.Format('yyyy-MM-dd hh-mm-ss')+".png",file);
                    }
                }
                if(directionList.length == 0)
                {
                    var imageList = Imageinfo.find({'belongPro':projectId,'belongProType':projectType[i]._id,'belongPoint':pointList[j]._id}).fetch();
                    for(var n = 0; n < imageList.length;n++)
                    {
                        var fileName = imageList[n].base64.replace(urlPath,localPath);
                        var copyFileName = fileName.replace(".png","").replace(localPath+"upload/","");
                        var file = fs.readFileSync(fileName);
                        var date = new Date(Number(copyFileName));
                        fs.writeFileSync(pointDir+date.Format('yyyy-MM-dd hh-mm-ss')+".png",file);
                    }
                }
            }
            if(pointList.length == 0)
            {
                var imageList = Imageinfo.find({'belongPro':projectId,'belongProType':projectType[i]._id}).fetch();
                for(var n = 0; n < imageList.length;n++)
                {
                    var fileName = imageList[n].base64.replace(urlPath,localPath);
                        var copyFileName = fileName.replace(".png","").replace(localPath+"upload/","");
                    var file = fs.readFileSync(fileName);
                    var date = new Date(Number(copyFileName));
                    fs.writeFileSync(typeDir+date.Format('yyyy-MM-dd hh-mm-ss')+".png",file);
                }
            }
        }
        if(projectType.length == 0)
        {
            //STEP 3:查询所有图片
            var imageList = Imageinfo.find({'belongPro':projectId}).fetch();
            for(var n = 0; n < imageList.length;n++)
            {
                var fileName = imageList[n].base64.replace(urlPath,localPath);
                var copyFileName = fileName.replace(".png","").replace(localPath+"upload/","");
                var file = fs.readFileSync(fileName);
                var date = new Date(Number(copyFileName));
                fs.writeFileSync(path+date.Format('yyyy-MM-dd hh-mm-ss')+".png",file);
            }
        }
        //STEP 4:打包压缩
        var archiveFileName = localPath+'export/'+projectInfo.proname+'.zip';
        var output = fs.createWriteStream(archiveFileName);
        var archive = archiver('zip', {
            store: false // Sets the compression method to STORE. 
        });
        
        // listen for all archive data to be written 
        output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        });
        
        // good practice to catch this error explicitly 
        archive.on('error', function(err) {
        throw err;
        });
        // pipe archive data to the file 
        archive.pipe(output);
        // append files from a directory 
        console.log(path);
        archive.directory(path,projectInfo.proname); 
        // finalize the archive (ie we are done appending files but streams have to finish yet) 
        archive.finalize();
        
        var downloadUrl = urlPath+"export/"+projectInfo.proname+".zip";
        console.log("exportImages finish:"+downloadUrl);
        return{
            'success':true,
            'msg':'生成成功',
            'result':downloadUrl
        };
    }
});