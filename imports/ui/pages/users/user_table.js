Template.user_table.helpers({
    showBtn: function(a){

        if(a==0){
            return false;
        }else{
            return true;
        }
    },
    whichEng: function(a){

        if(a=='1'){
            return false;
        }else if(a=='2'){
            return true;
        }
    },
    ableState: function(a){
        //0是停用，1是启用
        if(a==1){
            return false;
        }else if(a==0){
            return true;
        }
    },
});