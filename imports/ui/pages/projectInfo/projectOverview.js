//import {echarts} from "../jslib/echarts.min.js"

//import "./echarts.min.js"
import "./projectOverview.html"

let loguser;
let choosepro;
//let _projectss;
let _protype;
let _pointinfo;
let _this__project;
let _alluser;
let _imgTempinfo;
let superVisionId;
let iIndex;

//定义图片信息
var pictureInfoArr = [];
//转化成标准格式后的数组
var picInfoCount = [];
//标准格式后的时间数组
var picTimeCount =[];
//对应的数量
var picTimeNum = [];
//定义当前时间
var curTime = Date.parse(new Date());
curTime = curTime/1000;
//图片的筛选时间 
var picSelectTime;

//工作概况图表的series数据
var workChartData =[];

//监理概况雷达图图表的series数据
var jianliChartIndicator =[];
var jianliChartData =[];

//监理概况柱状图图表的数据
var jianliChartType =[];
var jianliChartData100 =[];
var jianliChartDataNow =[];
var jianliChartNumNow =[];


//条件筛选函数
function filter(project_id,vision_id,day_index){
	$('#mengban').show();
	_imgTempinfo.stop();
	_imgTempinfo = Meteor.subscribe('imageinfonums',project_id,vision_id,day_index,function(){
		$('#mengban').hide();
		//	销毁的顺序出了问题

		// _imgTempinfo = tem;
		var picTime = [];
		var oldTime = curTime - day_index * 86400;
		curTime = curTime.toString();
		oldTime = oldTime.toString();
		
		var _data = Imageinfo.find({"createtime":{$gt:oldTime,$lte:curTime}}).fetch();
		
		var pictureInfoArr = [];
		for(var i = 0;i<_data.length;i++){
			pictureInfoArr.push(_data[i].createtime);
		}
//		console.log(pictureInfoArr);

		var picTime = [];
//		时间筛选
		for(var k = 0 ; k<pictureInfoArr.length;k++){
			if(oldTime<=pictureInfoArr[k]<curTime){
				picTime.push(pictureInfoArr[k]);
			}
		}
		
//		console.log(picTime);
//		转换成格林时间
		//		将点击事件发生后的时间数组清空
			picInfoCount = [];
			for(var m = 0;m<picTime.length;m++){
				var picTransform = formatDay(picTime[m]);
				picInfoCount.push(picTransform);
			}
//			将点击事件发生后的时间数组清空
			picTime = [];
	//		console.log(picInfoCount);		
			var picNum = [];
			var count ;
			var newpicInfoCount = picInfoCount.sort();
	//		console.log(newpicInfoCount);
			
			var res = [];  
	//		对数组去重并且取出数量
	       for(var i = 0;i<newpicInfoCount.length;){  
	        var count = 0;  
	        for(var j=i;j<newpicInfoCount.length;j++)  
	        {   
	         if(newpicInfoCount[i] == newpicInfoCount[j])  
	         {  
	          count++;  
	         }    
	        }  
	        res.push([newpicInfoCount[i],count]);  
	        i+=count;  
	       }
	       
	       console.log(res);

		   //得到包括当前天的前day_index天
		   //得到当前天的时间戳
		   var now=((Date.parse(new Date()))/ 1000).toString();
		   for(var i=0;i<day_index;i++){
			   picTimeCount.push(formatDay(now-(86400*i)));
			   picTimeNum.push(0);
		   }
		   picTimeCount.reverse();
		   picTimeNum.reverse();
		   console.log(picTimeCount);
		   console.log(picTimeNum);

	       //将有拍摄照片数量的那天的picTimeNum替换掉
			for(var  i = 0 ;i<res.length;i++){
				for(var j=0;j<picTimeCount.length;j++){
					if(res[i][0]==picTimeCount[j]){
						picTimeNum.splice(j,1,res[i][1]);
					}
				}
	       }
			console.log(picTimeCount);
			console.log(picTimeNum);


	
			option.xAxis.data=picTimeCount;
			option.series[0].data=picTimeNum;
			picTimeCount = [];
			picTimeNum =[];
			draw_echart(document.getElementById("pic-chart"),option);
	})
}

