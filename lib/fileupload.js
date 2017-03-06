// var fs = require('fs');
// var path = require('path');
UploadExcel = new FilesCollection({
    projectId:'',
	collectionName: 'uploadFiles',
	allowClientCode: false,
	downloadRoute: '/upload/',
	storagePath: '/mnt/jianli/upload/',
    onBeforeUpload: function (file) {
        if (file.size <= 10485760 && /xls|xlsx/i.test(file.extension)) {
            return true;
        } else {
            return '请上传Excel文件, 且文件不能大于10MB';
        }
    },
    onAfterUpload: function(fileRef) {
        // console.log(fileRef.path);
        //TODO:解析Excel
        var excel = new Excel('xlsx');
        var workbook = excel.readFile(fileRef.path);
        var yourSheetsName = workbook.SheetNames;
        var sheet = workbook.Sheets[yourSheetsName[0]];
        var options = { header : ['serial_number', 'point_type', 'point_code' ,'name','latitude','longitude','region','direction','piccount','remark' ] };
        var workbookJson = excel.utils.sheet_to_json( sheet, options );
        // console.log(workbookJson);
        //TODO:入库
        
        workbookJson.forEach(function(element) {
            if(element.serial_number == '序号')
            {
                return;
            }
            //STEP 1:获取类型，判断类型是否已存在,如果已存在，获取类型ID，
            var point_type = element.point_type;
            var proType = Projecttype.findOne(
                {
                    'belongPro':fileRef.meta.projectId,
                    'type':point_type
                }
            );
            if(!proType)
            {
                //如果不存在，添加类型
                point_type = Projecttype.insert(
                {
                    'type':point_type,
                    'belongPro':fileRef.meta.projectId,
                    'supervision':[]
                }
                );
            }
            else{
                point_type = proType._id;
            }

            //STEP 2:查询点位code是否已存在，不存在则添加，存在则复用
            var projectTypeList = Projecttype.find({'belongPro':fileRef.meta.projectId}).fetch();
            var ids = [];
            for(var i = 0;i<projectTypeList.length;i++)
            {
                ids.push(projectTypeList[i]._id);
            }
            console.log(ids);
            var point = Pointinfo.findOne(
                {'code':element.point_code,'belongProType':{$in:ids}}
            );
            console.log(point);
            var point_id;
            if(!point)
            {
                //TODO:插入点位信息
                point_id = Pointinfo.insert(
                {
                    'code':element.point_code,
                    'belongProType':point_type,
                    'name':element.name,
                    'latitude':element.latitude,
                    'longitude':element.longitude,
                    'region':element.region,
                    'pointRemark':element.remark
                    //'eqm':[]
                }
                );
            }
            else{
                point_id = point._id;
            }
            var equipment = Equipment.findOne({'belongPoint':point_id,'name':element.direction});
            if(isNaN(Number(element.piccount)))
            {
                element.piccount = 0;
            }
            if(!equipment)
            {
                Equipment.insert(
                {
                    'belongPoint':point_id,
                    'name':element.direction,
                    'piccount':Number(element.piccount)
                }
                );
            }
            else
            {
                
                Equipment.update(
                {
                    _id:equipment._id
                },
                { 
                    $set : 
                    {
                    'piccount':Number(element.piccount)
                    }
                });
            }
        }, this);

    }
});