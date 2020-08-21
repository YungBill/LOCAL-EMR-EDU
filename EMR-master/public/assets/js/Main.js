document.addEventListener('DOMContentLoaded', initMaterialzeCSS);

function initMaterialzeCSS(){
	initSideNav();
	initiScrollSpy();
	initDropdownMenu();
	initTabs();
	initDropdownButton();
}

function initSideNav(){
	const elem = document.querySelector('.sidenav');
	const sideNam = M.Sidenav.init(elem, {});
	$('.collapsible').collapsible();
}

function initiScrollSpy(){
	let options = {
		scrollOffset: 150,
		throttle: 10
	};
	const elem = document.querySelectorAll('.scrollspy');
	const instance = M.ScrollSpy.init(elem, options);
}

function initDropdownMenu(){
	let options = {
		constrainWidth: false,
		hover: true,
		coverTrigger: false,
		alignment: 'right',
	};
	const elem = document.querySelectorAll('.dropdown-trigger');
	const dropdownMenu = M.Dropdown.init(elem, options);
}

function initTabs(){
	const elem = document.querySelector('#main-tabs');
	const tabs = M.Tabs.init(elem, {swipeable: true});
}

function initDropdownButton(){
	let options = {
		constrainWidth: false,
		hover: true,
		//coverTrigger: false,
		
	};
	const elem = document.querySelector('#dropdown-button');
	M.Dropdown.init(elem, options);
}

function clear(id){
	document.getElementById(id).value = '';
}


function toggleCheck(id){
	let elem = document.getElementById(id);
	if(elem.checked === true) {
		elem.checked = false;
	} else {
		elem.checked = true;
	}
}


function check(id){
	document.getElementById(id).checked = true;
}

function unCheck(id){
	document.getElementById(id).checked = false;
}

function toggleCathether(catType, that){
	let thatCat = document.getElementById(that);
	
	// show/hide cathether info
	if(!thatCat.checked) {
		toggleHideShow(catType);
	} else if (!catType.checked){
		thatCat.checked = false;
	}
}

function toggleHideShow(id){
	let elem = document.getElementById(id);
	let display = elem.style.display;
	
	if(display === 'block') {
		elem.style.display = 'none';
	} else {
		elem.style.display = 'block';
	}
}

function show(id){
	document.getElementById(id).style.display = 'block';
}

function hide(id){
	document.getElementById(id).style.display = 'none';
}


function resetByName(groupName){
	const buttons = document.getElementsByName(groupName);
	
	buttons.forEach(function(button){
		button.checked = false;
	});
	
	/*for (let i = 0; i < buttons.length; i++) {
	 buttons[i].checked = false;
	 }*/
}


function resetExceptNone(groupName, noneId){
	const buttons = document.getElementsByName(groupName);
	
	buttons.forEach(function(button){
		if(button.id !== noneId) {
			button.checked = false;
			button.disabled = !button.disabled;
		}
	});
	
}

function carepriorarrivaleventCheck(){
	if(document.getElementById('carepriorArrEDyes').checked){
		document.getElementById('carepriorArrED').style.display = 'block'
		document.getElementById('carepriorArrinfoWarningED').style.display = 'block';
		document.getElementById('carepriorArrED').required = true;
	}else{
		document.getElementById('carepriorArrED').style.display = 'none'
		document.getElementById('carepriorArrinfoWarningED').style.display = 'none';
		document.getElementById('carepriorArrED').required = false;
	}
}

function drugallergyradioeventCheck(){
    if(document.getElementById('drugACEDyes').checked){
        document.getElementById('drugallergyinfoED').style.display = 'block'
        document.getElementById('drugallergyinfoWarningED').style.display = 'block';
        document.getElementById('drugallergyinfoED').required = true;
    }else{
        document.getElementById('drugallergyinfoED').style.display = 'none';        
        document.getElementById('drugallergyinfoWarningED').style.display = 'none';
        document.getElementById('drugallergyinfoED').required = false;
    }
}

function otherallergyradioeventCheck(){
    if(document.getElementById('otherACEDyes').checked){
        document.getElementById('otherallergyinfoED').style.display = 'block'
        document.getElementById('otherallergyinfoWarningED').style.display = 'block';
        document.getElementById('otherallergyinfoED').required = true;
    }else{
        document.getElementById('otherallergyinfoED').style.display = 'none';        
        document.getElementById('otherallergyinfoWarningED').style.display = 'none';
        document.getElementById('otherallergyinfoED').required = false;
    }
}

function cbChecker(){
    if(document.getElementById('xray').checked){
        document.getElementById('xrayspecs').style.display = 'block';
    }else{
		document.getElementById('xrayspecs').style.display = 'none';
		document.getElementById('xrayspecs').value = "";
    }

    if(document.getElementById('bloodtest').checked){
        document.getElementById('bloodtestspecs').style.display = 'block';
    }else{
		document.getElementById('bloodtestspecs').style.display = 'none';
		document.getElementById('bloodtestspecs').value = "";
    }

    if(document.getElementById('bodyfluids').checked){
        document.getElementById('bodyfluidsspecs').style.display = 'block';
    }else{
		document.getElementById('bodyfluidsspecs').style.display = 'none';
		document.getElementById('bodyfluidsspecs').value = "";
    }

    if(document.getElementById('others').checked){
        document.getElementById('othersinvestigationspecs').style.display = 'block';
    }else{
		document.getElementById('othersinvestigationspecs').style.display = 'none';
		//clears the textfield if unchecked so db won't display value
		document.getElementById('othersinvestigationspecs').value = "";
    }
}

window.onload = function(){
	carepriorarrivaleventCheck(),
	drugallergyradioeventCheck(),
	otherallergyradioeventCheck(),
	cbChecker()
};

paceOptions = {
	// Configuration goes here. Example:
	document: true
};

$(function(){
	
	$.fn.dataTable.moment('DD/MM/YYYY');
	$.fn.dataTable.moment('DD/MM/YYYY HH:mm');
	
	$('#patientMasterList')
	.DataTable({
		"bLengthChange": false,
		"iDisplayLength": 7,
		"order": [ [ 6, "dsc" ] ],
		responsive: true,
		select: {
			style: 'single'
		},
		"columnDefs": [
			{orderable: false, targets: 8},
			// {width: 35, targets: 8},
		]
	});
	
	
	$('#patientMasterForStudentList')
	.DataTable({
		"bLengthChange": false,
		"iDisplayLength": 7,
		"order": [ [ 6, "dsc" ] ],
		responsive: true,
		select: {
			style: 'single'
		}
	});
	
	
	$('#patientStudentList')
	.DataTable({
		"bLengthChange": false,
		"iDisplayLength": 7,// display only 7 records
		"order": [ [ 7, "dsc" ] ], //the 7 is the highlighted column (count from 0)
		responsive: true,
		select: {
			style: 'single'
		},
		"columnDefs": [
			{orderable: false, targets: 9},
			// targets: 9 works on student page
			//targets: 10 works on lecturer page
		]
	});
	
	$('#patientStudentList1')
	.DataTable({
		"bLengthChange": false,
		"iDisplayLength": 7,// display only 7 records
		"order": [ [ 7, "dsc" ] ], //the 7 is the highlighted column (count from 0)
		responsive: true,
		select: {
			style: 'single'
		},
		"columnDefs": [
			{orderable: false, targets: 10},
			// targets: 9 works on student page
			//targets: 10 works on lecturer page
		]
	});
	
});