function formatDay(dateC) {
    var date=new Date(dateC*1000);
    var y = date.getFullYear() + "-";
    var m = date.getMonth() + 1 + "-";
    var d = date.getDate();
    //字符串拼接
    var dateday = y + m + d;
    return dateday;
}

//加法函数
function getResult(a, b) {
  var c = [];
  if (a.length === b.length) {
    for(var i = 0; i < a.length; i++) {
      c[i] = a[i] + b[i];
    }
  }
  return c;
}

//echart图形组件加载

function draw_echart(element,options){
    var hardwareConsumeChart = require('echarts').init(element);
    //var hardwareConsumeChart = echarts.init(element);//两种初始化方式
    hardwareConsumeChart.setOption(options);
}
    
var option = {
    title: {
        text: ''
    },
    tooltip: {
        trigger: 'axis'
    },
    //legend: {
    //    data:['今日照片总数']
    //},
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: picTimeCount
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value}(张)'
        }
    },
    series: [
        {
            name:'今日照片总数',
            type:'line',
            data:picTimeNum,
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
             itemStyle : {  
                normal : {  
                    color:'#11a3ee',  
                    lineStyle:{  
                        color:'#11a3ee'  
                    }  
                }  
            },  
            
        }
    ]
};

var workoption = {
	tooltip : {
		trigger: 'item',
		formatter: "{b} : {c} ({d}%)"
		//formatter: "{a} <br/>{b} : {c} ({d}%)"
	},
	calculable : true,
	color:['#f6b61c','#fb7a53','#0fa2f2','#00c199','#78e7e6','#50d1cc'],
	series : [
		{
			//name:'项目概况',
			type:'pie',
			radius : [60, 100],
			center:['50%','50%'],
			clockWise:false,
			itemStyle : {
				normal : {
					label : {
						show : true,
						formatter: '{b} : {c}',
						position : 'left',
					},
				},
				emphasis : {
					label : {
						show : true,
						formatter: '{b} : {c}',
						position : 'center',
						textStyle : {
							fontSize : 16,
							fontWeight : 'bold'
						}
					},
				}
			},
			data:workChartData
			//data:[
			//	{value:1548, name:'纪念品'},
			//	{value:1548, name:'交通'},
			//	{value:135, name:'餐饮'},
			//	{value:234, name:'门票'},
			//	{value:310, name:'酒店'},
			//	{value:335, name:'其他'}
			//]
		}
	]
};

