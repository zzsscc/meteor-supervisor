/**
 * Created by admin on 2017/1/2.
 */
Meteor.publish('imageList', function(proType_id,point_id) {
    if(proType_id){
        if(!point_id){
            return Imageinfo.find({
                'belongProType':proType_id
            });
        }else{
            return Imageinfo.find({
                'belongProType':proType_id,
                'belongPoint':point_id
            });
        }
    }else{
        return Imageinfo.find({'_id':0});
    }
});