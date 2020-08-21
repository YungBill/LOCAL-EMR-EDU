const moment = require('moment');
const age = require('s-age');
const Handlebars = require('handlebars');

module.exports = {
	truncate: function(str, len){
		if(str.length > len && str.length > 0) {
			let new_str = str + " ";
			new_str = str.substr(0, len);
			new_str = str.substr(0, new_str.lastIndexOf(" "));
			new_str = (new_str.length > 0) ? new_str : str.substr(0, len);
			return new_str + '...';
		}
		return str;
	},
	stripTags: function(input){
		return input.replace(/<(?:.|\n)*?>/gm, '');
	},
	formatDate: function(date, format){
		return moment(date)
		.format(format);
	},
	formatDatetime: function(datetime){
		return moment(new Date(datetime))
		.format('DD/MM/YYYY HH:mm');
	},
	// only for medication Administration cos it's stored as 'DD/MM/YYYY'
	formatMonthDay: function(date, increment){
		// console.log(date);
		// date = "16/04/2020"
		var dateMomentObject = moment(date, "DD/MM/YYYY");
		// console.log(dateMomentObject);
		var datetime = moment(dateMomentObject).add(increment, 'days');
		// console.log(moment(datetime).format('MMM Do YY'));
		return moment(datetime)
		.format('MMM Do YY');
	},
	getAge: function(dob){
		return age(dob);
	},
	
	select: function(selected, options){
		return options.fn(this)
		.replace(new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"')
		.replace(new RegExp('>' + selected + '</option>'), ' selected="selected"$&');
	},
	editIcon: function(storyUser, loggedUser, storyId, floating = true){
		if(storyUser === loggedUser) {
			if(floating) {
				return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab red"><i class="fa fa-pencil"></i></a>`;
			} else {
				return `<a href="/stories/edit/${storyId}"><i class="fa fa-pencil"></i></a>`;
			}
		} else {
			return '';
		}
	},
	checkOpt: function(option) {
		if (option === 'Resulted' || option === 'Pending') {
			return 'checked';
		}
	},
	isResulted: function(status) {
		if (status === 'Resulted') {
			return 'visibility: visible';
		} else {
			return 'visibility: hidden';
		}
	},
	resetExceptNone: function(selected, value, noneValue) {
		//console.log('========= Selected in resetExceptNone ===== ' + value);
		if (selected){ // if it is not null
			for (let i=0; i < selected.length; i++) {
				if (selected[i] === noneValue){
					return 'disabled';
				} else {
					if (selected[i] === value) {
						return 'checked';
					}
				}
			}
		}
		return '';
	},
	
	checked: function(selected, value, disable = false) {
		if (selected){
			/*selectedValues.forEach((item) => {
				if (item === value) {
					console.log(`${item} : ${value}`);
					check = 'checked';
				}
			});
			return check;*/
			//console.log(`Entered checked => ${selected} : ${value}`);
			if (Array.isArray(selected)) {
				//console.log('None array');
				for (let i=0; i < selected.length; i++) {
					if(selected[ i ] === value) {
						return 'checked';
					}
				}
			} else {
				//console.log('Non-array');
				if (selected === value){
					//console.log(`Entered ${selected} === ${value}`);
					return 'checked';
				} else if (disable === true){
					return 'disabled';
				}
			}
			
		}
		return '';
	},
	
	setRadioButton(value, valueType) {
		//console.log(`========= value: ${value}   valueType: ${valueType}`);
		if(value !== undefined){
			if(value === valueType){
				//console.log('checked');
				return 'checked'
			} else {
				return ''
			}
		}else {
			return '';
		}
	},
	
	assessmentSaveLink: function(userType){
		if (userType === 'staff'){
			return '/master/save-nursing-assessment';
		} else if (userType === 'student'){
			return 'save student link';
		}
	},

	medicationTypeRegular: function(medicationType){
		if(medicationType == "Regular"){
			return 'block';
		}
		return 'none';
	},

	medicationTypeIrregular: function(medicationType){
		if(medicationType == "Irregular"){
			return 'block';
		}
		return 'none';
	},

	doseTimings: function(timings){
		var newTime = timings.toString();
		return newTime.replace(/,/g, ', ')
	},

	showArray: function(arr){
		var newArr = arr.toString();
		return newArr.replace(/,/g, ', ')
	},

	extractArrayItem: function(array, index, showType="read"){
		var strArr = array.toString();
		strArr = strArr.split(",");
		if(strArr[index] == ""){
			if(showType == "edit"){
				return '';
			}
			return 'None';
		}
		return strArr[index];
	},

	extractDoseInterval: function(array, index, doseType, showType){
		var strArr = array.toString();
		strArr = strArr.split(",");

		if(strArr[index] == ""){
			return '';
		}
		else if (doseType == showType){
			return strArr[index];
		}
		return '';
	},

	extractDoseDate: function(doseDate, doseType, showType){
		if (doseType == showType){
			return doseDate;
		}
		return '';
	},

	verificationBell:function(selectedBell, bellType, colour){
		if(selectedBell == bellType){
			return colour;
		}
		return 'grey';
	},

	ifEmpty: function(str){
		if(str == ""){
			return 'None'
		}
		return str
	},

	checkVerificationType: function(str){
		if(str == "Verified"){
			return 'green'
		}
		else if (str == "Verification not required"){
			return 'blue'
		}
		return 'red'
	},
	checkSelect: function(v1, v2){
		console.log(`${v1} ${v2}`)
		if(v1 == v2){
			return "selected"
		}
		return
	},
	exportHelper: function(v1){
		var str = ""
		for(let index = 0; index < v1.length; index++){
			if(v1[index].category == "Nebulising Med"){
				let nebList = v1[index].nebList;
				console.log(nebList);
				for(let index2 = 0; index2 < nebList.length; index2++){
					str += `${nebList[index2].split(":")[0]}|`
				}
			}
			else{
			str += `${v1[index].name}|`
			}
		}
		console.log(str);
		return str.substring(0, str.length - 1);
	},
	// ifEqual: Handlebars.registerHelper('ifCond', function(v1, v2, options) { // "if equals" conditional comparison
	// 	if(v1 === v2) {
	// 		return options.fn(this);
	// 	}
	// 	return options.inverse(this);
	// }),

	ifCond: function(v1, v2, options) { // "if equals" conditional comparison
	if(v1 === v2) {
		return options.fn(this);
	}
	return options.inverse(this);
	}
	
};