var jianlioption2 = {
	tooltip : {
		trigger: 'axis',
		formatter:'{b} <br> {a} : ({c}%)',
		axisPointer : {            // 坐标轴指示器，坐标轴触发有效
			type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
		},
	},
	//legend: {
	//	data:['已修复的故障','上报的故障'],
	//	orient:'vertical',
	//	x : '80%',
	//	y : '30%',
	//	textStyle :{
	//		fontSize : 12,
	//		color : '#42f9f7'
	//	},
	//	itemGap:20,
	//},
	grid: {
		x:'17%',
		//y:30,
		//x2:'24%',
		//y2:44,
		//borderColor : '#e5e5e5'
	},
	calculable : true,
	xAxis : [
		{
			type : 'category',
			//name : '类型',
			nameTextStyle : {
				fontSize : 12,
				color:'#0fa2f2',
			},
			data : jianliChartType,
			//data : ['1日','2日','3日','4日','5日','6日','7日'],
			axisTick:{
				show:false,
			},
			axisLabel:{
				textStyle:{
					fontSize:12,     //刻度大小
					color:"#0fa2f2",
				},
			},
			axisLine : {
				lineStyle:{
					color:"#0fa2f2",
				}
			},
		},
		{
			type : 'category',
			axisLine: {show:false},
			axisTick: {show:false},
			axisLabel: {show:false},
			splitArea: {show:false},
			splitLine: {show:false},
			data : jianliChartType
			//data : ['1日','2日','3日','4日','5日','6日','7日']
		}
	],
	yAxis : [
		{
			type : 'value',
			name : '完成率',
			nameTextStyle : {
				fontSize : 12,
				color:'#0fa2f2'
			},
			axisTick:{
				show:false,
			},
			axisLabel:{
				textStyle:{
					fontSize:12,     //刻度大小
					color:"#0fa2f2"
				},
				interval:3,
				formatter:'{value}%'
			},
			axisLine : {
				lineStyle:{
					color:"#0fa2f2"
				}
			},
			splitLine:{
				lineStyle:{
					color: ['#0fa2f2']
				}
			}
		},
		{
			type : 'value',
			name : '张数',
			nameTextStyle : {
				fontSize : 12,
				color:'#fb7a53'
			},
			axisLabel : {
				textStyle:{
					fontSize:12,     //刻度大小
					color:"#fb7a53"
				},
				formatter: '{value}'
			},
			axisLine : {
				show:false
			},
			axisTick:{
				show:false
			},
			splitLine:{
				show:false
			},
		}
	],
	series : [
		{
			name:'完成率',
			type:'bar',
			xAxisIndex:1,
			itemStyle: {
				normal: {color:'rgba(15,162,242,1)',
					label:{
						show:true,
						textStyle:{
							color:'#0fa2f2'
						},
						position:'top'
						//position:'insideTop'
					}
				}
			},
			barWidth:30,
			data:jianliChartDataNow
			//data:[9,8,11,7,8,5,4]
		},
		{
			name:'总比',
			type:'bar',
			//xAxisIndex:1,
			yAxisIndex: 0,
			itemStyle: {
				normal: {
					color:'rgba(15,162,242,0.5)',
					label:{
						show:false,
						textStyle:{
							color:'#0fa2f2'
						},
						position:'insideTop'
					}
				}
			},
			barWidth:30,
			data:jianliChartData100
			//data:[10,11,12,10,8,7,4]
		},
		{
			name:'张数',
			type:'line',
			itemStyle: {
				normal: {color:'#fb7a53'}
			},
			yAxisIndex: 1,
			symbol:'circle',
			symbolSize:10,
			data:jianliChartNumNow
		},
	]
};


var jianlioption = {
	tooltip : {
		//show:true,
		//trigger: 'axis'
		trigger: 'item',
	},
	//legend: {
	//	orient : 'vertical',
	//	x : 'right',
	//	y : 'bottom',
	//	data:['监理概况']
	//},
	polar : [
		{
			indicator : jianliChartIndicator,
			name:{
				textStyle:{color:'#0fa2f2'}
			}
			//indicator : [
			//	{ text: '销售（sales）', max: 6000},
			//	{ text: '管理（Administration）', max: 16000},
			//	{ text: '信息技术（Information Techology）', max: 30000},
			//	{ text: '客服（Customer Support）', max: 38000},
			//	{ text: '研发（Development）', max: 52000},
			//	{ text: '市场（Marketing）', max: 25000}
			//]
		}
	],
	color:['#0fa2f2'],
	calculable : true,
	series : [
		{
			name: '监理概况',
			type: 'radar',
			dataRangeHoverLink:true,
			symbol: "circle",
			itemStyle: {
				normal:{
					borderWidth:3,
					color: '#0fa2f2',
					borderColor: '#0fa2f2'
				},
				emphasis:{
					borderWidth:6,
					color: '#0fa2f2',
					borderColor: '#0fa2f2'
				}

			},//拐点样式
			data : [
				{
					value : jianliChartData,
					name:'已拍照片数'
					//value : [4300, 10000, 28000, 35000, 50000, 19000]
				}
			]
		}
	]
};





