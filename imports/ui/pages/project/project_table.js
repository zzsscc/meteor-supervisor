Template.project_table.helpers({
    accState: function(a){
        //0是启用，1是未启用
        if(a==1){
            return false;
        }else if(a==0){
            return true;
        }
    },

});