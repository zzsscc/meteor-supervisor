var proRemark_id;

Template.pro_remark.helpers({

});

Template.pro_remark.events({
    'click .pro-remark-save':function(){
        proRemark_id=this._id;
        value1=$('.remark1').find('input').val();
        value2=$('.remark2').find('input').val();
        value3=$('.remark3').find('input').val();
        value4=$('.remark4').find('textarea').val();
        ProRemark.update({_id:proRemark_id},{ $set : { "remark1" : value1,"remark2" : value2,"remark3" : value3,"remark4" : value4} });
    }
});