Template.projectOverview.rendered = function(){
	superVisionId ="all";
	iIndex = 7;
    filter(choosepro,superVisionId,iIndex);

};
    
Template.projectOverview.onRendered(function projectOverview(){
	//监理走势图
	draw_echart(document.getElementById("pic-chart"),option);

	//项目概况
	_protype = this.subscribe('protype',choosepro,function(){
		$('.workchart').click();
		$('.jianlichart').click();
	});
	//draw_echart(document.getElementById("work-chart"),workoption);

	document.getElementById('links').onclick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement,
			link = target.src ? target.parentNode : target,
			options = {index: link, event: event},
			links = this.getElementsByTagName('a');
		blueimp.Gallery(links, options);
	};
});       
        
//将上次的订阅销毁
Template.projectOverview.onDestroyed (function(){
   //_projectss.stop();
	_protype.stop();
	_pointinfo.stop();
	_alluser.stop();
	_imgTempinfo.stop();
	_this__project.stop();
	//清空项目概况图表数据
	workChartData=[];
	//清空监理概况雷达图图表数据
	jianliChartIndicator =[];
	jianliChartData =[];
	//清空监理概况柱状图图表数据
	jianliChartType =[];
	jianliChartData100 =[];
	jianliChartDataNow =[];
	jianliChartNumNow=[];
});

//订阅获取项目的id号,再次订阅获取所属id号
Template.projectOverview.onCreated(function() {
	
	loguser=sessionStorage.getItem('loguser');
    if(!loguser){
        FlowRouter.go('/login');
    }

	$('#mengban').show();
	_this__project=this.subscribe('project',loguser);
    //当前项目的_id
    if (typeof( Session.get('choosepro')) == 'undefined') {
        Session.setDefault('choosepro', sessionStorage.getItem('choosepro'));
    }
    choosepro=Session.get("choosepro");

    //_projectss = this.subscribe('projectss',choosepro);
    
    _protype = this.subscribe('protype',choosepro);
    
    _pointinfo = this.subscribe('pointinfos');
    
    _alluser = this.subscribe('allusers');
    
    _imgTempinfo = this.subscribe('imageinfonums',choosepro,function(){
		$('#mengban').hide();
	});
    
    var _data = Imageinfo.find({}).fetch();
    
    
});
Template.projectOverview.helpers({
	proType:function(){
		var projecttype = Projecttype.find().fetch();
		var imageinfo = Imageinfo.find().fetch();
		var pointinfo = Pointinfo.find().fetch();
		var imgArr = [];
		var arr =[];
		for(var i=0;i<projecttype.length;i++){
			arr.push(projecttype[i]._id)
		}
		for(var i=0;i<arr.length;i++){
			var count = 0;
			for(var j = 0;j<pointinfo.length;j++){
				if(pointinfo[j].belongProType == arr[i]){
					count++;
				}
				
			}
			projecttype[i].proTypNumber = count;
		}
		
		for(var m =0;m< arr.length;m++){
			var sum = 0;
			for(var n = 0; n < imageinfo.length;n++){
				if(imageinfo[n].belongProType ==arr[m]){
					sum++;
				}
			}
			projecttype[m].picNumber = sum;
		}
		return projecttype;
	},
	proPeople:function(){
		var project1 = Project.find({'_id':choosepro}).fetch();
		var imageinfo1 = Imageinfo.find().fetch();
		var projecttype = Projecttype.find().fetch();
		var user1 = Users.find().fetch();
		var nameIdArr = [];
		var prosum = 0;
		var picsum = imageinfo1.length;
		
		if(project1.length>0){
			var proleader = project1[0].supervisionEngineer;

			if(projecttype.length>0){
				for(var j=0;j<projecttype.length;j++){
				if(projecttype[j].belongPro == project1[0]._id){
					var temp = projecttype[j].supervision.length;
					if( temp>0){
						nameIdArr.push(projecttype[j].supervision);
						var visionArr2 = nameIdArr.join(",").split(",");
			//			console.log(visionArr2)
						var visionArr3 =[];
						for(var i = 0; i< visionArr2.length;i++){
							if(visionArr3.indexOf(visionArr2[i]) == -1&&visionArr2[i].length != 0){
								//对监理员进行去重保存监理的id
								visionArr3.push(visionArr2[i]);

								var sum1 = visionArr3.length;

							}

						}
					}
				}
			}
			}
			if(sum1){
				prosum = 2 +sum1;
			}
			else{
				prosum = 2;
			}

			//arr用来保存user表中的用户信息
			var arr = [];
			for(var i = 0;i<user1.length;i++){
				if(user1[i]._id== proleader){
					arr.push(user1[i]);
				}
			}
	//		console.log(arr)
			//判断一个数组是不是空数组
			if(arr.length>0){
				var obj = arr[0];
				project1[0].proLeader = obj.username;
				project1[0].avatar = obj.avatar;
				project1[0].certificate = obj.certificate;
				project1[0].proTel = obj.phone;
				project1[0].proJob = obj.job;
				project1[0].pronum = prosum;
				project1[0].picSum = picsum;
				var arr1 = [];
				arr1.push(project1[0]);
			}
			//在没有选择监理工程师的时候不让人员配置模块为空
			else if(arr.length==0){
				project1[0].proLeader = '未选择监理工程师';
				project1[0].avatar = 'http://jianli.eshudata.com/img/profile_small.png';
				project1[0].proTel = '无';
				project1[0].proJob = '无';
				project1[0].pronum = prosum;
				project1[0].picSum = picsum;
				var arr1 = [];
				arr1.push(project1[0]);
			}
		}
		return arr1;
	},
	superVision:function(){
		var project1 = Project.find({'_id':choosepro}).fetch();
		var projecttype1 = Projecttype.find().fetch();
		var imageinfo1 = Imageinfo.find().fetch();
//		console.log(imageinfo1);
		var user2 = Users.find().fetch();
		var visionArr = [];
		var data=[];
		for(var i=0;i<projecttype1.length;i++){
			if(project1[0]._id == projecttype1[i].belongPro){
				visionArr.push(projecttype1[i].supervision);
			}			
		}
		if(visionArr.length>0){
//			把二元数组转化成一元
			var visionArr2 = visionArr.join(",").split(",");
//			console.log(visionArr2)
			var visionArr3 =[];
			for(var i = 0; i< visionArr2.length;i++){
				if(visionArr3.indexOf(visionArr2[i]) == -1&&visionArr2[i].length != 0){
					//对监理员进行去重保存监理的id
					visionArr3.push(visionArr2[i]);
				}
				
			}
//			console.log(visionArr3)
			var visionNameArr = []
			for(var j=0; j<visionArr3.length;j++){
				for(var k = 0;k<user2.length;k++){
					if(visionArr3[j] == user2[k]._id){
						visionNameArr.push(user2[k].username)
					}
				}	
			}
//			console.log(visionNameArr)
			projecttype1.visionName = visionNameArr;
			
			for(var i=0;i<visionNameArr.length;i++){
				var obj={};
				obj.visionName = visionNameArr[i];
//				console.log(visionArr3);		
				obj.superVision_id = visionArr3[i];
				data.push(obj);
			}

		}
		
		return data;
	},
		
});

//点击事件
Template.projectOverview.events({
	'click .active':function(e){
		e.preventDefault();

	},
	'click .supervision':function(e){
		e.preventDefault();		
		var  _this= e.currentTarget;
		$(_this).siblings().removeClass('active');
		$(_this).addClass('active');
		superVisionId= $(_this).attr("data");

		filter(choosepro,superVisionId,iIndex);
	},
	'click .imgdata':function(e){
		e.preventDefault();
		var _this = e.currentTarget;
		iIndex = $(_this).attr("data");
//		console.log(iIndex)
		$(_this).siblings().removeClass('active');
		$(_this).addClass('active');
		filter(choosepro,superVisionId,iIndex);
	},
	//工作概况
	'click .workchart':function(e){
		e.preventDefault();
		var projecttype = Projecttype.find().fetch();
		var pointinfo = Pointinfo.find().fetch();
		var arr =[];
		for(var i=0;i<projecttype.length;i++){
			arr.push(projecttype[i]._id)
		}
		for(var i=0;i<arr.length;i++){
			var count = 0;
			for(var j = 0;j<pointinfo.length;j++){
				if(pointinfo[j].belongProType == arr[i]){
					count++;
				}
			}
			projecttype[i].proTypNumber = count;
		}
		for(var i=0;i<projecttype.length;i++){
			workChartData.push({
				value:projecttype[i].proTypNumber, name:projecttype[i].type
			})
		}
		console.log(workChartData);
		workoption.series[0].data=workChartData;
		//项目概况
		draw_echart(document.getElementById("work-chart"),workoption);
	},
	//监理概况
	'click .jianlichart':function(e){
		e.preventDefault();
		Meteor.call('jianliData',choosepro,function(error,res){
			if(typeof error != 'undefined'){
				console.log(error);
			}else{
				if(res['success']==true){
					console.log(res['result']);
					jianliChartIndicator=[];
					jianliChartData=[];
					//项目类型大于6个雷达图
					if(res['result'].length>6){
						for(var i=0;i<res['result'].length;i++){
							jianliChartIndicator.push({ text: res['result'][i].typename, max: res['result'][i].picsum});
							jianliChartData.push(res['result'][i].picnow);
						}
						console.log(jianliChartIndicator);
						console.log(jianliChartData);
						jianlioption.polar[0].indicator=jianliChartIndicator;
						jianlioption.series[0].data[0].value=jianliChartData;
						draw_echart(document.getElementById("jianli-chart"),jianlioption);
					}
					//项目类型小于等于6个柱状图
					else if(res['result'].length>0 && res['result'].length<=6){
						for(var i=0;i<res['result'].length;i++){
							jianliChartType.push(res['result'][i].typename);
							jianliChartNumNow.push(res['result'][i].picnow);
							jianliChartData100.push(100);
							if(res['result'][i].picsum!=0){
								jianliChartDataNow.push(Math.round((res['result'][i].picnow/res['result'][i].picsum)*100));
							}
							else{
								jianliChartDataNow.push(100);
							}
						}
						console.log(jianliChartType);
						console.log(jianliChartData100);
						console.log(jianliChartDataNow);
						jianlioption2.xAxis[0].data=jianliChartType;
						jianlioption2.xAxis[1].data=jianliChartType;
						jianlioption2.series[0].data=jianliChartDataNow;
						jianlioption2.series[1].data=jianliChartData100;
						jianlioption2.series[2].data=jianliChartNumNow;
						draw_echart(document.getElementById("jianli-chart"),jianlioption2);
					}
					//console.log(jianliChartIndicator);
					//console.log(jianliChartData);
					//jianlioption.polar[0].indicator=jianliChartIndicator;
					//jianlioption.series[0].data[0].value=jianliChartData;
					//draw_echart(document.getElementById("jianli-chart"),jianlioption2);
					return;
				}else{
					alert(res['msg']);
				}
			}
		});
		//console.log(jianliChartData);
		//jianlioption.series[0].data=jianliChartData;
		//项目概况
		//draw_echart(document.getElementById("jianli-chart"),jianlioption);
	},
	//窗口大小改变
	//'resize window':function(e){
	//	console.log('1');
	//	$('.workchart').click();
	//	$('.jianlichart').click();
	//}
})