const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const EMR_User = mongoose.model('emr-users');
const PatientMasterModel = mongoose.model('patient');
const PatientStudentModel = mongoose.model('patientStudent');
const NursingAssessmentModel = mongoose.model('assessmentModel');
const MasterVital = mongoose.model('masterVital');
const MasterBraden = mongoose.model('masterBraden');
const MasterEnteral = mongoose.model('masterEnteral');
const MasterIV= mongoose.model('masterIV');
const MasterIO = mongoose.model('masterIO');
const MasterOutput = mongoose.model('masterOutput');
const MasterFall = mongoose.model('masterFall');
const MasterOxygen = mongoose.model('masterOxygen');
const MasterPain = mongoose.model('masterPain');
const MasterWH = mongoose.model('masterWh');
const DoctorOrders = mongoose.model('doctorsOrders');
const MasterHistory = mongoose.model('masterHistoryTrack');
const MasterMNA = mongoose.model('masterMNA');
const MasterWound = mongoose.model('masterWound');
// MDP
const MasterMDP = mongoose.model('masterMDP');
const StudentMDP = mongoose.model('studentMDP');
// Care Plan
const StudentCarePlan = mongoose.model('studentCarePlan');
const MasterDiabetic = mongoose.model('masterDiabetic');
const MasterNeuro = mongoose.model('masterNeuro');
// CLC
const MasterGcs = mongoose.model('masterGcs');
const MasterClcVital = mongoose.model('masterClcVital');
const MasterPupils = mongoose.model('masterPupils');
const MasterMotorStrength = mongoose.model('masterMotorStrength');
//Feeding Regime & Schedule
const MasterFeedingRegime = mongoose.model('masterFeedingRegime');
const MasterFluidRegime = mongoose.model('masterFluidRegime');
const MasterScheduleFeed = mongoose.model('masterScheduleFeed');
const MasterScheduleFluid = mongoose.model('masterScheduleFluid');
// Discharge Planning
const MasterDischargePlanning = mongoose.model('masterDischargePlanning');
const MasterAppointment = mongoose.model('masterAppointment');
// MAR
const DrugList = mongoose.model('drugList');
const DrugRoutes = mongoose.model('drugRoutes');
const DrugFreq = mongoose.model('drugFrequency');
const MARCase = mongoose.model('mar-case');
const MARMedication = mongoose.model('mar-medication');
const MARPatientMaster = mongoose.model('mar-patient-master');
const MedAdministration = mongoose.model('medAdm');
const StudMedAdministration = mongoose.model('medAdmstud');
const MARSlidingScale = mongoose.model('sliding-scale');
const MedicationHistory = mongoose.model('dose-history');

const EDNotesModel = mongoose.model('edModel');
const postopProcedureNotesModel = mongoose.model('poProcedureNotesModel');
const StaffList = mongoose.model('staffList');
const StudentList = mongoose.model('studentList');
const ModuleList = mongoose.model('moduleList');


const moment = require('moment');
const csrf = require('csurf');
const alertMessage = require('../helpers/messenger');
// const  hbsSecurity = require("../helpers/hbsSecurity");
const {ensureAuthenticated, ensureAuthorised} = require('../helpers/auth');
const toaster = require('../helpers/Toaster');
const multer = require('multer');

// Import read excel file module
const readXlsxFile = require('read-excel-file/node');

// imports standardID
const standardID = require('standardid');
const MARAdministration = require('../models/MAR-Administration');

// setup csrf protection
const csrfProtection = csrf({cookie: true});

// Shows list of master patient documents
router.get('/list-patients', ensureAuthenticated, ensureAuthorised, (req, res) => {

	studentIDs = [];
	studentNames = [];
	
	console.log('\nFrom listPatientMaster user:');
	console.log(req.user);
	PatientMasterModel.find({user: req.user._id}) // req.user_id is assigned to user, which is then used by find
	.then(patients => {

		PatientStudentModel.find({masterID: req.user._id}) // req.user_id is self generated
		.then(studentPatients => {
				
			/*EMR_User.findById({})	// findById is Mongoose utility method
			.then(user => {*/
				//toaster.setErrorMessage(' ', 'Error listing master patient records');
				// To check if user has admin rights here
				res.render('master/master-list-patients', {
				
					patients: patients,
					// patients: patients)
					studentPatients: studentPatients,
					showMenu: false,
					//allowProtoMethodsByDefault: true,
      				//allowProtoPropertiesByDefault: true
				});
			//});
			
		});
	})
});

// shows the add patient form
router.get('/add-patient', ensureAuthenticated, (req, res) => {
	res.render('master/master-add-patient');	// handlebar!!
});

// Retrieves existing patient master page to edit
router.get('/edit/:patientID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	PatientMasterModel.findOne({
		patientID: req.params.patientID		// gets current user
})
	.populate('user')							// gets user from emr-users collection
	.then(patient => {
		// check if logged in user is owner of this patient record
		if(JSON.stringify(patient.user._id) === JSON.stringify(req.user.id)) {
			console.log(patient.user._id)
			console.log(req.user.id);
			req.session.patient = patient;				// adds object to session
			res.render('master/master-edit-patient', { // calls handlebars
				patient: patient,
				showMenu: true							// shows menu using unless
			});
		} else {
			console.log('Invalid User: not allowed to edit patient');
			console.log(patient.user._id)
			console.log(req.user.id);
			//alertMessage.flashMessage(res, 'User that created record is different from this user', 'fas
			// fa-exclamation', true);
			toaster.setErrorMessage('User that created record is different from this user');
		}
	});
});

// Saves/update edited master patient record
router.put('/save-edited-patient/:patientID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	PatientMasterModel.findOne({
		patientID: req.params.patientID
	})
	.then(patient => {
		// New values Biography
		patient.nric = req.body.nric;
		patient.familyName = req.body.familyName;
		patient.givenName = req.body.givenName;
		patient.dateCreated = moment(new Date(), 'DD/MM/YYYY', true)
		.format();
		patient.dob = moment(req.body.dob, 'DD/MM/YYYY', true)
		.format();
		patient.gender = req.body.gender;
		patient.weight = req.body.weight;
		patient.height = req.body.height;
		patient.address = req.body.address;
		patient.postalCode = req.body.postalCode;
		patient.mobilePhone = req.body.mobilePhone;
		patient.homePhone = req.body.homePhone;
		patient.officePhone = req.body.officePhone;
		// admission
		patient.ward = req.body.ward;
		patient.bed = req.body.bed;
		patient.admDate = moment(req.body.admDate, 'DD/MM/YYYY', true)
		.format();
		patient.policeCase = req.body.policeCase;
		patient.admFrom = req.body.admFrom;
		patient.modeOfArr = req.body.modeOfArr;
		patient.accompBy = req.body.accompBy;
		patient.caseNotes = req.body.caseNotes;
		patient.xRaysCD = req.body.xRaysCD;
		patient.prevAdm = req.body.prevAdm;
		patient.condArr = req.body.condArr;
		patient.otherCond = req.body.otherCond;
		patient.ownMeds = req.body.ownMeds;
		patient.unableAssess = req.body.unableAssess;
		patient.adviceMeds = req.body.adviceMeds;
		// psycho-social
		patient.emgName = req.body.emgName;
		patient.emgRel = req.body.emgRel;
		patient.emgMobile = req.body.emgMobile;
		patient.emgHome = req.body.emgHome;
		patient.emgOffice = req.body.emgOffice;
		
		patient.careName = req.body.careName;
		patient.careRel = req.body.careRel;
		patient.careOccu = req.body.careOccu;
		patient.careMobile = req.body.careMobile;
		patient.careHome = req.body.careHome;
		patient.careOffice = req.body.careOffice;
		
		patient.accomodation = req.body.accomodation;
		patient.hospConcerns = req.body.hospConcerns;
		patient.spiritConcerns = req.body.spiritConcerns;
		patient.prefLang = req.body.prefLang;
		patient.otherLang = req.body.otherLang;
		
		
		patient.save()
		.then(patient => {
			/*let alert = res.flashMessenger.success('Patient record successfully saved');
			 alert.titleIcon = 'far fa-thumbs-up';
			 alert.canBeDismissed = true;*/
			//alertMessage.flashMessage(res, 'Patient record successfully saved', 'far fa-thumbs-up', true);
			toaster.setSuccessMessage(' ', 'Patient (' + patient.givenName + ' ' + patient.familyName + ') Master Record' +
				' Updated');
			res.render('master/master-edit-patient', {
				patient: patient,
				toaster,
				showMenu: true
			});
			/*
			 alert.addMessage('Another message');
			 alert.addMessage('Yet another message');
			 alert.addMessage('Yet another another message');
			 
			 let anotherAlert = res.flashMessenger.info('Information message');
			 anotherAlert.canBeDismissed = true;
			 res.flashMessenger.add(anotherAlert);
			 
			 anotherAlert = res.flashMessenger.danger('Dangerous message');
			 anotherAlert.canBeDismissed = true;
			 res.flashMessenger.add(anotherAlert);
			 
			 req.flash('error_msg', 'Video idea added');
			 */
			
			//res.redirect('/master/list-patients'); // call router's URL
		});
	});
});

// saves new master patient document
router.post('/add-patient', ensureAuthenticated, ensureAuthorised, (req, res) => {
	// console.log('\n/User in req: ===========');
	// console.log(req.user);
	// EMR_User.findById(req.user._id)	// findById is Mongoose utility method
	// .then((user) => { // callback function that receives user object from find
	// 	/*console.log('\n/addPatient user found: ===========');
	// 	 console.log(user);*/
		
	// 	// Create empty Nursing Assessment first
	// 	new NursingAssessmentModel({})
	// 	.save()
	// 	.then(assessment => {
	// 		//console.log ('========> Assessment created:  ' + assessment._id);
	// 		new PatientMasterModel({
	// 			patientID: (new standardID('AAA0000')).generate(),
	// 			nric: req.body.nric,
	// 			user: user._id,
	// 			nursingAssessmentID: assessment._id,
	// 			// embed Nursing Assessment collection
	// 			/*nursingAssessmentEmbed: assessment,*/
	// 			familyName: req.body.familyName,
	// 			givenName: req.body.givenName,
	// 			dob: moment(req.body.dob, 'DD/MM/YYYY', true)
	// 			.format(),
	// 			gender: req.body.gender,
	// 			weight: req.body.weight,
	// 			height: req.body.height,
	// 			address: req.body.address,
	// 			postalCode: req.body.postalCode,
	// 			mobilePhone: req.body.mobilePhone,
	// 			homePhone: req.body.homePhone,
	// 			officePhone: req.body.officePhone,
				
	// 			ward: req.body.ward,
	// 			bed: req.body.bed,
	// 			admDate: moment(req.body.admDate, 'DD/MM/YYYY', true)
	// 			.format(),
	// 			policeCase: req.body.policeCase,
	// 			admFrom: req.body.admFrom,
	// 			modeOfArr: req.body.modeOfArr,
	// 			accompBy: req.body.accompBy,
	// 			caseNotes: req.body.caseNotes,
	// 			xRaysCD: req.body.xRaysCD,
	// 			prevAdm: req.body.prevAdm,
	// 			condArr: req.body.condArr,
	// 			otherCond: req.body.otherCond,
	// 			ownMeds: req.body.ownMeds,
	// 			unableAssess: req.body.unableAssess,
	// 			adviceMeds: req.body.adviceMeds,
				
	// 			emgName: req.body.emgName,
	// 			emgRel: req.body.emgRel,
	// 			emgMobile: req.body.emgMobile,
	// 			emgHome: req.body.emgHome,
	// 			emgOffice: req.body.emgOffice,
				
	// 			careName: req.body.careName,
	// 			careRel: req.body.careRel,
	// 			careOccu: req.body.careOccu,
	// 			careMobile: req.body.careMobile,
	// 			careHome: req.body.careHome,
	// 			careOffice: req.body.careOffice,
				
	// 			accomodation: req.body.accomodation,
	// 			hospConcerns: req.body.hospConcerns,
	// 			spiritConcerns: req.body.spiritConcerns,
	// 			prefLang: req.body.prefLang,
	// 			otherLang: req.body.otherLang
	// 		}).save()
	// 		.then((newPatient) => {
				
	// 			// Create a new mar-case when a patient is created
	// 			new MARCase({
	// 				patientId: newPatient.patientID
	// 			}).save().then((newCase)=>{
	// 				console.log(`New case created: ${newCase._id}`);
	// 			});

	// 			console.log('New Patient user id: ' + newPatient.user._id);
	// 			console.log('New Patient name: ' + newPatient.givenName);
	// 			req.session.patient = newPatient;
	// 			toaster.setSuccessMessage(' ', 'New Patient Master Record Added');
	// 			res.render('master/master-edit-patient', {
	// 				patient: (newPatient),
	// 				toaster,
	// 				showMenu: true
	// 			});
	// 			/*let alert = res.flashMessenger.success('New patient master record added');
	// 			alert.titleIcon = 'far fa-thumbs-up';
	// 			alert.canBeDismissed = true;*/
	// 			//alertMessage.flashMessage(res, 'New patient master record added', 'far fa-thumbs-up', true);
				
	// 			//res.redirect('/master/list-patients');
	// 			// redirect will activate router while render activates specific handlebar
	// 			/*.then(newPatient =>{
				
	// 			})*/
				
	// 		})
	// 	});
	// });
	console.log('\n/User in req: ===========');
	console.log(req.user);
	EMR_User.findById(req.user._id)	// findById is Mongoose utility method
	.then((user) => { // callback function that receives user object from find
		// Create empty Nursing Assessment first
		new NursingAssessmentModel({})
		// new EDNotesModel({})  //testing in progress - when EDNotes_ID is added
		.save()
		.then((assessment) => {
			new EDNotesModel({})
			.save()
			.then((ednotes) => {
				new postopProcedureNotesModel({})
				.save()
				.then((postopProNotes) => {
					new PatientMasterModel({
						patientID: (new standardID('AAA0000')).generate(),
						nric: req.body.nric,
						user: user._id,
						
						nursingAssessmentID: assessment._id,
						// embed Nursing Assessment collection
						/*nursingAssessmentEmbed: assessment,*/
						EDNotes_ID: ednotes._id,

						PostOp_ProcedureNotesID: postopProNotes._id,

						familyName: req.body.familyName,
						givenName: req.body.givenName,
						dob: moment(req.body.dob, 'DD/MM/YYYY', true)
						.format(),
						gender: req.body.gender,
						weight: req.body.weight,
						height: req.body.height,
						address: req.body.address,
						postalCode: req.body.postalCode,
						mobilePhone: req.body.mobilePhone,
						homePhone: req.body.homePhone,
						officePhone: req.body.officePhone,
						
						ward: req.body.ward,
						bed: req.body.bed,
						admDate: moment(req.body.admDate, 'DD/MM/YYYY', true)
						.format(),
						policeCase: req.body.policeCase,
						admFrom: req.body.admFrom,
						modeOfArr: req.body.modeOfArr,
						accompBy: req.body.accompBy,
						caseNotes: req.body.caseNotes,
						xRaysCD: req.body.xRaysCD,
						prevAdm: req.body.prevAdm,
						condArr: req.body.condArr,
						otherCond: req.body.otherCond,
						ownMeds: req.body.ownMeds,
						unableAssess: req.body.unableAssess,
						adviceMeds: req.body.adviceMeds,
						
						emgName: req.body.emgName,
						emgRel: req.body.emgRel,
						emgMobile: req.body.emgMobile,
						emgHome: req.body.emgHome,
						emgOffice: req.body.emgOffice,
						
						careName: req.body.careName,
						careRel: req.body.careRel,
						careOccu: req.body.careOccu,
						careMobile: req.body.careMobile,
						careHome: req.body.careHome,
						careOffice: req.body.careOffice,
						
						accomodation: req.body.accomodation,
						hospConcerns: req.body.hospConcerns,
						spiritConcerns: req.body.spiritConcerns,
						prefLang: req.body.prefLang,
						otherLang: req.body.otherLang
					}).save()
					.then((newPatient) => {
						
						// Create a new mar-case when a patient is created
						new MARCase({
							patientId: newPatient.patientID
						}).save().then((newCase)=>{
							console.log(`New case created: ${newCase._id}`);
						});
		
						console.log('New Patient user id: ' + newPatient.user._id);
						console.log('New Patient name: ' + newPatient.givenName);
						req.session.patient = newPatient;
						toaster.setSuccessMessage(' ', 'New Patient Master Record Added');
						res.render('master/master-edit-patient', {
							patient: newPatient,
							toaster,
							showMenu: true
						});
						/*let alert = res.flashMessenger.success('New patient master record added');
						alert.titleIcon = 'far fa-thumbs-up';
						alert.canBeDismissed = true;*/
						//alertMessage.flashMessage(res, 'New patient master record added', 'far fa-thumbs-up', true);
						
						//res.redirect('/master/list-patients');
						// redirect will activate router while render activates specific handlebar
						/*.then(newPatient =>{
						
						})*/
						
					})
				});
			});
		//console.log ('========> Assessment created:  ' + assessment._id);
		});
	});
});


// shows the master nursing assessment form
/*router.get('/show-nursing-assessment/:patientID', ensureAuthenticated, ensureAuthorised, (req, res) =>{
 res. ('master/master-edit-nursing-assessment',{
 patient: req.session.patient	// from session
 });	// handlebar!!
 });*/


// retrieves the  nursing assessment record to edit
//:patientID may be unncessary in this case because patient object is stored in session
router.get('/show-nursing-assessment/:patientID', ensureAuthenticated, (req, res) => {
	
	PatientMasterModel.findOne({
		patientID: req.params.patientID		// gets current patient
	})
	.then(retrievedPatient => {
		if(JSON.stringify(retrievedPatient.user._id) === JSON.stringify(req.user.id)) {
			NursingAssessmentModel.findById(retrievedPatient.nursingAssessmentID,{
				// new way of calling method
			}).then(assessment => {
				//let toaster = new Toaster('Retrieving nursing assessment record');
				req.session.assessment = assessment; // save to session for saving updated info
				res.render('master/master-edit-nursing-assessment', {
					assessment: assessment,
					patient: retrievedPatient,
					user: req.user,
					showMenu: true
				});
			});
		}else {
			console.log('User that created record is different from this user');
			//alertMessage.flashMessage(res, 'User that created record is different from current user', 'fas fa-exclamation',
			// true);
			toaster.setErrorMessage(' ', 'User that created record is different from this user');
			res.redirect('/master/list-patients');
		}
	});
});


// saves edited/updated nursing assessment form
router.put('/save-nursing-assessment/:patientID/:nursingAssessmentID', ensureAuthenticated, (req, res) => {
	console.log('Assessment id: ' + req.session.assessment._id);
	
	// Todo: check authorised user
	NursingAssessmentModel.findByIdAndUpdate(
		// the id of the item to find
		req.params.nursingAssessmentID,
		req.body, // will default all boolean radio buttons to false even if no selection is made
		{new: true},
		// the callback function
		(err, assessment) => {
			// Handle any possible database errors
			if (err) {
				return res.status(500).send(err);
			}
			//alertMessage.flashMessage(res, 'Nursing assessment updated', 'far fa-thumbs-up', true);
			toaster.setSuccessMessage(' ', 'Nursing Assessment Updated');
			res.render('master/master-edit-nursing-assessment', {
				assessment: assessment,
				patient: req.session.patient,
				user: req.user,
				toaster,
				showMenu: true
			});
			/*if (req.user.userType === 'staff'){
			
			} else {
				res.redirect('/student/list-patients');
			}*/
			
		}
	);
/*
	NursingAssessmentModel.findOne({
		_id: req.params.nursingAssessmentID
	})
	.then(assessment => {
		
		// Neurosensory
		assessment.mentalStatus = req.body.mentalStatus;
		assessment.mentalOthers = req.body.mentalOthers;
		assessment.orientedTo = req.body.orientedTo;
		assessment.hearing = req.body.hearing;
		assessment.hearingOthers = req.body.hearingOthers;
		assessment.hearingUnable = req.body.hearingUnable;
		assessment.vision = req.body.vision;
		assessment.visionOthers = req.body.visionOthers;
		assessment.visionUnable = req.body.visionUnable;
		assessment.speech = req.body.speech;
		
		// Respiratory
		assessment.breathingPattern = req.body.breathingPattern;
		assessment.breathingRemarks = req.body.breathingRemarks;
		assessment.breathingPresence = req.body.breathingPresence; // none required
		assessment.cough = req.body.cough;
		assessment.sputum = req.body.sputum;
		
		// Circulatory
		assessment.pulse = req.body.pulse;
		assessment.cirPresence = req.body.cirPresence;
		assessment.oedema = req.body.odema;
		assessment.extremities = req.body.extremities;
		assessment.pacemaker = req.body.pacemaker;
		assessment.paceMakerManu = req.body.paceMakerManu;
		
		// Gastrointestinal
		assessment.dietType = req.body.dietType;
		assessment.dietOthers = req.body.dietOthers;
		assessment.fluidRestriction = req.body.fluidRestriction;
		assessment.fluidSpecify = req.body.fluidSpecify;
		assessment.fluidUnable = req.body.fluidUnable;
		assessment.oralCavity = req.body.oralCavity;
		assessment.oralCavityPresence = req.body.oralCavityPresence;
		assessment.oralCavityOthers = req.body.oralCavityOthers;
		
		// Elimination
		assessment.bowel = req.body.bowel;		// none required
		assessment.bowelOthers = req.body.bowelOthers;
		assessment.urinaryAppearance = req.body.urinaryAppearance;
		assessment.urinaryRemarks = req.body.urinaryRemarks;
		assessment.urinaryPresence = req.body.urinaryPresence;	// none required
		assessment.urinaryOthers = req.body.urinaryOthers;
		assessment.adaptiveAids = req.body.adaptiveAids;		// none required
		assessment.catType = req.body.catType;
		assessment.catSize = req.body.catSize;
		assessment.dayLastChanged = req.body.dayLastChanged;
		
		// Sleep
		assessment.sleep = req.body.sleep;
		assessment.sleepSpecify = req.body.sleepSpecify;
		
		// Pain Assessment
		assessment.painPresent = req.body.painPresent;
		assessment.painScale = req.body.painScale;
		assessment.behavioural = req.body.behavioural;
		assessment.onset = req.body.onset;
		assessment.location = req.body.location;
		assessment.characteristic = req.body.characteristic;
		assessment.symptoms = req.body.symptoms;
		assessment.factors = req.body.factors;
		assessment.treatment = req.body.treatment;
		
		assessment.save().then((assessment) => {
			alertMessage.flashMessage(res, 'Nursing assessment updated', 'far fa-thumbs-up', true);
			res.render('master/master-edit-nursing-assessment', {
				assessment: assessment,
				patient: req.session.patient,
				user: req.user
			});
		});
	});
*/
});

// Show Single Story
router.get('/show/:id', (req, res) => {
	Story.findOne({
		_id: req.params.id
	})
	.populate('user')
	.populate('comments.commentUser')
	.then(story => {
		if(story.status === 'public') {
			res.render('stories/show', {
				story: story
			});
		} else {
			if(req.user) {		// check if user is logged in
				if(req.user.id === story.user._id) {
					res.render('stories/show', {
						story: story
					});
				} else {
					res.redirect('/stories');
				}
			} else {
				res.redirect('/stories');
			}
		}
	});
});

router.get('/io', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterIO.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newIO => {
		MasterEnteral.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newenteral => {
			MasterIV.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newiv => {	
				MasterOutput.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newoutput => {			

					iosample = [];
					iosampleDate = [];
					let ioFlow = Object.assign([], newIO);
					let enteralFlow = Object.assign([], newenteral);
					let ivFlow = Object.assign([], newiv);
					let outputFlow = Object.assign([], newoutput);
					ioCount = -1;
					enteralCount = -1;
					ivCount = -1;
					outputCount = -1;
					ionoRecord = 'No existing record';

					// Push IO DateTime into array
					newIO.forEach(io => {
						if (!(iosample.includes(io.datetime))) {
							iosample.push(io.datetime);
							iosampleDate.push(io.date);
						}
					});

					newenteral.forEach(enteral => {
						if (!(iosample.includes(enteral.datetime))){
							iosample.push(enteral.datetime);
							iosampleDate.push(enteral.date);
						}
					});

					newiv.forEach(iv => {
						if (!(iosample.includes(iv.datetime))) {
							iosample.push(iv.datetime);
							iosampleDate.push(iv.date);
						}
					});

					newoutput.forEach(output => {
						if (!(iosample.includes(output.datetime))) {
							iosample.push(output.datetime);
							iosampleDate.push(output.date);
						}
					});
		
					// Sorting the DateTime IO in the Array
					iosample.sort();
					iosampleDate.sort();

					for (i = 0; i < iosample.length; i++) {
						
						if (ioCount !== (ioFlow.length - 1)) {
							ioCount++;
						}


						if (enteralCount !== (enteralFlow.length - 1)) {
							enteralCount++;
						}

						if (ivCount !== (ivFlow.length - 1)) {
							ivCount++;
						}
						

						if (outputCount !== (outputFlow.length - 1)) {
							outputCount++;
						}

						// //Insert empty data when value doesnt match
						// //Count here does the index count of flow array
						if(ioFlow !='') 
						{
							if (iosample[i] < ioFlow[ioCount].datetime) {
								ioFlow.splice(ioCount, 0, {datetime: ''});
							} else if (iosample[i] > ioFlow[ioCount].datetime) {
								ioFlow.splice(ioCount + 1, 0, {datetime: ''});
							}
						} 
						else
						{
							ioFlow.push({datetime: '', intakefood: ionoRecord});
						}

						console.log(ioFlow, "IO Flow");
						if(enteralFlow !='') 
						{
							if (iosample[i] < enteralFlow[enteralCount].datetime) {
								enteralFlow.splice(enteralCount, 0, {datetime: ''});
							} else if (iosample[i] > enteralFlow[enteralCount].datetime) {
								enteralFlow.splice(enteralCount + 1, 0, {datetime: ''});
							}
						} 
						else
						{
							enteralFlow.push({datetime: '', enteralfeed: ionoRecord});
						}

						if(ivFlow !='') 
						{
							if (iosample[i] < ivFlow[ivCount].datetime) {
								ivFlow.splice(ivCount, 0, {datetime: ''});
							} else if (iosample[i] > ivFlow[ivCount].datetime) {
								ivFlow.splice(ivCount + 1, 0, {datetime: ''});
							}
						} 
						else 
						{
							ivFlow.push({datetime: '', ivflush: ionoRecord});
						}

						if(outputFlow !='')
						{
							if (iosample[i] < outputFlow[outputCount].datetime) {
								outputFlow.splice(outputCount, 0, {datetime: ''});
							} else if (iosample[i] > outputFlow[outputCount].datetime) {
								outputFlow.splice(outputCount + 1, 0, {datetime: ''});
							}
						}
						else 
						{
							outputFlow.push({datetime: '', otherass: ionoRecord});
						}
					};

					//DAILY NETT BALANCE
					let dateArr = [];
					let ArrayObj = [];

					newIO.forEach(io => {
						if(!(dateArr.includes(io.date))) {
							dateArr.push(io.date);
						}
					});

					newenteral.forEach(enteral => {
						if(!(dateArr.includes(enteral.date))) {
							dateArr.push(enteral.date);
						}
					});
					
					newiv.forEach(iv => {
						if(!(dateArr.includes(iv.date))) {
							dateArr.push(iv.date);
						}
					});

					newoutput.forEach(output => {
						if(!(dateArr.includes(output.date))) {
							dateArr.push(output.date);
						}
					});

					console.log(dateArr, "DateArry");

					newIO.forEach(io => {
						let fluidportion = 0;
						
						if(!isNaN(parseFloat(io.fluidportion))){
							fluidportion = parseFloat(io.fluidportion)
						}

						ArrayObj.push({
							date: io.date,
							balance: fluidportion
						});
					});

					newenteral.forEach(enteral => {
						let feedamt = 0, flush = 0;
						
						if(!isNaN(parseFloat(enteral.feedamt))){
							feedamt = parseFloat(enteral.feedamt)
						}

						if(!isNaN(parseFloat(enteral.flush))){
							flush = parseFloat(enteral.flush)
						}

						ArrayObj.push({
							date: enteral.date,
							balance: parseFloat(enteral.feedamt) + parseFloat(enteral.flush)
						});
					});

					newiv.forEach(iv => {

						let conamt = 0, amtinf = 0, ivflush = 0;
						
						if(!isNaN(parseFloat(iv.conamt))){
							conamt = parseFloat(iv.conamt)
						}

						if(!isNaN(parseFloat(iv.amtinf))){
							amtinf = parseFloat(iv.amtinf)
						}

						if(!isNaN(parseFloat(iv.ivflush))){
							ivflush = parseFloat(iv.ivflush)
						}

						ArrayObj.push({
							date: iv.date,
							balance: conamt + amtinf + ivflush
						});
					});

					var resultArr = createObject(ArrayObj);
					var inputArr = resultArr.slice();

					newoutput.forEach(output => {
						let urineamt = 0, vomitamt = 0, bloodamt = 0, diaper = 0, otheramt = 0;
						
						if(!isNaN(parseFloat(output.urineamt))){
							urineamt = parseFloat(output.urineamt)
						}

						if(!isNaN(parseFloat(output.vomitamt))){
							vomitamt = parseFloat(output.vomitamt)
						}

						if(!isNaN(parseFloat(output.bloodamt))){
							bloodamt = parseFloat(output.bloodamt)
						}

						if(!isNaN(parseFloat(output.diaper))){
							diaper = parseFloat(output.diaper)
						}

						if(!isNaN(parseFloat(output.otheramt))){
							otheramt = parseFloat(output.otheramt)
						}

						resultArr.push({
							date: output.date,
							balance: ((urineamt + vomitamt + bloodamt + diaper + otheramt) * -1)
						});
					});
					console.log(resultArr)

					function createObject(newObj) {
						var o = {}
						var result = newObj.reduce(function(r, e) {
						var key = e.date
						if (!o[key]) {
							o[key] = e;
							r.push(o[key]);
						} else {
							o[key].balance += e.balance;
						}
						return r;
						}, []);
						return result;
					};


					function subtractOutput(newObj) {

						var o = {};

						for(let i = 0; i < newObj.length; i++){

							let key = newObj[i].date;
							let value = newObj[i].balance;

							console.log(key, value);
							if(o[key] == undefined){
								o[key] = value;
							}
							else{
								o[key] += value
							}
						}
						return o;
					};

					function convertToArr(newObj) {
						var balance = [];
						console.log(newObj);

						for (var key in newObj) {
							var tmpObj = {};
							tmpObj["date"] = key;
							tmpObj["balance"] = newObj[key];

							balance.push(tmpObj)
						}
						return balance;
					};

					var finalDict = subtractOutput(resultArr);
					var dailyBalance = convertToArr(finalDict);
					
					function comparer(otherArray){
						return function(current){
							return otherArray.filter(function(other){
							return other.date == current.date && other.balance == current.balance
							}).length == 0;
						}
					}
						
					var outputArr = resultArr.filter(comparer(inputArr));

					// const convertToObj = (docArr) => {
					// 	const tempArray = [];
					// 	if (docArr.length !== 0){
					// 		for(let i = 0; i< docArr.length; i++){
					// 			try{
					// 			tempArray.push(docArr[i].toObject())
					// 			}
					// 			catch{
					// 				tempArray.push(docArr[i]);
					// 			}
					// 		}
					// 	}
					// 	return tempArray;
					// };

					res.render('charts/master/charts-io', {
						iodateVal: iosample,
						dailyBalance,
						inputArr,
						outputArr,
						ioFlow: ioFlow,
						enteralFlow: enteralFlow,
						ivFlow: ivFlow,
						outputFlow: outputFlow,
						newIO: newIO,
						newenteral: newenteral,
						newiv: newiv,
						newoutput: newoutput,
						patient: req.session.patient,
						showMenu: true
					})
				})
			})
		});
	})
})

// open route to IO page
// router.get('/io', ensureAuthenticated, ensureAuthorised, (req, res) => {
// 	MasterIO.find({ patientID: req.session.patient.patientID }).then(newIO => {
// 		MasterEnteral.find({ patientID: req.session.patient.patientID }).then(newenteral => {
// 			MasterIV.find({ patientID: req.session.patient.patientID }).then(newiv => {	
// 				MasterOutput.find({ patientID: req.session.patient.patientID }).then(newoutput => {			
		
		
// 		res.render('charts/master/charts-io', {
// 		newIO: newIO,
// 		newenteral: newenteral,
// 		newiv: newiv,
// 		newoutput: newoutput,
// 		patient: req.session.patient,
// 		showMenu: true

// 						})
// 					})
// 				})
// 			});
// 		})
// 	})


//add io info
router.post('/add-io', ensureAuthenticated, ensureAuthorised, (req, res) => {
	ioID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateIO, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeIO;
	
	new MasterIO({
		patientID: req.session.patient.patientID,
		ioID: ioID,
		date:	moment(req.body.dateIO, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeIO,
		datetime: datetime,
		intakefood: req.body.intakefood,
		foodtype: req.body.foodtype,
		foodportion: req.body.foodportion,
		fluidtype: req.body.fluidtype,
		fluidportion: req.body.fluidportion,

	}).save();

	res.redirect('/master/io');
})

//Delete IO information
router.delete('/del-io/:ioID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterIO.deleteOne({ioID: req.params.ioID}, function(err) {
		if (err) {
			console.log('cannot delete ipo details');
		}
	});
	res.redirect('/master/io');
})

//edit IO informations
router.put('/edit-io/:ioID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateIO, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeIO;

	MasterIO.findOne({ ioID: req.params.ioID }).then(editIO => {
		editIO.date = moment(req.body.dateIO, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editIO.time = req.body.timeIO,
		editIO.datetime = datetime,
		editIO.intakefood = req.body.intakefood,
		editIO.foodtype = req.body.foodtype,
		editIO.foodportion = req.body.foodportion,
		editIO.fluidtype = req.body.fluidtype,
		editIO.fluidportion = req.body.fluidportion,

		editIO.save();
	});
	res.redirect('/master/io');
})

//get single io info
router.get('/io/:ioID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterIO.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newIO => {
		MasterIO.findOne({ ioID: req.params.ioID }).then(editIO => {

			editIO.date = moment(editIO.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-io', {
				newIO: newIO,
				editIO: editIO,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})

//Get single output info
router.get('/output/:outputID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterOutput.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newoutput => {
		MasterOutput.findOne({ outputID: req.params.outputID }).then(editoutput => {

			//Changes date format to DD/MM/YYYY
			editoutput.date = moment(editoutput.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-io', {
				newoutput: newoutput,
				editoutput: editoutput,
				patient: req.session.patient,
				showMenu: true	
      		})
    	})
  	})
})

//add output info
router.post('/add-output', ensureAuthenticated, ensureAuthorised, (req, res) => {
	outputID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateoutput, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeoutput;


	new MasterOutput({
		patientID: req.session.patient.patientID,
		outputID: outputID,
		date: moment(req.body.dateoutput, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeoutput,
		datetime: datetime,
		urineamt: req.body.urineamt,
		urineass: req.body.urineass,
		stoolamt: req.body.stoolamt,
		stoolass: req.body.stoolass,
		vomitamt: req.body.vomitamt,
		vomitass: req.body.vomitass,
		bloodamt: req.body.bloodamt,
		diaper: req.body.diaper,
		otheramt: req.body.otheramt,
		otherass: req.body.otherass,

	}).save();

	res.redirect('/master/io');
})

//Delete output information
router.delete('/del-output/:outputID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterOutput.deleteOne({outputID: req.params.outputID}, function(err) {
		if (err) {
			console.log('cannot delete Output details');
		}
	});
	res.redirect('/master/io');
})

//open route to braden page
router.get('/braden', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterBraden.find({ patientID: req.session.patient.patientID}).then(newBraden => {
		res.render('charts/master/charts-braden', {
			newBraden: newBraden,
			patient: req.session.patient,
			showMenu: true	
		})
  	})
})

//get single braden info
router.get('/braden/:bradenID', ensureAuthenticated, ensureAuthorised, (req, res) => {

	MasterBraden.find({ patientID: req.session.patient.patientID }).then(newBraden => {
		MasterBraden.findOne({ bradenID: req.params.bradenID }).then(editBraden => {
			res.render('charts/master/charts-braden', {
				newBraden: newBraden,
				editBraden: editBraden,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})

//add braden info
router.post('/add-braden', ensureAuthenticated, ensureAuthorised, (req, res) => {
		bradenID = (new standardID('AAA0000')).generate();
		datetime = moment(req.body.dateBraden, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

		total = parseInt(req.body.sensePerc.slice(-1)) 
		+ parseInt(req.body.moisture.slice(-1)) 
		+ parseInt(req.body.activity.slice(-1))
		+ parseInt(req.body.mobility.slice(-1)) 
		+ parseInt(req.body.nutrition.slice(-1)) 
		+ parseInt(req.body.fns.slice(-1));

		splitSensePerc = removeNumber.removeNumberFunction(req.body.sensePerc);
		splitMoisture = removeNumber.removeNumberFunction(req.body.moisture);
		splitActivity = removeNumber.removeNumberFunction(req.body.activity);
		splitMobility = removeNumber.removeNumberFunction(req.body.mobility);
		splitNutrition = removeNumber.removeNumberFunction(req.body.nutrition);
		splitFns = removeNumber.removeNumberFunction(req.body.fns);


		new MasterBraden({
			patientID: req.session.patient.patientID,
			bradenID: bradenID,
			date: req.body.dateBraden,
			datetime: datetime,
			sensePercSplit: splitSensePerc,
			moistureSplit: splitMoisture,
			activitySplit: splitActivity,
			mobilitySplit: splitMobility,
			nutritionSplit: splitNutrition,
			fnsSplit: splitFns,
			total: total,

			sensePerc: req.body.sensePerc,
			activity:	req.body.activity,
			moisture: req.body.moisture,
			mobility: req.body.mobility,
			nutrition: req.body.nutrition,
			fns: req.body.fns,

			


		}).save();
	
		res.redirect('/master/braden');
})

//Delete braden information
router.delete('/del-braden/:bradenID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterBraden.deleteOne({bradenID: req.params.bradenID}, function(err) {
		if (err) {
			console.log("cannot delete braden record");
		}
	});
	res.redirect('/master/braden');
})

//Edit braden information
router.put('/edit-braden/:bradenID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateBraden, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";
	total = parseInt(req.body.sensePerc.slice(-1)) + parseInt(req.body.moisture.slice(-1)) + parseInt(req.body.activity.slice(-1))+ parseInt(req.body.mobility.slice(-1)) 
		+ parseInt(req.body.nutrition.slice(-1)) + parseInt(req.body.fns.slice(-1));

	splitSensePerc = removeNumber.removeNumberFunction(req.body.sensePerc);
	splitMoisture = removeNumber.removeNumberFunction(req.body.moisture);
	splitActivity = removeNumber.removeNumberFunction(req.body.activity);
	splitMobility = removeNumber.removeNumberFunction(req.body.mobility);
	splitNutrition = removeNumber.removeNumberFunction(req.body.nutrition);
	splitFns = removeNumber.removeNumberFunction(req.body.fns);

	MasterBraden.findOne({ bradenID: req.params.bradenID }).then(editBraden => {
		editBraden.sensePercSplit = splitSensePerc,
		editBraden.moistureSplit = splitMoisture,
		editBraden.activitySplit = splitActivity,
		editBraden.mobilitySplit = splitMobility,
		editBraden.nutritionSplit = splitNutrition,
		editBraden.fnsSplit = splitFns,

		editBraden.date = req.body.dateBraden,
		editBraden.datetime = datetime,
		editBraden.sensePerc = req.body.sensePerc,
		editBraden.moisture = req.body.moisture,
		editBraden.activity = req.body.activity,
		editBraden.mobility = req.body.mobility,
		editBraden.nutrition = req.body.nutrition,
		editBraden.fns = req.body.fns,
		editBraden.total = total,

		editBraden.save();
	});
	res.redirect('/master/braden');
})

// Open HistoryTakng page
router.get('/HistoryTaking', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterHistory.find({user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newHistory => {//(other record)
		MasterHistory.findOne({ patientID: req.session.patient.patientID})
		.then(newOtherHistory =>{ //(your own record)

			MasterHistory.findOne({patientID: req.session.patient.patientID})
			.then(editHistory => {
			// if(editHistory == null){
			// 	res.render('HistoryTaking/master/add_HistoryTaking', {
			// 		newHistory: newHistory,
			// 		editHistory: editHistory,
			// 		patient: req.session.patient,
			// 		currentName: req.user.firstName,
			// 		//newOtherHistory:newOtherHistory,
			// 		showMenu: true
			// 	});
			//}
			// else
			// {
				res.render('HistoryTaking/master/add_HistoryTaking', {
					newHistory: newHistory,
					editHistory: editHistory,
					checkifEmpty: true,
					patient: req.session.patient,
					currentName: req.user.firstName,
					newOtherHistory: newOtherHistory,
					showMenu: true
				});
			//}
			})
		})
	})
})

//Add HistoryTaking
router.post('/add-history', ensureAuthenticated, ensureAuthorised, (req, res) => {
	historyId = (new standardID('AAA0000')).generate();
	new MasterHistory({
		user: req.user.id,
		by: req.user.firstName,
		masterpatientID: req.session.patient.patientID,
		patientID: req.session.patient.patientID,
		chiefComp: req.body.chiefComp,
		historyPresent: req.body.historyPresent,
		allergy: req.body.allergy,
		medicalH: req.body.medicalH,
		surgicalH: req.body.surgicalH,
		familyH: req.body.familyH,
		socialH: req.body.socialH,
		travelH: req.body.travelH,
		historyId: historyId
	}).save();
		res.redirect('/master/HistoryTaking');
})

	
//One HistoryTaking by ID
router.get('/HistoryTaking/:historyId/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	MasterHistory.find({ user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID}).then(newHistory => {
		MasterHistory.findOne({ patientID: req.session.patient.patientID})
		.then(newOtherHistory =>{//(your own record) you need this (if you only put in the /HistoryTaking, this route do not know the newOtherHistory)
			MasterHistory.findOne({ historyId: req.params.historyId }).then(editHistory =>{		
				var name = req.params.name;
				res.render('HistoryTaking/master/add_HistoryTaking',{
					newHistory: newHistory,
					editHistory: editHistory,
					patient: req.session.patient,
					checkifEmpty: false,
					currentName: req.user.firstName,
					newOtherHistory: newOtherHistory,	
					by: name,
					showMenu: true
				})
			});
		});
	})
})

//Edit the HistoryTaking
router.put('/edit-history/:historyId/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	MasterHistory.findOne({ patientID:  req.session.patient.patientID,historyId: req.params.historyId}).then(editHistory => {
		editHistory.chiefComp = req.body.chiefComp,
		editHistory.historyPresent = req.body.historyPresent,
		editHistory.allergy = req.body.allergy,
		editHistory.medicalH = req.body.medicalH,
		editHistory.surgicalH = req.body.surgicalH,
		editHistory.masterpatientID = req.session.patient.patientID,
		editHistory.patientID = req.session.patient.patientID,
		editHistory.familyH = req.body.familyH,
		editHistory.socialH = req.body.socialH,
		editHistory.travelH = req.body.travelH

		editHistory.save();
	});
	res.redirect("/master/HistoryTaking");
})

//open fall page
router.get('/fall', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterFall.find({ patientID: req.session.patient.patientID }).then(newFall => {
		res.render('charts/master/charts-fall', {
			newFall: newFall,
			patient: req.session.patient,
			showMenu: true
		})
	})
})


//get single fall info
router.get('/fall/:fallID', ensureAuthenticated, ensureAuthorised, (req, res) => {

	MasterFall.find({ patientID: req.session.patient.patientID }).then(newFall => {
		MasterFall.findOne({ fallID: req.params.fallID }).then(editFall => {
			res.render('charts/master/charts-fall', {
				newFall: newFall,
				editFall: editFall,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})


//add fall info
router.post('/add-fall', ensureAuthenticated, ensureAuthorised, (req, res) => {
	fallid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateFall, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

	totalmf = parseInt(req.body.history.slice(-2))
	+ parseInt(req.body.secondary.slice(-2)) 
	+ parseInt(req.body.ambu.slice(-2))
	+ parseInt(req.body.ivhl.slice(-2)) 
	+ parseInt(req.body.gait.slice(-2)) 
	+ parseInt(req.body.mental.slice(-2));
	//splitting to display only the sting value w/o (+0)
	splitHistory = removeNumber.removeNumberFunction(req.body.history);
	splitSecondary = removeNumber.removeNumberFunction(req.body.secondary);	
	splitAmbu = removeNumber.removeNumberFunction(req.body.ambu);
	splitIvhl = removeNumber.removeNumberFunction(req.body.ivhl);
	splitGait = removeNumber.removeNumberFunction(req.body.gait);
	splitMental = removeNumber.removeNumberFunction(req.body.mental);
	
	new MasterFall({
		patientID: req.session.patient.patientID,
		fallID: fallid,
		date: req.body.dateFall,
		datetime: datetime,

		history: req.body.history,
		secondary: req.body.secondary,
		ivhl: req.body.ivhl,
		gait: req.body.gait,
		mental: req.body.mental,
		ambu: req.body.ambu,
		
		historySplit: splitHistory,
		secondarySplit: splitSecondary,
		ambuSplit: splitAmbu,
		ivhlSplit: splitIvhl,
		gaitSplit: splitGait,
		mentalSplit: splitMental,


		totalmf: totalmf,


	}).save();

	res.redirect('/master/fall');
})
//Remove function
var removeNumber = {
    removeNumberFunction: function(str) {
		var i;
		var text = "";
        var res = str.split(" ");
		for (i = 0; i < res.length; i++) {
			
			if (!(res[i] == "+" || isNaN(res[i]) == false || res[i].charAt(0) == "+")){
			text += res[i] + " ";
			}
		}
		
		return text;
    }
};

//Delete fall information
router.delete('/del-fall/:fallID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterFall.deleteOne({fallID: req.params.fallID}, function(err) {
		if (err) {
			console.log("cannot delete morse fall record");
		}
	});
	res.redirect('/master/fall');
})

//Edit fall information
router.put('/edit-fall/:fallID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateFall, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

		totalmf = parseInt(req.body.history.slice(-2))
		+ parseInt(req.body.secondary.slice(-2)) 
		+ parseInt(req.body.ambu.slice(-2))
		+ parseInt(req.body.ivhl.slice(-2)) 
		+ parseInt(req.body.gait.slice(-2)) 
		+ parseInt(req.body.mental.slice(-2));

		splitHistory = removeNumber.removeNumberFunction(req.body.history);
		splitSecondary = removeNumber.removeNumberFunction(req.body.secondary);	
		splitAmbu = removeNumber.removeNumberFunction(req.body.ambu);
		splitIvhl = removeNumber.removeNumberFunction(req.body.ivhl);
		splitGait = removeNumber.removeNumberFunction(req.body.gait);
		splitMental = removeNumber.removeNumberFunction(req.body.mental);

		MasterFall.findOne({ fallID: req.params.fallID }).then(editFall => {
			editFall.date = req.body.dateFall,
			editFall.datetime = datetime,
			editFall.history = req.body.history,
			editFall.secondary = req.body.secondary,
			editFall.ambu = req.body.ambu,
			editFall.ivhl = req.body.ivhl,
			editFall.gait = req.body.gait,
			editFall.mental = req.body.mental,

			editFall.historySplit = splitHistory,
			editFall.secondarySplit = splitSecondary,
			editFall.ambuSplit = splitAmbu,
			editFall.ivhlSplit = splitIvhl,
			editFall.gaitSplit = splitGait,
			editFall.mentalSplit = splitMental,

			editFall.totalmf = totalmf
		
			editFall.save();
	});
	res.redirect('/master/fall');
})

//Edit output info
router.put('/edit-output/:outputID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateoutput, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeoutput;

	MasterOutput.findOne({ outputID: req.params.outputID }).then(editoutput => {

		editoutput.date = moment(req.body.dateoutput, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editoutput.time = req.body.timeoutput,
		editoutput.datetime = datetime,
		editoutput.urineamt = req.body.urineamt,
		editoutput.urineass = req.body.urineass,
		editoutput.stoolamt = req.body.stoolamt,
		editoutput.stoolass = req.body.stoolass,
		editoutput.vomitamt = req.body.vomitamt,
		editoutput.vomitass = req.body.vomitass,
		editoutput.bloodamt = req.body.bloodamt,
		editoutput.diaper = req.body.diaper,
		editoutput.otheramt = req.body.otheramt,
		editoutput.otherass = req.body.otherass,


		editoutput.save();
	})
	res.redirect('/master/io');
})

//Get single enteral info
router.get('/enteral/:enteralID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterEnteral.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newenteral => {
		MasterEnteral.findOne({ enteralID: req.params.enteralID }).then(editenteral => {

			//Changes date format to DD/MM/YYYY
			editenteral.date = moment(editenteral.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-io', {
				newenteral: newenteral,
				editenteral: editenteral,
      		})
    	})
  	})
})

//add enteral info
router.post('/add-enteral', ensureAuthenticated, ensureAuthorised, (req, res) => {
	enteralID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateenteral, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeenteral;


	new MasterEnteral({
		patientID: req.session.patient.patientID,
		enteralID: enteralID,
		date: moment(req.body.dateenteral, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeenteral,
		datetime: datetime,
		enteralfeed: req.body.enteralfeed,
		formula: req.body.formula,
		feedamt: req.body.feedamt,
		flush: req.body.flush,

	}).save();

	res.redirect('/master/io');
})

//Delete Enteral information
router.delete('/del-enteral/:enteralID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterEnteral.deleteOne({enteralID: req.params.enteralID}, function(err) {
		if (err) {
			console.log('cannot delete Enteral details');
		}
	});
	res.redirect('/master/io');
})

//Edit Enteral info
router.put('/edit-enteral/:enteralID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateenteral, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeenteral;

	MasterEnteral.findOne({ enteralID: req.params.enteralID }).then(editenteral => {
		editenteral.date = moment(req.body.dateenteral, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editenteral.time = req.body.timeenteral,
		editenteral.datetime = datetime,
		editenteral.enteralfeed = req.body.enteralfeed,
		editenteral.formula = req.body.formula,
		editenteral.feedamt = req.body.feedamt,
		editenteral.flush = req.body.flush,

		editenteral.save();
	})
	res.redirect('/master/io');
})

//Get single iv info
router.get('/iv/:ivID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterIV.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newiv => {
		MasterIV.findOne({ ivID: req.params.ivID }).then(editiv => {

			//Changes date format to DD/MM/YYYY
			editiv.date = moment(editiv.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-io', {
				newiv: newiv,
				editiv: editiv,
      		})
    	})
  	})
})

//add iv info
router.post('/add-iv', ensureAuthenticated, ensureAuthorised, (req, res) => {
	ivID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateiv, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeiv;


	new MasterIV({
		patientID: req.session.patient.patientID,
		ivID: ivID,
		date: moment(req.body.dateiv, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeiv,
		datetime: datetime,
		coninf: req.body.coninf,
		conamt: req.body.conamt,
		intinf: req.body.intinf,
		amtinf: req.body.amtinf,
		ivflush: req.body.ivflush,

	}).save();

	res.redirect('/master/io');
})

//Delete iv information
router.delete('/del-iv/:ivID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterIV.deleteOne({ivID: req.params.ivID}, function(err) {
		if (err) {
			console.log('cannot delete IV details');
		}
	});
	res.redirect('/master/io');
})

//Edit IV info
router.put('/edit-iv/:ivID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateiv, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeiv;

	MasterIV.findOne({ ivID: req.params.ivID }).then(editiv => {

		editiv.datetime = datetime,
		editiv.date = moment(req.body.dateiv, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editiv.time = req.body.timeiv,
		editiv.coninf = req.body.coninf,
		editiv.conamt = req.body.conamt,
		editiv.intinf = req.body.intinf,
		editiv.amtinf = req.body.amtinf,
		editiv.ivflush = req.body.ivflush,


		editiv.save();
	})
	res.redirect('/master/io');
})

//Updates chart according to date specified
router.get('/chart/update', ensureAuthenticated, ensureAuthorised, (req, res) => {
	var fromDate = req.query.fromDate;
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var today = yyyy + '-' + mm + '-' + dd;

	//Check for fromDate value
	if (req.query.fromDate == "" || req.query.fromDate == null) {
		var fromDate = req.query.fromDate;
	} else {
		var fromDate = moment(req.query.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
	}

	//Check for toDate value
	if (req.query.toDate == "" || req.query.toDate == null) {
		var toDate = today;
	} else {
		var toDate = moment(req.query.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
	}

	MasterVital.find({ date: { $gte: fromDate, $lte: toDate }, patientID: req.session.patient.patientID }, {datetime: 1, temp: 1, sbp: 1, dbp: 1, resp: 1, heartRate: 1,  _id: 0})
		.sort({"datetime": 1}).then(vitalInfo => {
			MasterPain.find({ date: { $gte: fromDate, $lte: toDate }, patientID: req.session.patient.patientID }, {datetime: 1, painScore: 1, _id: 0})
				.sort({"datetime": 1}).then(painInfo => {
					MasterOxygen.find({ date: { $gte: fromDate, $lte: toDate }, patientID: req.session.patient.patientID }, {datetime: 1, spo2: 1, _id: 0})
						.sort({"datetime": 1}).then(o2Info => {
						res.send({vital: vitalInfo, pain: painInfo, oxygen: o2Info});
			})
		})
	})
})

//View chart (temperature, heart rate/oxygen, and blood pressure only for now)
router.get('/chart', ensureAuthenticated, ensureAuthorised, (req, res) => {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var today = yyyy + '-' + mm + '-' + dd;
	
	MasterVital.find({ date: { $gte: "", $lte: today }, patientID: req.session.patient.patientID })
		.sort({"datetime": 1}).then(info => {
			MasterPain.find({ date: {$gte: "", $lte: today }, patientID: req.session.patient.patientID })
			.sort({"datetime": 1}).then(painInfo => {
				MasterOxygen.find({date: { $gte: "", $lte: today }, patientID: req.session.patient.patientID })
				.sort({"datetime": 1}).then(oxyInfo => {
					res.render('charts/master/charts', {
						oxyVal: oxyInfo,
						painVal: painInfo,
						chartVal: info,
						patient: req.session.patient,
						showMenu: true
				})
			});
		})
	})
})

//Vital chart information
router.get('/vital', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterVital.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(vitalData => {
		MasterPain.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(painData => {
			MasterOxygen.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(oxyData => {
				MasterWH.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(whData => {

					sample = [];
					sampleDate = [];
					let vitalFlow = Object.assign([], vitalData);
					let painFlow = Object.assign([], painData);
					let oxyFlow = Object.assign([], oxyData);
					let whFlow = Object.assign([], whData);
					vitalCount = -1;
					painCount = -1;
					oxyCount = -1;
					whCount = 0;
					colCount = 0;
					noRecord = 'No existing record';

					vitalData.forEach(vital => {
						if (!(sample.includes(vital.datetime))) {
							sample.push(vital.datetime);
							sampleDate.push(vital.date);
						}
					});
					
					painData.forEach(pain => {
						if (!(sample.includes(pain.datetime))) {
							sample.push(pain.datetime);
							sampleDate.push(pain.date);
						}
					});
	
					oxyData.forEach(oxy => {
						if (!(sample.includes(oxy.datetime))) {
							sample.push(oxy.datetime);
							sampleDate.push(oxy.date);
						}
					});

					// whData.forEach(wh => {
					// 	if (!(sample.includes(wh.datetime))) {
					// 		sample.push(wh.datetime);
					// 		sampleDate.push(wh.date);
					// 	}
					// })

					sample.sort();
					sampleDate.sort();

					for (i = 0; i < sample.length; i++) {
	
						//Counter for empty data
						//.length here refers to last index of the array
						if (vitalCount !== (vitalFlow.length - 1)) {
							vitalCount++;
						}
						if (painCount !== (painFlow.length - 1)) {
							painCount++;
						}
						if (oxyCount !== (oxyFlow.length - 1)) {
							oxyCount++;
						}
	
						//Insert empty data when value doesnt match
						//Count here does the index count of flow array
						if (vitalFlow != '') {
							if (sample[i] < vitalFlow[vitalCount].datetime) {
								vitalFlow.splice(vitalCount, 0, {datetime: ''});
							} else if (sample[i] > vitalFlow[vitalCount].datetime) {
								vitalFlow.splice(vitalCount + 1, 0, {datetime: ''});
							}
						} else {
							vitalFlow.push({datetime: '', bPressure: noRecord});
						}
						
						if (painFlow != '') {
							if (sample[i] < painFlow[painCount].datetime) {
								painFlow.splice(painCount, 0, {datetime: ''});
							} else if (sample[i] > painFlow[painCount].datetime) {
								painFlow.splice(painCount + 1, 0, {datetime: ''});
							}
						} else {
							painFlow.push({datetime: '', characteristics: noRecord});
						}
	
						if (oxyFlow != '') {
							if (sample[i] < oxyFlow[oxyCount].datetime) {
								oxyFlow.splice(oxyCount, 0, {datetime: ''});
							} else if (sample[i] > oxyFlow[oxyCount].datetime) {
								oxyFlow.splice(oxyCount + 1, 0, {datetime: ''});
							}
						} else {
							oxyFlow.push({datetime: '', o2Amt: noRecord});
						}

						if (whFlow != '') {

							//Does the colspan counter for weight and height
							if (sampleDate[i] != whFlow[whCount].date) {	//If dont match
								colCount++;
								if (whFlow[whCount].date != '') {	//If current index is not empty
									whFlow.splice(whCount, 0, {date: ''});	//Adds empty date in current index
									// console.log('1', sampleDate[i+1], whFlow[whCount]);
									if (sampleDate[i+1] == whFlow[whCount + 1].date) { //If the next index matches the next i
										whCount++;
										colCount--;
									}
								} else if (whFlow[whCount + 1] == null) {	//So it doesn't give an error when it's null
								console.log('ensures that no error happens when whCount+1 is null');
							}
							else if (sampleDate[i+1] == whFlow[whCount + 1].date) {	//If the next index matches next i
								whFlow[whCount].colspan = colCount//Inserts colspan in current index
								whCount++;	//Moves to the next index
								colCount = 0;	//Resets column count to 0
							}
						} else { //If current whcount matches current i
							colCount++;	//Adds column count by 1
							if (sampleDate[i+1] != whFlow[whCount].date) {	//If the next index does not match current i
								whFlow[whCount].colspan = colCount;	//Inserts colspan in current index
								whCount++;	//Moves to the next index
								colCount = 0;	//Resets column count to 0 
								if (whFlow[whCount] == null) {	//If the current index is null
									whFlow.splice(whCount, 0, {date: ''});	//Adds empty date when it is null
								}
							}
						}
						whFlow[whCount].colspan = colCount;
						} else {
							whFlow.push({date: '', heightEst: noRecord});
						}
					};
					
					res.render('charts/master/charts-vital', {
						dateVal: sample,
						vitalFlow: vitalFlow,
						painFlow: painFlow,
						oxyFlow: oxyFlow,
						whFlow: whFlow,
						newVital: vitalData,
						painData: painData,
						oxyData: oxyData,
						whData: whData,
						patient: req.session.patient,
						showMenu: true
					})
				})
			})
		});
	})
})


//Get single vital information
router.get('/vital/:vitalID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterVital.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newVital => {
		MasterVital.findOne({ vitalID: req.params.vitalID }).then(editVital => {

			//Changes date format to DD/MM/YYYY
			editVital.date = moment(editVital.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-vital', {
				newVital: newVital,
				editVital: editVital,
				patient: req.session.patient,
				showMenu: true
			})
		})
	})
})

//Add vital information
router.post('/add-vital', ensureAuthenticated, ensureAuthorised, (req, res) => {
	vitalid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateVital, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeVital;
	bPressure = req.body.sbp + "/" + req.body.dbp;
	abPressure = req.body.sbpArterial + "/" + req.body.dbpArterial;

	new MasterVital({
		patientID: req.session.patient.patientID,
		vitalID: vitalid,
		userID: req.user.id,
		date: moment(req.body.dateVital, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeVital,
		datetime: datetime,
		temp: req.body.temp,
		tempRoute: req.body.tempRoute,
		heartRate: req.body.heartRate,
		resp: req.body.resp,
		sbp: req.body.sbp,
		dbp: req.body.dbp,
		sbpArterial: req.body.sbpArterial,
		dbpArterial: req.body.dbpArterial,
		bPressure: bPressure,
		arterialBP: abPressure,
		bpLocation: req.body.bpLocation,
		bpMethod: req.body.bpMethod,
		patientPosition: req.body.patientPosition,
		userType: req.user.userType
	}).save();

	res.redirect('/master/vital');
})

//Edit vital information
router.put('/edit-vital/:vitalID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateVital, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeVital;
	bPressure = req.body.sbp + "/" + req.body.dbp;
	abPressure = req.body.sbpArterial + "/" + req.body.dbpArterial;

	MasterVital.findOne({ vitalID: req.params.vitalID }).then(editVital => {
		editVital.date = moment(req.body.dateVital, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editVital.time = req.body.timeVital,
		editVital.datetime = datetime,
		editVital.temp = req.body.temp,
		editVital.tempRoute = req.body.tempRoute,
		editVital.heartRate = req.body.heartRate,
		editVital.resp = req.body.resp,
		editVital.sbp = req.body.sbp,
		editVital.dbp = req.body.dbp,
		editVital.sbpArterial = req.body.sbpArterial,
		editVital.dbpArterial = req.body.dbpArterial,
		editVital.bPressure = bPressure,
		editVital.arterialBP = abPressure,
		editVital.bpLocation = req.body.bpLocation,
		editVital.bpMethod = req.body.bpMethod,
		editVital.patientPosition = req.body.patientPosition

		editVital.save();
	});
	res.redirect('/master/vital');
})

//Delete vital information
router.delete('/del-vitals/:vitalID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterVital.deleteOne({vitalID: req.params.vitalID}, function(err) {
		if (err) {
			console.log('cannot delete vitals');
		}
	});
	res.redirect('/master/vital');
})

//Get single pain info
router.get('/pain/:painID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterPain.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(painData => {
		MasterPain.findOne({ painID: req.params.painID }).then(editPain => {
			//Changes date format to DD/MM/YYYY
			editPain.date = moment(editPain.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-vital', {
				painData: painData,
				editPain: editPain,
				patient: req.session.patient,
				showMenu: true
			})
		})
	})
})


//Add pain information
router.post('/add-pain', ensureAuthenticated, ensureAuthorised, (req, res) => {
	painid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.datePain, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timePain;

	new MasterPain({
		patientID: req.session.patient.patientID,
		painID: painid,
		userType: req.user.userType,
		datetime: datetime,
		date: moment(req.body.datePain, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timePain,
		painScale: req.body.painScale,
		painScore: req.body.painScore,
		onset: req.body.onset,
		location: req.body.location,
		duration: req.body.duration,
		characteristics: req.body.characteristics,
		associatedSymp: req.body.associatedSymp,
		aggravatingFact: req.body.aggravatingFact,
		relievingFact: req.body.relievingFact,
		painIntervene: req.body.painIntervene,
		responseIntervene: req.body.responseIntervene,
		siteofpain: req.body.siteofpain
	}).save();

	res.redirect('/master/vital');

})

//Edit pain info
router.put('/edit-pain/:painID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.datePain, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timePain;

	MasterPain.findOne({ painID: req.params.painID }).then(editPain => {
		editPain.datetime = datetime,
		editPain.date = moment(req.body.datePain, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editPain.time = req.body.timePain,
		editPain.painScale = req.body.painScale,
		editPain.painScore = req.body.painScore,
		editPain.onset = req.body.onset,
		editPain.location = req.body.location,
		editPain.duration = req.body.duration,
		editPain.characteristics = req.body.characteristics,
		editPain.associatedSymp = req.body.associatedSymp,
		editPain.aggravatingFact = req.body.aggravatingFact,
		editPain.relievingFact = req.body.relievingFact,
		editPain.painIntervene = req.body.painIntervene,
		editPain.responseIntervene = req.body.responseIntervene,
		editPain.siteofpain = req.body.siteofpain

		editPain.save();
	})
	res.redirect('/master/vital');
})

//Delete pain info
router.delete('/del-pain/:painID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterPain.deleteOne({ painID: req.params.painID }, function(err) {
		if(err) {
			console.log('cannot delete pain info');
		}
	})
	res.redirect('/master/vital');
})

//Get single oxygen information
router.get('/oxygen/:oxygenID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterOxygen.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(oxyData => {
		MasterOxygen.findOne({ oxygenID: req.params.oxygenID }).then(editOxy => {

			//Changes date format to DD/MM/YYYY
			editOxy.date = moment(editOxy.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-vital', {
				oxyData: oxyData,
				editOxy: editOxy,
				patient: req.session.patient,
				showMenu: true
			})
		})
	})
})

//Add oxygen information
router.post('/add-oxygen', ensureAuthenticated, ensureAuthorised, (req, res) => {
	oxygenid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateOxy, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeDischargePlanning;

	new MasterOxygen({
		patientID: req.session.patient.patientID,
		oxygenID: oxygenid,
		userType: req.user.userType,
		datetime: datetime,
		date: moment(req.body.dateOxy, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeOxy,
		o2Device: req.body.oxyDevice,
		humidifier: req.body.humidifier,
		o2Amt: req.body.oxyAmt,
		fio2: req.body.fiOxy,
		spo2: req.body.spOxy
	}).save();

	res.redirect('/master/vital');
})

//Update oxygen information
router.put('/edit-oxygen/:oxygenID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateOxy, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeOxy;

	MasterOxygen.findOne({ oxygenID: req.params.oxygenID }).then(editOxy => {
		editOxy.datetime = datetime,
		editOxy.date = moment(req.body.dateOxy, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editOxy.time = req.body.timeOxy,
		editOxy.o2Device = req.body.oxyDevice,
		editOxy.humidifier = req.body.humidifier,
		editOxy.o2Amt = req.body.oxyAmt,
		editOxy.fio2 = req.body.fiOxy,
		editOxy.spo2 = req.body.spOxy

		editOxy.save();
	})
	res.redirect('/master/vital');
})

//Delete oxygen information
router.delete('/del-oxygen/:oxygenID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterOxygen.deleteOne({ oxygenID: req.params.oxygenID }, function(err) {
		if(err) {
			console.log('cannot delete oxygen information');
		}
	});
	res.redirect('/master/vital');
})

//Get single weight & height information
router.get('/wh/:whID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterWH.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(whData => {
		MasterWH.findOne({ whID: req.params.whID }).then(editWh => {

			//Changes date format to DD/MM/YYYY
			editWh.date = moment(editWh.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-vital', {
				whData: whData,
				editWh: editWh,
				patient: req.session.patient,
				showMenu: true
			})
		})
	})
})

       
//Add weight & height information
router.post('/add-wh', ensureAuthenticated, ensureAuthorised, (req, res) => {
	whid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateWh, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeWh;

	new MasterWH({
		patientID: req.session.patient.patientID,
		whID: whid,
		userType: req.user.userType,
		datetime: datetime,
		date: moment(req.body.dateWh, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeWh,
		height: req.body.height,
		heightEst: req.body.heightEst,
		weight: req.body.weight,
		weightEst: req.body.weightEst,
		bsa: req.body.bsa,
		bmi: req.body.bmi
	}).save();

	res.redirect('/master/vital');
})

//Edit weight & height information
router.put('/edit-wh/:whID', ensureAuthenticated, ensureAuthorised, (req, res) => {

	datetime = moment(req.body.dateWh, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeWh;

	MasterWH.findOne({ whID: req.params.whID }).then(editWH => {
		editWH.datetime = datetime,
		editWH.date = moment(req.body.dateWh, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editWH.time = req.body.timeWh,
		editWH.height = req.body.height,
		editWH.heightEst = req.body.heightEst,
		editWH.weight = req.body.weight,
		editWH.weightEst = req.body.weightEst,
		editWH.bsa = req.body.bsa,
		editWH.bmi = req.body.bmi

		editWH.save();
	})
	res.redirect('/master/vital');
})

//Delete weight & height information
router.delete('/del-wh/:whID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterWH.deleteOne({ whID: req.params.whID }, function(err) {
		if (err) {
			console.log('cannot delete weight & height information');
		}
	})
	res.redirect('/master/vital');
})

//Picture upload settings
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/assets/img/upload/')
	},
	filename: function (req, file, cb) {
		var ext = file.mimetype.split('/')[1];
		// console.log('file settings: ', file);
		cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
	}
})

//Ensures only picture format can be uploaded
var fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

//Declare upload with settings for picture upload
var upload = multer({ storage: storage, fileFilter: fileFilter });

//Starting route for doctor's orders
router.get('/doctor/orders', ensureAuthenticated, ensureAuthorised, (req, res) => {
	DoctorOrders.find({ patientID: req.session.patient.patientID}).sort({'datetime':1}).then(docOrders => {
		res.render('doctors/doctors-orders', {
			docOrders: docOrders,
			patient: req.session.patient,
			showMenu: true
		})
	})
})

router.get('/doctor/orders/:orderID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	DoctorOrders.find({ patientID: req.session.patient.patientID}).sort({'datetime':1}).then(docOrders => {
		DoctorOrders.findOne({ orderID: req.params.orderID }).then(editOrder => {

			editOrder.date = moment(editOrder.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('doctors/doctors-orders', {
				docOrders: docOrders,
				editOrder: editOrder,
				patient: req.session.patient,
				showMenu: true
			})
		})
	})
})

//Doctor's adding of orders
router.post('/doctor/orders/add-order', upload.single('photo') , ensureAuthenticated, ensureAuthorised, (req, res) => {
	orderid = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateOrder, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeOrder;
	uploadUrl = '';

	if (req.body.photoName != '') {
		uploadUrl = req.file.filename;
	}

	new DoctorOrders({
		patientID: req.session.patient.patientID,
		orderID: orderid,
		userType: req.user.userType,
		datetime: datetime,
		date: moment(req.body.dateOrder, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeOrder,
		orders: req.body.orders,
		status: req.body.status,
		uploadUrl: uploadUrl
	}).save();
	
	res.redirect('/master/doctor/orders');
})

router.put('/doctor/orders/edit-order/:orderID', upload.single('photo'), ensureAuthenticated, ensureAuthorised, (req ,res) => {
	datetime = moment(req.body.dateOrder, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeOrder;
	uploadUrl = '';

	if (req.body.photoName != '') {
		uploadUrl = req.file.filename;
	}

	DoctorOrders.findOne({ orderID: req.params.orderID }).then(editOrder => {
		editOrder.datetime = datetime,
		editOrder.date = moment(req.body.dateOrder, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editOrder.time = req.body.timeOrder,
		editOrder.orders = req.body.orders,
		editOrder.status = req.body.status
		if (req.body.photoName != '') {
			editOrder.uploadUrl = uploadUrl
		}

		editOrder.save();
	});

	res.redirect('/master/doctor/orders');
})

router.delete('/doctor/orders/del-order/:orderID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	DoctorOrders.deleteOne({ orderID: req.params.orderID }, function(err) {
		if (err) {
			console.log('cannot delete order');
		} else {
			console.log('deleting: ', req.params.orderID);
		}
	})
	res.redirect('/master/doctor/orders');
})

// MDP page
router.get('/mdp', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMDP.find({user: req.user.id, patientID: req.session.patient.patientID}).sort({'datetime':1})
	.then(newMDP => { // mdp that they have created

		MasterMDP.find({user:{'$ne':req.user.id} , patientID: req.session.patient.patientID}).sort({'datetime':1})
		.then(newOtherMasterMDP => {  // mdp that is created by other users

			StudentMDP.aggregate( // show the latest record created by each student
			[
				{"$sort": {
					'datetime': -1
				}},
				{ "$match" : { 'patientID' : req.session.patient.patientID } },
				{ "$group": { '_id' : "$createdBy",  "doc": {"$first":"$$ROOT"}}},
				{"$replaceRoot": {"newRoot": "$doc"}},
				{"$sort": {
					'datetime': -1,
					'createdBy': 1
				}}
			])
			.then(newOtherStudentMDP => {

				res.render('mdp-notes/master/mdp', {
					newMDP: newMDP,
					newOtherMasterMDP: newOtherMasterMDP,
					newOtherStudentMDP: newOtherStudentMDP,
					patient: req.session.patient,
					showMenu: true,
				});
			})
		})
	})
})
// add MDP page
router.post('/add-mdp', ensureAuthenticated, ensureAuthorised, (req, res) => {
	mdpID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateMDP, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeMDP;
	new MasterMDP({
		patientID: req.session.patient.patientID,
		user: req.user.id,
		//nursingAssessmentID: patient.nursingAssessmentID,
		mdpID: mdpID,
		createdBy: req.user.firstName,
		date: moment(req.body.dateMDP, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeMDP,
		datetime: datetime,
		selectUser: req.body.selectUser,
		nameOfHealthProvider: req.body.nameOfHealthProvider,
		progressNotes: req.body.progressNotes
	}).save();
	res.redirect('/master/mdp');
})
// delete MDP page
router.delete('/del-mdp/:mdpID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMDP.deleteOne({mdpID: req.params.mdpID}, function(err) {
		if (err) {
			console.log("cannot delete mdp details");
		}
	});
	res.redirect('/master/mdp');
})

// get single MDP info
router.get('/mdp/:mdpID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMDP.find({ patientID: req.session.patient.patientID, user: req.user.id}).sort({'datetime':1})
	.then(newMDP => {

		MasterMDP.find({user:{'$ne':req.user.id} , patientID: req.session.patient.patientID}).sort({'datetime':1})
		.then(newOtherMasterMDP => { 

			MasterMDP.findOne({ mdpID: req.params.mdpID})
			.then(editMDP => {
				
				editMDP.date = moment(editMDP.date, 'YYYY-MM-DD').format('DD/MM/YYYY');

				StudentMDP.aggregate(
				[
					{"$sort": {
						'datetime': -1
					}},
					{ "$match" : { 'patientID' : req.session.patient.patientID } },
					{ "$group": { '_id' : "$createdBy",  "doc": {"$first":"$$ROOT"}}},
					{"$replaceRoot": {"newRoot": "$doc"}},
					{"$sort": {
						'datetime': -1,
						'createdBy': 1
					}}
				]
				).then(newOtherStudentMDP => { 
					res.render('mdp-notes/master/mdp', {
						newMDP: newMDP,
						newOtherMasterMDP: newOtherMasterMDP,
						newOtherStudentMDP: newOtherStudentMDP,
						editMDP: editMDP,
						patient: req.session.patient,
						showMenu: true
					});
				});
			})
		})
	})
})

// edit MDP informations
router.put('/edit-mdp/:mdpID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateMDP, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeMDP;

	MasterMDP.findOne({ mdpID: req.params.mdpID}).then(editMDP => {
		editMDP.date = moment(req.body.dateMDP, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editMDP.time = req.body.timeMDP,
		editMDP.datetime = datetime,
		editMDP.selectUser = req.body.selectUser,
		editMDP.healthProvider = req.body.healthProvider,
		editMDP.progressNotes = req.body.progressNotes
		editMDP.nameOfHealthProvider = req.body.nameOfHealthProvider,
		editMDP.save();
	});
	res.redirect("/master/mdp");
})

//Load Diabetic page
router.get('/diabetic', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterDiabetic.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newDiabetic => {

					diabeticsample = [];
					diabeticsampleDate = [];
					let diabeticFlow = Object.assign([], newDiabetic);
					
					diabeticCount = -1;
					
					diabeticnoRecord = 'No existing record';

					newDiabetic.forEach(diabetic => {
						//if (!(diabeticsample.includes(diabetic.datetime))) {
							diabeticsample.push(diabetic.datetime);
							diabeticsampleDate.push(diabetic.date);
						//}
					});
					diabeticsample.sort();
					diabeticsampleDate.sort();

					for (i = 0; i < diabeticsample.length; i++) {
						

						//Counter for empty data
						//.length here refers to last index of the array
						if (diabeticCount !== (diabeticFlow.length - 1)) {
							diabeticCount++;
						}
						//Insert empty data when value doesnt match
						//Count here does the index count of flow array
						if(diabeticFlow !='') 
						{
							if (diabeticsample[i] < diabeticFlow[diabeticCount].datetime) {
								diabeticFlow.splice(diabeticCount, 0, {datetime: ''});
							} else if (diabeticsample[i] > diabeticFlow[diabeticCount].datetime) {
								diabeticFlow.splice(diabeticCount + 1, 0, {datetime: ''});
							}
						} 
						else
						{
							diabeticFlow.push({datetime: '', poc: diabeticnoRecord});
						}

						
					};
					res.render('charts/master/charts-diabetic', {
						// recordID: req.params.recordID,
						// userType: userType,
						diabeticdateVal: diabeticsample,
						diabeticFlow: diabeticFlow,
						newDiabetic: newDiabetic,
						patient: req.session.patient,
						showMenu: true
        			})
	})
})

//get single Diabetic info
router.get('/diabetic/:diabeticID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	// MasterBraden.find({ patientID: req.session.patient.patientID }).then(newBraden => {
	MasterDiabetic.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newDiabetic => {
		MasterDiabetic.findOne({ diabeticID: req.params.diabeticID }).then(editDiabetic => {

			editDiabetic.date = moment(editDiabetic.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-diabetic', {
				// azureId: req.user.azure_oid,
				newDiabetic: newDiabetic,
				editDiabetic: editDiabetic,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})
//add diabetic info
router.post('/add-diabetic', ensureAuthenticated,ensureAuthorised, (req, res) => {
	diabeticID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateDiabetic, 'DD/MM/YYYY').format('MM/DD/YYYY') + " "+ req.body.timeDiabetic;

	splitpoc = req.body.poc.slice(0,2);

	new MasterDiabetic({
			// patientID: req.session.patient.patientID,
			patientID: req.session.patient.patientID,
			diabeticID: diabeticID,
			date: moment(req.body.dateDiabetic, 'DD/MM/YYYY').format('YYYY-MM-DD'),
			time: req.body.timeDiabetic,
			datetime: datetime,
			poc: req.body.poc,
			bgl: req.body.bgl,
			insulintype: req.body.insulintype,
			insulinamt: req.body.insulinamt,
			hypoagent: req.body.hypoagent,
			splitpoc: splitpoc,

	}).save();

	res.redirect('/master/diabetic');
})

//Edit diabetic information
router.put('/edit-diabetic/:diabeticID', ensureAuthenticated,ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateDiabetic, 'DD/MM/YYYY').format('MM/DD/YYYY') + " "+ req.body.timeDiabetic;
	splitpoc = req.body.poc.slice(0,2);

	MasterDiabetic.findOne({ diabeticID: req.params.diabeticID }).then(editDiabetic => {
		editDiabetic.date = moment(req.body.dateDiabetic, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editDiabetic.time = req.body.timeDiabetic,
		editDiabetic.datetime = datetime,
		editDiabetic.poc = req.body.poc,
		editDiabetic.bgl = req.body.bgl,
		editDiabetic.insulintype = req.body.insulintype,
		editDiabetic.insulinamt = req.body.insulinamt,
		editDiabetic.hypoagent = req.body.hypoagent,
		editDiabetic.splitpoc = splitpoc,

		editDiabetic.save();
	});
	res.redirect('/master/diabetic');
})
//Delete diabetic information
router.delete('/del-diabetic/:diabeticID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterDiabetic.deleteOne({diabeticID: req.params.diabeticID}, function(err) {
		if (err) {
			console.log('cannot delete diabetic details');
		}
	});
	res.redirect('/master/diabetic');
})

//END OF DIABETIC
// Care Plan
router.get('/CarePlan', ensureAuthenticated, ensureAuthorised, (req, res) => { // to display the students who has created their care plan

	StudentCarePlan.aggregate([ // display students who has created their care plan
		{"$sort": {
			'datetime': -1
		}},
		{ "$match" : { 'patientID' : req.session.patient.patientID } },
		{ "$group": { '_id' : "$createdBy", "doc": {"$first": "$$ROOT"}}},
		{"$replaceRoot": {"newRoot": "$doc"}},
		{"$sort": {
			'datetime': -1	
		}}
	])
	.then(studentCarePlanName => {
		res.render('care-plan/master/care-plan', {
			studentCarePlanName: studentCarePlanName,
			recordID: req.params.recordID,
			//userType: req.user.userType,
			patient: req.session.patient,
			showMenu: true
		});
	});
})

router.get('/CarePlan/:name', ensureAuthenticated, ensureAuthorised, (req, res) => {
	//userType = req.user.userType == 'student';
	var name = req.params.name;
	StudentCarePlan.aggregate([ // display students who has created their care plan
		{"$sort": {
			'datetime': -1,
		}},
		{ "$match" : { 'patientID' : req.session.patient.patientID } },
		{ "$group": { '_id' : "$createdBy", "doc": {"$first": "$$ROOT"}}},
		{"$replaceRoot": {"newRoot": "$doc"}},
		{"$sort": {
			'datetime': -1	
		}}
	])
	.then(studentCarePlanName => {
		/*StudentCarePlan.find({patientID: req.session.patient.patientID, createdBy: name}).sort({'datetime': 1})
		.then(newCarePlan => {*/
		StudentCarePlan.aggregate([ // display students who has created their care plan
			{"$sort": {
				'datetime': -1
			}},
			{ "$match" : { 'patientID' : req.session.patient.patientID, 'createdBy': req.params.name } },
			{ "$group": { 
				'_id' : {
					"createdBy":"$createdBy",
					"categoryOfNursingIssues":"$categoryOfNursingIssues"
				}, 
				"doc": {
					"$first": "$$ROOT"
				}
			}},
			{"$replaceRoot": {"newRoot": "$doc"}},
			{"$sort": {
				'datetime': -1,
				'categoryOfNursingIssues': 1
			}}
		])
		.then(newCarePlan => {

			res.render('care-plan/master/care-plan', {
				name: req.params.name,
				newCarePlan: newCarePlan,	
				studentCarePlanName: studentCarePlanName,
				recordID: req.params.recordID,
				//userType: userType,
				patient: req.session.patient,
				showMenu: true
			});
		})
	});
})

// get single Care Plan info
router.get('/CarePlan/:name/:carePlanID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	//userType = req.user.userType == 'student';
	
	StudentCarePlan.aggregate([ // display students who has created their care plan
		{"$sort": {
			'datetime': -1
		}},
		{ "$match" : { 'patientID' : req.session.patient.patientID } },
		{ "$group": { '_id' : "$createdBy", "doc": {"$first": "$$ROOT"}}},
		{"$replaceRoot": {"newRoot": "$doc"}},
		{"$sort": {
			'datetime': -1	
		}}
	])
	.then(studentCarePlanName => {
		/*StudentCarePlan.find({ patientID: req.session.patient.patientID, createdBy: req.params.name}).sort({'datetime':1})
		.then(newCarePlan => {*/
		StudentCarePlan.aggregate([ // display students who has created their care plan
			{"$sort": {
				'datetime': -1
			}},
			{ "$match" : { 'patientID' : req.session.patient.patientID, 'createdBy': req.params.name  } },
			{ "$group": { 
				'_id' : {
					"createdBy":"$createdBy",
					"categoryOfNursingIssues":"$categoryOfNursingIssues"
				}, 
				"doc": {
					"$first": "$$ROOT"
				}
			}},
			{"$replaceRoot": {"newRoot": "$doc"}},
			{"$sort": {
				'datetime': -1,
				'categoryOfNursingIssues': 1	
			}}
		])
		.then(newCarePlan => {

			StudentCarePlan.findOne({ carePlanID: req.params.carePlanID })
			.then(editCarePlan => {
				
				editCarePlan.date = moment(editCarePlan.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
				
				res.render('care-plan/master/care-plan', {
					studentCarePlanName: studentCarePlanName,
					name: req.params.name,
					//userType: userType,
					recordID: req.params.recordID,
					newCarePlan: newCarePlan,
					editCarePlan: editCarePlan,
					patient: req.session.patient,
					showMenu: true
				});
			});
		});
	});
})

//Load Neurovascular page
router.get('/neuro', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterNeuro.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newNeuro => {
		// Right arm
		MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Right Arm" }).sort({'datetime':1}).then(newNeuroRightArm => {

			// Left arm
			MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Left Arm" }).sort({'datetime':1}).then(newNeuroLeftArm => {

				// Right leg
				MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Right Leg" }).sort({'datetime':1}).then(newNeuroRightLeg => {

					// Left leg
					MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Left Leg" }).sort({'datetime':1}).then(newNeuroLeftLeg => {
						
						// right arm
						var rightArmNeuroFlowLength = 0;
						// left arm
						var leftArmNeuroFlowLength = 0;
						// right leg
						var rightLegNeuroFlowLength = 0;
						// left leg
						var leftLegNeuroFlowLength = 0;

						// Right Arm
						if (!(isNaN(newNeuroRightArm.length)))
						{
							rightArmNeuroFlowLength = newNeuroRightArm.length
						}
						rightArmNeuroFlowLength = rightArmNeuroFlowLength * 2; // rowspan to merge same site of injury on right arm

						//Left Arm
						if (!(isNaN(newNeuroLeftArm.length)))
						{
							leftArmNeuroFlowLength = newNeuroLeftArm.length
						}
						leftArmNeuroFlowLength = leftArmNeuroFlowLength * 2; // rowspan to merge same site of injury on left arm
						
						// Right Leg
						if (!(isNaN(newNeuroRightLeg.length)))
						{
							rightLegNeuroFlowLength = newNeuroRightLeg.length
						}
						rightLegNeuroFlowLength = rightLegNeuroFlowLength * 2; // rowspan to merge same site of injury on right leg

						//Left Leg
						if (!(isNaN(newNeuroLeftLeg.length)))
						{
							leftLegNeuroFlowLength = newNeuroLeftLeg.length
						}
						leftLegNeuroFlowLength = leftLegNeuroFlowLength * 2; // rowspan to merge same site of injury on left arm		

						neurosample = [];
						neurosampleDate = [];
						let neuroFlow = Object.assign([], newNeuro);
									
						neuroCount = -1;
									
						neuronoRecord = 'No existing record';

						newNeuro.forEach(neuro => {
							// if (!(neurosample.includes(neuro.datetime))) {
								neurosample.push(neuro.datetime);
								neurosampleDate.push(neuro.date);
							// }
						});
						neurosample.sort();
						neurosampleDate.sort();

						for (i = 0; i < neurosample.length; i++) {
							

							//Counter for empty data
							//.length here refers to last index of the array
							if (neuroCount !== (neuroFlow.length - 1)) {
								neuroCount++;
							}
							//Insert empty data when value doesnt match
							//Count here does the index count of flow array
							if(neuroFlow !='') 
							{
								if (neurosample[i] < neuroFlow[neuroCount].datetime) {
									neuroFlow.splice(neuroCount, 0, {datetime: ''});
								} else if (neurosample[i] > neuroFlow[neuroCount].datetime) {
									neuroFlow.splice(neuroCount + 1, 0, {datetime: ''});
								}
							} 
							else
							{
								neuroFlow.push({datetime: '', poc: neuronoRecord});
							}

							
						};
						res.render('charts/master/charts-neuro', {
							// recordID: req.params.recordID,
							// userType: userType,
							neurodateVal: neurosample,
							neuroFlow: neuroFlow,
							newNeuro: newNeuro,
							patient: req.session.patient,
							newNeuroRightArm: newNeuroRightArm,
							newNeuroLeftArm: newNeuroLeftArm,
							newNeuroRightLeg: newNeuroRightLeg,
							newNeuroLeftLeg: newNeuroLeftLeg,
							rightArmRowSpan: rightArmNeuroFlowLength,
							leftArmRowSpan: leftArmNeuroFlowLength,
							rightLegRowSpan: rightLegNeuroFlowLength,
							leftLegRowSpan: leftLegNeuroFlowLength,
							showMenu: true
						})
					})
				})
			})
		})
	})
})

//get single Neurovascular info
router.get('/neuro/:neuroID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterNeuro.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newNeuro => {
		// Right arm
		MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Right Arm" }).sort({'datetime':1}).then(newNeuroRightArm => {
			// Left arm
			MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Left Arm" }).sort({'datetime':1}).then(newNeuroLeftArm => {
				// Right leg
				MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Right Leg" }).sort({'datetime':1}).then(newNeuroRightLeg => {
					// Left leg
					MasterNeuro.find({ patientID: req.session.patient.patientID, siteOfInjury: "Left Leg" }).sort({'datetime':1}).then(newNeuroLeftLeg => {
						MasterNeuro.findOne({ neuroID: req.params.neuroID }).then(editNeuro => {
							// right arm
							var rightArmNeuroFlowLength = 0;
							// left arm
							var leftArmNeuroFlowLength = 0;
							// right leg
							var rightLegNeuroFlowLength = 0;
							// left leg
							var leftLegNeuroFlowLength = 0;

							// Right Arm
							if (!(isNaN(newNeuroRightArm.length)))
							{
								rightArmNeuroFlowLength = newNeuroRightArm.length
							}
							rightArmNeuroFlowLength = rightArmNeuroFlowLength * 2; // rowspan to merge same site of injury on right arm

							//Left Arm
							if (!(isNaN(newNeuroLeftArm.length)))
							{
								leftArmNeuroFlowLength = newNeuroLeftArm.length
							}
							leftArmNeuroFlowLength = leftArmNeuroFlowLength * 2; // rowspan to merge same site of injury on left arm
							
							// Right Leg
							if (!(isNaN(newNeuroRightLeg.length)))
							{
								rightLegNeuroFlowLength = newNeuroRightLeg.length
							}
							rightLegNeuroFlowLength = rightLegNeuroFlowLength * 2; // rowspan to merge same site of injury on right leg

							//Left Leg
							if (!(isNaN(newNeuroLeftLeg.length)))
							{
								leftLegNeuroFlowLength = newNeuroLeftLeg.length
							}
							leftLegNeuroFlowLength = leftLegNeuroFlowLength * 2; // rowspan to merge same site of injury on left arm

							editNeuro.date = moment(editNeuro.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
							res.render('charts/master/charts-neuro', {
								// azureId: req.user.azure_oid,
								newNeuro: newNeuro,
								editNeuro: editNeuro,
								patient: req.session.patient,
								newNeuroRightArm: newNeuroRightArm,
								newNeuroLeftArm: newNeuroLeftArm,
								newNeuroRightLeg: newNeuroRightLeg,
								newNeuroLeftLeg: newNeuroLeftLeg,
								rightArmRowSpan: rightArmNeuroFlowLength,
								leftArmRowSpan: leftArmNeuroFlowLength,
								rightLegRowSpan: rightLegNeuroFlowLength,
								leftLegRowSpan: leftLegNeuroFlowLength,
								showMenu: true			
							})
						})
					})
				})
			})
		})
	})
})
//add Neurovascular info
router.post('/add-neuro', ensureAuthenticated,ensureAuthorised, (req, res) => {
	neuroID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateNeuro, 'DD/MM/YYYY').format('MM/DD/YYYY') + " "+ req.body.timeNeuro;

	//splitpoc = req.body.poc.slice(0,2);

	new MasterNeuro({
		patientID: req.session.patient.patientID,
		neuroID: neuroID,
		// userType: ,
		datetime: datetime,
		date: moment(req.body.dateNeuro, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeNeuro,
		siteOfInjury: req.body.siteOfInjury,
		colourLeft: req.body.leftColour,
		colourRight: req.body.rightColour,
		temperatureLeft: req.body.leftTemperature,
		temperatureRight: req.body.rightTemperature,
		capillaryRefillLeft: req.body.leftCapillaryRefill,
		capillaryRefillRight: req.body.rightCapillaryRefill,
		peripheralPulseLeft: req.body.leftPeripheralPulse,
		peripheralPulseRight: req.body.rightPeripheralPulse,
		edemaLeft: req.body.leftEdema,
		edemaRight: req.body.rightEdema,
		movementLeft: req.body.leftMovement,
		movementRight: req.body.rightMovement,
		sensationLeft: req.body.leftSensation,
		sensationRight: req.body.rightSensation,
		painScale: req.body.painScale,
		numericalRatingScaleLeft: req.body.numericalRatingScaleLeft,
		numericalRatingScaleRight: req.body.numericalRatingScaleRight,
		characteristicLeft: req.body.leftCharacteristic,
		characteristicRight: req.body.rightCharacteristic
	}).save();

	res.redirect('/master/neuro');
})

//Edit Neurovascular information
router.put('/edit-neuro/:neuroID', ensureAuthenticated,ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateNeuro, 'DD/MM/YYYY').format('MM/DD/YYYY') + " "+ req.body.timeNeuro;
	//splitpoc = req.body.poc.slice(0,2);

	MasterNeuro.findOne({ neuroID: req.params.neuroID }).then(editNeuro => {
		editNeuro.date = moment(req.body.dateNeuro, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editNeuro.time = req.body.timeNeuro,
		editNeuro.datetime = datetime,
		editNeuro.siteOfInjury = req.body.siteOfInjury,
		editNeuro.colourLeft = req.body.leftColour,
		editNeuro.colourRight = req.body.rightColour,
		editNeuro.temperatureLeft = req.body.leftTemperature,
		editNeuro.temperatureRight = req.body.rightTemperature,
		editNeuro.capillaryRefillLeft = req.body.leftCapillaryRefill,
		editNeuro.capillaryRefillRight = req.body.rightCapillaryRefill,
		editNeuro.peripheralPulseLeft = req.body.leftPeripheralPulse,
		editNeuro.peripheralPulseRight = req.body.rightPeripheralPulse,
		editNeuro.edemaLeft = req.body.leftEdema,
		editNeuro.edemaRight = req.body.rightEdema,
		editNeuro.movementLeft = req.body.leftMovement,
		editNeuro.movementRight = req.body.rightMovement,
		editNeuro.sensationLeft = req.body.leftSensation,
		editNeuro.sensationRight = req.body.rightSensation,
		editNeuro.painScale = req.body.painScale,
		editNeuro.numericalRatingScaleLeft = req.body.numericalRatingScaleLeft,
		editNeuro.numericalRatingScaleRight = req.body.numericalRatingScaleRight,
		editNeuro.characteristicLeft = req.body.leftCharacteristic,
		editNeuro.characteristicRight = req.body.rightCharacteristic
		editNeuro.save();
	});
	res.redirect('/master/neuro');
})
//Delete Neurovascular information
router.delete('/del-neuro/:neuroID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterNeuro.deleteOne({neuroID: req.params.neuroID}, function(err) {
		if (err) {
			console.log('cannot delete Neurovascular details');
		}
	});
	res.redirect('/master/neuro');
})

//END OF Neurovascular

//start of CLC

router.get('/clc', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterGcs.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newGcs => {
		MasterClcVital.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newclcvital => {
			MasterPupils.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newpupils => {	
				MasterMotorStrength.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newmotorstrength => {			

					clcsample = [];
					clcsampleDate = [];
					let gcsFlow = Object.assign([], newGcs);
					let clcvitalFlow = Object.assign([], newclcvital);
					let pupilsFlow = Object.assign([], newpupils);
					let motorstrengthFlow = Object.assign([], newmotorstrength);
					gcsCount = -1;
					clcvitalCount = -1;
					pupilsCount = -1;
					motorstrengthCount = -1;
					ionoRecord = 'No existing record';

					newGcs.forEach(gcs => {
						if (!(clcsample.includes(gcs.datetime))) {
							clcsample.push(gcs.datetime);
							clcsampleDate.push(gcs.date);
						}
					});
					newclcvital.forEach(clcvital => {
						if (!(clcsample.includes(clcvital.datetime))) {
							clcsample.push(clcvital.datetime);
							clcsampleDate.push(clcvital.date);
						}
					});
					newpupils.forEach(pupils => {
						if (!(clcsample.includes(pupils.datetime))){
							clcsample.push(pupils.datetime);
							clcsampleDate.push(pupils.date);
						}
					});

					newmotorstrength.forEach(motorstrength => {
						if (!(clcsample.includes(motorstrength.datetime))) {
							clcsample.push(motorstrength.datetime);
							clcsampleDate.push(motorstrength.date);
						}
					});
		
						
					clcsample.sort();
					clcsampleDate.sort();

					for (i = 0; i < clcsample.length; i++) {
						

						//Counter for empty data
						//.length here refers to last index of the array
						if (gcsCount !== (gcsFlow.length - 1)) {
							gcsCount++;
						}

						if (clcvitalCount !== (clcvitalFlow.length - 1)) {
							clcvitalCount++;
						}

						if (pupilsCount !== (pupilsFlow.length - 1)) {
							pupilsCount++;
						}

						if (motorstrengthCount !== (motorstrengthFlow.length - 1)) {
							motorstrengthCount++;
						}
						

						//Insert empty data when value doesnt match
						//Count here does the index count of flow array
						if(gcsFlow !='') 
						{
							if (clcsample[i] < gcsFlow[gcsCount].datetime) {
								gcsFlow.splice(gcsCount, 0, {datetime: ''});
							} else if (clcsample[i] > gcsFlow[gcsCount].datetime) {
								gcsFlow.splice(gcsCount + 1, 0, {datetime: ''});
							}
						} 
						else
						{
							gcsFlow.push({datetime: '', eyeopen: ionoRecord});
						}

						if(clcvitalFlow !='') 
						{
							if (clcsample[i] < clcvitalFlow[clcvitalCount].datetime) {
								clcvitalFlow.splice(clcvitalCount, 0, {datetime: ''});
							} else if (clcsample[i] > clcvitalFlow[clcvitalCount].datetime) {
								clcvitalFlow.splice(clcvitalCount + 1, 0, {datetime: ''});
							}
						} 
						else
						{
							clcvitalFlow.push({datetime: '', heartRate: ionoRecord});
						}

						if(pupilsFlow !='') 
						{
							if (clcsample[i] < pupilsFlow[pupilsCount].datetime) {
								pupilsFlow.splice(pupilsCount, 0, {datetime: ''});
							} else if (clcsample[i] > pupilsFlow[pupilsCount].datetime) {
								pupilsFlow.splice(pupilsCount + 1, 0, {datetime: ''});
							}
						} 
						else 
						{
							pupilsFlow.push({datetime: '', sizeright: ionoRecord});
						}

						if(motorstrengthFlow !='')
						{
							if (clcsample[i] < motorstrengthFlow[motorstrengthCount].datetime) {
								motorstrengthFlow.splice(motorstrengthCount, 0, {datetime: ''});
							} else if (clcsample[i] > motorstrengthFlow[motorstrengthCount].datetime) {
								motorstrengthFlow.splice(motorstrengthCount + 1, 0, {datetime: ''});
							}
						}
						else 
						{
							motorstrengthFlow.push({datetime: '', strengthrightarm: ionoRecord});
						}
					};

					res.render('charts/master/charts-clc', {
						clcsampleDate: clcsample,
						gcsFlow: gcsFlow,
						clcvitalFlow: clcvitalFlow,
						pupilsFlow: pupilsFlow,
						motorstrengthFlow: motorstrengthFlow,
						newGcs: newGcs,
						newpupils: newpupils,
						newclcvital: newclcvital,
						newmotorstrength: newmotorstrength,
						patient: req.session.patient,
						showMenu: true
          			})
				})
			})
		});
	})
})


//add gcs info
router.post('/add-gcs', ensureAuthenticated, ensureAuthorised, (req, res) => {
	gcsID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateGcs, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeGcs;
	
	totalgcs = parseInt(req.body.eyeopen.slice(-1))
	+ parseInt(req.body.bestverbal.slice(-1)) 
	+ parseInt(req.body.bestmotor.slice(-1));

	spliteyeopen = removeNumber.removeNumberFunction(req.body.eyeopen);
	splitbestverbal = removeNumber.removeNumberFunction(req.body.bestverbal);
	splitbestmotor = removeNumber.removeNumberFunction(req.body.bestmotor);

	new MasterGcs({
		patientID: req.session.patient.patientID,
		gcsID: gcsID,
		date:	moment(req.body.dateGcs, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeGcs,
		datetime: datetime,
		eyeopen: req.body.eyeopen,
		bestverbal: req.body.bestverbal,
		bestmotor: req.body.bestmotor,

		spliteyeopen:spliteyeopen,
		splitbestverbal:splitbestverbal,
		splitbestmotor:splitbestmotor,

		totalgcs: totalgcs,

	}).save();

	res.redirect('/master/clc');
})

//Delete gcs information
router.delete('/del-gcs/:gcsID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterGcs.deleteOne({gcsID: req.params.gcsID}, function(err) {
		if (err) {
			console.log('cannot delete GCS details');
		}
	});
	res.redirect('/master/clc');
})

//edit gcs informations
router.put('/edit-gcs/:gcsID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateGcs, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeGcs;
	
	totalgcs = parseInt(req.body.eyeopen.slice(-1))
	+ parseInt(req.body.bestverbal.slice(-1)) 
	+ parseInt(req.body.bestmotor.slice(-1));

	spliteyeopen = removeNumber.removeNumberFunction(req.body.eyeopen);
	splitbestverbal = removeNumber.removeNumberFunction(req.body.bestverbal);
	splitbestmotor = removeNumber.removeNumberFunction(req.body.bestmotor);

	MasterGcs.findOne({ gcsID: req.params.gcsID }).then(editGcs => {
		editGcs.date = moment(req.body.dateGcs, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editGcs.time = req.body.timeGcs,
		editGcs.datetime = datetime,
		editGcs.eyeopen = req.body.eyeopen,
		editGcs.bestverbal = req.body.bestverbal,
		editGcs.bestmotor = req.body.bestmotor,
		editGcs.totalgcs = totalgcs,

		editGcs.spliteyeopen = spliteyeopen,
		editGcs.splitbestverbal = splitbestverbal,
		editGcs.splitbestmotor = splitbestmotor,
		editGcs.save();
	});
	res.redirect('/master/clc');
})

//get single gcs info
router.get('/clc-gcs/:gcsID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterGcs.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newGcs => {
		MasterGcs.findOne({ gcsID: req.params.gcsID }).then(editGcs => {

			editGcs.date = moment(editGcs.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-clc', {
				newGcs: newGcs,
				editGcs: editGcs,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})
//clc vital
//add clcvital info
router.post('/add-clcvital', ensureAuthenticated, ensureAuthorised, (req, res) => {
	clcvitalID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateclcvital, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeclcvital;
	
	bloodp = req.body.sbp + "/" + req.body.dbp;
	new  MasterClcVital({
		patientID: req.session.patient.patientID,
		clcvitalID: clcvitalID,
		date:	moment(req.body.dateclcvital, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeclcvital,
		datetime: datetime,
		heartRate: req.body.heartRate,
		resp: req.body.resp,
		sbp: req.body.sbp,
		dbp: req.body.dbp,
		bloodp: bloodp,

	}).save();

	res.redirect('/master/clc');
})

//Delete clcvital information
router.delete('/del-clcvital/:clcvitalID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterClcVital.deleteOne({clcvitalID: req.params.clcvitalID}, function(err) {
		if (err) {
			console.log('cannot delete Vital details');
		}
	});
	res.redirect('/master/clc');
})

//edit clcvital informations
router.put('/edit-clcvital/:clcvitalID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateclcvital, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeclcvital;
	bloodp = req.body.sbp + "/" + req.body.dbp;

	MasterClcVital.findOne({ clcvitalID: req.params.clcvitalID }).then(editclcvital => {
		editclcvital.date = moment(req.body.dateclcvital, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editclcvital.time = req.body.timeclcvital,
		editclcvital.datetime = datetime,
		editclcvital.heartRate = req.body.heartRate,
		editclcvital.resp = req.body.resp,
		editclcvital.sbp = req.body.sbp,
		editclcvital.dbp = req.body.dbp,
		editclcvital.bloodp = bloodp,

		editclcvital.save();
	});
	res.redirect('/master/clc');
})

//get single clcvital info
router.get('/clc-vital/:clcvitalID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterClcVital.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newclcvital => {
		MasterClcVital.findOne({ clcvitalID: req.params.clcvitalID }).then(editclcvital => {

			editclcvital.date = moment(editclcvital.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-clc', {
				newclcvital: newclcvital,
				editclcvital: editclcvital,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})

//start PUPILS
//add pupils info
router.post('/add-pupils', ensureAuthenticated, ensureAuthorised, (req, res) => {
	pupilsID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.datepupils, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timepupils;
	
	new  MasterPupils({
		patientID: req.session.patient.patientID,
		pupilsID: pupilsID,
		date:	moment(req.body.datepupils, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timepupils,
		datetime: datetime,
		sizeright: req.body.sizeright,
		sizeleft: req.body.sizeleft,
		reactionright: req.body.reactionright,
		reactionleft: req.body.reactionleft,

	}).save();

	res.redirect('/master/clc');
})

//Delete pupils information
router.delete('/del-pupils/:pupilsID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterPupils.deleteOne({pupilsID: req.params.pupilsID}, function(err) {
		if (err) {
			console.log('cannot delete Pupils details');
		}
	});
	res.redirect('/master/clc');
})

//edit pupils informations
router.put('/edit-pupils/:pupilsID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.datepupils, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timepupils;

	MasterPupils.findOne({ pupilsID: req.params.pupilsID }).then(editpupils => {
		editpupils.date = moment(req.body.datepupils, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editpupils.time = req.body.timepupils,
		editpupils.datetime = datetime,
		editpupils.sizeright = req.body.sizeright,
		editpupils.sizeleft = req.body.sizeleft,
		editpupils.reactionright = req.body.reactionright,
		editpupils.reactionleft = req.body.reactionleft,

		editpupils.save();
	});
	res.redirect('/master/clc');
})

//get single pupils info
router.get('/clc-pupils/:pupilsID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterPupils.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newpupils => {
		MasterPupils.findOne({ pupilsID: req.params.pupilsID }).then(editpupils => {

			editpupils.date = moment(editpupils.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-clc', {
				newpupils: newpupil,
				editpupils: editpupils,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})
//start motor strength
//add motor strength info
router.post('/add-motorstrength', ensureAuthenticated, ensureAuthorised, (req, res) => {
	motorstrengthID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.datemotorstrength, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timemotorstrength;
	
	totalms = parseInt(req.body.strengthrightarm.slice(-1))
	+ parseInt(req.body.strengthleftarm.slice(-1)) 
	+ parseInt(req.body.strengthrightleg.slice(-1))
	+ parseInt(req.body.strengthleftleg.slice(-1));

	// splitstrengthrightarm = removeNumber.removeNumberFunction(req.body.strengthrightarm);
	// splitstrengthleftarm = removeNumber.removeNumberFunction(req.body.strengthleftarm);
	// splitstrengthrightleg = removeNumber.removeNumberFunction(req.body.strengthrightleg);
	// splitstrengthleftleg = removeNumber.removeNumberFunction(req.body.strengthleftleg);
	
	new  MasterMotorStrength({
		patientID: req.session.patient.patientID,
		motorstrengthID: motorstrengthID,
		date:	moment(req.body.datemotorstrength, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timemotorstrength,
		datetime: datetime,
		strengthrightarm: req.body.strengthrightarm,
		strengthleftarm: req.body.strengthleftarm,
		strengthrightleg: req.body.strengthrightleg,
		strengthleftleg: req.body.strengthleftleg,

		// splitstrengthrightarm: splitstrengthrightarm,
		// splitstrengthleftarm: splitstrengthleftarm,
		// splitstrengthrightleg: splitstrengthrightleg,
		// splitstrengthleftleg: splitstrengthleftleg,
		
		totalms: totalms,

	}).save();

	res.redirect('/master/clc');
})

//Delete motor strength information
router.delete('/del-motorstrength/:motorstrengthID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMotorStrength.deleteOne({motorstrengthID: req.params.motorstrengthID}, function(err) {
		if (err) {
			console.log('Cannot delete Motor Strength details');
		}
	});
	res.redirect('/master/clc');
})

//edit motorstrength informations
router.put('/edit-motorstrength/:motorstrengthID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.datemotorstrength, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timemotorstrength;
	
	totalms = parseInt(req.body.strengthrightarm.slice(-1))
	+ parseInt(req.body.strengthleftarm.slice(-1)) 
	+ parseInt(req.body.strengthrightleg.slice(-1))
	+ parseInt(req.body.strengthleftleg.slice(-1));

	// splitstrengthrightarm = removeNumber.removeNumberFunction(req.body.strengthrightarm);
	// splitstrengthleftarm = removeNumber.removeNumberFunction(req.body.strengthleftarm);
	// splitstrengthrightleg = removeNumber.removeNumberFunction(req.body.strengthrightleg);
	// splitstrengthleftleg = removeNumber.removeNumberFunction(req.body.strengthleftleg);

	MasterMotorStrength.findOne({ motorstrengthID: req.params.motorstrengthID }).then(editmotorstrength => {
		editmotorstrength.date = moment(req.body.datemotorstrength, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editmotorstrength.time = req.body.timemotorstrength,
		editmotorstrength.datetime = datetime,
		editmotorstrength.strengthrightarm = req.body.strengthrightarm,
		editmotorstrength.strengthleftarm = req.body.strengthleftarm,
		editmotorstrength.strengthrightleg = req.body.strengthrightleg,
		editmotorstrength.strengthleftleg = req.body.strengthleftleg,
		editmotorstrength.totalms = totalms,
		
		// editmotorstrength.splitstrengthrightarm = splitstrengthrightarm,
		// editmotorstrength.splitstrengthleftarm = splitstrengthleftarm,
		// editmotorstrength.splitstrengthrightleg = splitstrengthrightleg,
		// editmotorstrength.splitstrengthleftleg = splitstrengthleftleg,
		

		editmotorstrength.save();
	});
	res.redirect('/master/clc');
})

//get single motor strength info
router.get('/clc-motorstrength/:motorstrengthID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMotorStrength.find({ patientID: req.session.patient.patientID }).sort({'datetime':1}).then(newmotorstrength => {
		MasterMotorStrength.findOne({ motorstrengthID: req.params.motorstrengthID }).then(editmotorstrength => {

			editmotorstrength.date = moment(editmotorstrength.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			res.render('charts/master/charts-clc', {
				newmotorstrength: newmotorstrength,
				editmotorstrength: editmotorstrength,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})
//FEEDING REGIME
// Open Feeding regime page
router.get('/FeedingRegime', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterFeedingRegime.find({user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newFeeding => {//(other record)
		MasterFeedingRegime.find({ patientID: req.session.patient.patientID})
		.then(newOtherFeeding =>{ //(your own record)
			// MasterScheduleFeed.find({ masterpatientID: req.session.patient.patientID})
			// .then(studentName =>{
				// MasterScheduleFeed.findOne({ masterpatientID: req.session.patient.patientID, by:req.params.name})	
				// .then(newOtherScheduleFeed =>{	
				MasterScheduleFeed.aggregate([ // display students who has created their care plan
					{"$sort": {
						'datetime': -1
					}},
					{ "$match" : { 'masterpatientID' : req.session.patient.patientID }},
					{ "$group": { '_id' : "$by", "doc": {"$first": "$$ROOT"}}},
					{"$replaceRoot": {"newRoot": "$doc"}},
					{"$sort": {
						'datetime': -1	
					}}
				])
				.then(studentName =>{
					
				res.render('charts/master/charts-feeding-regime', {
					newFeeding: newFeeding,
					//editFeeding: editFeeding,
					// newOtherScheduleFeed: newOtherScheduleFeed,
					checkifEmpty: true,
					studentName: studentName,
					recordID: req.params.recordID,
					// name: req.params.name,
					patient: req.session.patient,
					currentName: req.user.firstName,
					newOtherFeeding: newOtherFeeding,
					showMenu: true
				
				});
			// })
		})
	})
	})
})

//Add Feeding
router.post('/add-feeding-regime', ensureAuthenticated, ensureAuthorised, (req, res) => {
	feedID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateFeeding, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeFeeding;
	
	console.log("Feeding Regime ADD NEW");
	
	new MasterFeedingRegime({
		// user: req.user.id,
		patientID: req.session.patient.patientID,
		date:moment(req.body.dateFeeding, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeFeeding,
		datetime: datetime,
		typeofFormula: req.body.typeofFormula,
		enteralFeed: req.body.enteralFeed,
		ordersFeed: req.body.ordersFeed,
		masterpatientID: req.session.patient.patientID,
		by: req.user.firstName,
		feedID: feedID,
	}).save();
		res.redirect('/master/FeedingRegime');
})

	
//One Feeding Regime by ID
router.get('/FeedingRegime/:feedID/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	
	MasterFeedingRegime.find({ user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newFeeding => {
		MasterFeedingRegime.findOne({ patientID: req.session.patient.patientID})
		.then(newOtherFeeding =>{//(your own record) you need this (if you only put in the /HistoryTaking, this route do not know the newOtherHistory)
			MasterFeedingRegime.findOne({ feedID: req.params.feedID }).then(editFeeding =>{
				
				var name = req.params.name;
				
				editFeeding.date = moment(editFeeding.date, 'YYYY-MM-DD').format('DD/MM/YYYY');

				res.render('charts/master/charts-feeding-regime',{
					newFeeding: newFeeding,
					editFeeding: editFeeding,
					newOtherFeeding: newOtherFeeding,
					patient: req.session.patient,
					checkifEmpty: false,
					currentName: req.user.firstName,
					by: name,
					showMenu: true
				})
			})
		});
	})
})

//Edit the FeedingRegime
router.put('/edit-feeding-regime/:feedID/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateFeeding, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeFeeding;

	MasterFeedingRegime.findOne({ patientID:  req.session.patient.patientID,feedID: req.params.feedID})
	.then(editFeeding => {
		
		editFeeding.date = moment(req.body.dateFeeding, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editFeeding.time = req.body.timeFeeding,
		editFeeding.datetime = datetime,
		editFeeding.masterpatientID = req.session.patient.patientID,
		editFeeding.patientID = req.session.patient.patientID,
		editFeeding.typeofFormula = req.body.typeofFormula,
		editFeeding.enteralFeed = req.body.enteralFeed,
		editFeeding.ordersFeed = req.body.ordersFeed,
		
		editFeeding.save();
	});
	res.redirect("/master/FeedingRegime");
})

//Add Schedule Feeding
router.post('/add-schedule', ensureAuthenticated, ensureAuthorised, (req, res) => {
	scheduleID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateSchedule, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeSchedule;
	
	console.log("Schedule ADD NEW");
	
	new MasterScheduleFeed({
		// user: req.user.id,
		patientID: req.session.patient.patientID,
		date:moment(req.body.dateSchedule, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeSchedule,
		datetime: datetime,
		scheduleFeed: req.body.scheduleFeed,
		scheduleAmt: req.body.scheduleAmt,
		scheduleFlush: req.body.scheduleFlush,
		masterpatientID: req.session.patient.patientID,
		by: req.user.firstName,
		scheduleID: scheduleID,
	}).save();
		res.redirect('/master/ScheduleFeeding');
})
router.get('/FeedingRegime/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	var name = req.params.name;
	console.log('sched name: '+name);
	MasterScheduleFeed.aggregate([ // display students who has created their care plan
		{"$sort": {
			'datetime': -1,
		}},
		{ "$match" : { 'masterpatientID' : req.session.patient.patientID } },
		{ "$group": { '_id' : "$by", "doc": {"$first": "$$ROOT"}}},
		{"$replaceRoot": {"newRoot": "$doc"}},
		{"$sort": {
			'datetime': -1	
		}}
	])
	.then(studentName => {
			
		// MasterScheduleFeed.aggregate([ // display students who has created their care plan
		// 	{"$sort": {
		// 		'datetime': -1
		// 	}},
		// 	{ "$match" : { 'masterpatientID' : req.session.patient.patientID, 'by': req.params.name } },
		// 	{ "$group": { 
		// 		'_id' : {
		// 			"by":"$by",
		// 		}, 
		// 		"doc": {
		// 			"$first": "$$ROOT"
		// 		}
		// 	}},
		// 	{"$replaceRoot": {"newRoot": "$doc"}},
		// 	{"$sort": {
		// 		'datetime': -1,
		// 	}}
		// ])
		// .then(newOtherScheduleFeed => {
	MasterScheduleFeed.find({ masterpatientID: req.session.patient.patientID,by:req.params.name})
	.sort({'datetime': -1 }).then(newOtherScheduleFeed =>{
	// 	MasterScheduleFeed.find({ patientID: req.session.patient.patientID})
	// 		.then(studentName =>{
		MasterFeedingRegime.find({patientID: req.session.patient.patientID })
		.sort({'datetime': 1}).then(newFeeding=>{
			res.render('charts/master/charts-feeding-regime',{
				newFeeding: newFeeding,
				//newSchedule: newSchedule,
				//editSchedule: editSchedule,
				newOtherScheduleFeed: newOtherScheduleFeed,
				studentName: studentName,
				patient: req.session.patient,
				checkifEmpty: false,
				currentName: req.user.firstName,
				name: req.params.name,
				showMenu: true
			})
		})
	})
})
})
	
//One Schedule Feed by ID
router.get('/ScheduleFeeding/:scheduleID/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	
	MasterScheduleFeed.find({ user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newSchedule => {
		MasterScheduleFeed.findOne({ patientID: req.session.patient.patientID})
		.sort({'datetime': -1 }).then(newOtherScheduleFeed =>{//(your own record) you need this (if you only put in the /HistoryTaking, this route do not know the newOtherHistory)
			MasterScheduleFeed.findOne({ scheduleID: req.params.scheduleID })
			.then(editSchedule =>{		
				MasterScheduleFeed.find({user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID,by:req.params.name})
					.then(studentName =>{
						
			// MasterScheduleFeed.aggregate([ // display students who has created their care plan
			// 	{"$sort": {
			// 		'datetime': -1
			// 	}},
			// 	{ "$match" : { 'patientID' : req.session.patient.patientID } },
			// 	{ "$group": { '_id' : "$by", "doc": {"$first": "$$ROOT"}}},
			// 	{"$replaceRoot": {"newRoot": "$doc"}},
			// 	{"$sort": {
			// 		'datetime': -1	
			// 	}}
			// ])
			// .then(studentName => {
					
				
				editSchedule.date = moment(editSchedule.date, 'YYYY-MM-DD').format('DD/MM/YYYY');

				res.render('charts/master/charts-feeding-regime',{
					newSchedule: newSchedule,
					editSchedule: editSchedule,
					studentName: studentName,
					newOtherScheduleFeed: newOtherScheduleFeed,
					patient: req.session.patient,
					checkifEmpty: false,
					currentName: req.user.firstName,
					name: req.params.name,
					showMenu: true
					})
				})
			});
		});
	})
})

//Edit the Schedule Feed
router.put('/edit-schedule/:scheduleID/:name', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateSchedule, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeSchedule;

	MasterScheduleFeed.findOne({ patientID:  req.session.patient.patientID,scheduleID: req.params.scheduleID})
	.then(editSchedule => {
		editSchedule.date = moment(req.body.dateSchedule, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editSchedule.time = req.body.timeSchedule,
		editSchedule.datetime = datetime,
		editSchedule.masterpatientID = req.session.patient.patientID,
		editSchedule.patientID = req.session.patient.patientID,
		editSchedule.scheduleFeed = req.body.scheduleFeed,
		editSchedule.scheduleAmt = req.body.scheduleAmt,
		editSchedule.scheduleFlush = req.body.scheduleFlush,
		
		editSchedule.save();
	});
	res.redirect("/master/ScheduleFeeding");
})
	
// Discharge Planning
router.get('/DischargePlanning', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterDischargePlanning.find({patientID: req.session.patient.patientID}).sort({'datetime':1})
	.then(newDischargePlanning => { // discharge planning that they have created
		MasterAppointment.find({patientID: req.session.patient.patientID}).sort({'datetime':1})
		.then(newAppointment => {
			
			dischargeplanningsample = [];
			dischargeplanningsampleDate = [];
			let dischargePlanningFlow = Object.assign([], newDischargePlanning);
			let appointmentFlow = Object.assign([], newAppointment);

			dischargePlanningCount = -1;
			//appointmentCount = -1;

			dischargeplanningnoRecord = 'No existing record';

			newDischargePlanning.forEach(dischargeplanning => {
				if (!(dischargeplanningsample.includes(dischargeplanning.datetime))) {
					dischargeplanningsample.push(dischargeplanning.datetime);
					dischargeplanningsampleDate.push(dischargeplanning.date);
				}
			});

			/*newAppointment.forEach(appointment => {
				if (!(dischargeplanningsample.includes(appointment.datetime))){
					dischargeplanningsample.push(appointment.datetime);
					dischargeplanningsampleDate.push(appointment.date);
				}
			});*/

			let appointmentObj = {}; // sorting appointment based on dates
			
      		appointmentFlow.forEach((element) => {
        		const date = element.datetime.split(' ')[0];
				if (appointmentObj[date]) {
				
					appointmentObj[date].push(element);
				} else {
					appointmentObj[date] = [element];
				}
      		})
			console.log(JSON.stringify(appointmentObj));
				
			dischargeplanningsample.sort();
			dischargeplanningsampleDate.sort();

			for (i = 0; i < dischargeplanningsample.length; i++) {
				

				//Counter for empty data
				//.length here refers to last index of the array
				if (dischargePlanningCount !== (dischargePlanningFlow.length - 1)) {
					dischargePlanningCount++;
				}

				// if (appointmentCount !== (appointmentFlow.length - 1)) {
				// 	appointmentCount++;
				// }	

				//Insert empty data when value doesnt match
				//Count here does the index count of flow array
				if(dischargePlanningFlow !='') 
				{
					if (dischargeplanningsample[i] < dischargePlanningFlow[dischargePlanningCount].datetime) {
						dischargePlanningFlow.splice(dischargePlanningCount, 0, {datetime: ''});
					} else if (dischargeplanningsample[i] > dischargePlanningFlow[dischargePlanningCount].datetime) {
						dischargePlanningFlow.splice(dischargePlanningCount + 1, 0, {datetime: ''});
					}
				} 
				else
				{
					dischargePlanningFlow.push({datetime: '', dischargePlan: dischargeplanningnoRecord});
				}

				// if(appointmentFlow !='') 
				// {
				// 	if (dischargeplanningsample[i] < appointmentFlow[appointmentCount].datetime) {
				// 		appointmentFlow.splice(appointmentCount, 0, {datetime: ''});
				// 	} else if (dischargeplanningsample[i] > appointmentFlow[appointmentCount].datetime) {
				// 		appointmentFlow.splice(appointmentCount + 1, 0, {datetime: ''});
				// 	}
				// } 
				// else
				// {
				// 	appointmentFlow.push({datetime: '', clinic: dischargeplanningnoRecord});
				// }

			};
			
			res.render('discharge-planning/master/discharge-planning', {
				dischargePlanningdateVal: dischargeplanningsample,
				dischargePlanningFlow: dischargePlanningFlow,
				//appointmentFlow: appointmentFlow,
				newDischargePlanning: newDischargePlanning,
				newAppointment: newAppointment,
				appointmentObj: appointmentObj,
				patient: req.session.patient,
				showMenu: true			
			})
		})
	})
})
// Add Discharge Planning Record
router.post('/add-discharge-planning', ensureAuthenticated, (req, res) => {

	datetime = moment(req.body.dateDischargePlanning, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeDischargePlanning;
	dischargePlanningID = (new standardID('AAA0000')).generate();
	new MasterDischargePlanning({
		patientID: req.session.patient.patientID,
		dischargePlanningID: dischargePlanningID,
		datetime: datetime,
		date: moment(req.body.dateDischargePlanning, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeDischargePlanning,
		// 1
		dischargePlan: req.body.dischargePlan,
		dischargeCondition: req.body.dischargeCondition,
		// 2
		dischargeTo: req.body.dischargeTo,
		dischargeToSpecify: req.body.dischargeToSpecify,
		// 3
		accompaniedBy: req.body.accompaniedBy,
		accompaniedBySpecify: req.body.accompaniedBySpecify,
		// 4
		modeOfTransport: req.body.modeOfTransport,
		modeOfTransportSpecify: req.body.modeOfTransportSpecify,
		// 5
		removalOf: req.body.removalOf,
		// 6
		checkedAndReturned: req.body.checkedAndReturned,
		checkedAndReturnedAppliancesSpecify: req.body.checkedAndReturnedAppliancesSpecify,
		checkedAndReturnedSpecify: req.body.checkedAndReturnedSpecify,
		// 7
		adviceGivenOn: req.body.adviceGivenOn,
		// Others Specify
		othersSpecify: req.body.othersSpecify,
		// Referrals
		referrals: req.body.referrals,
		referralsSpecify: req.body.referralsSpecify,
		// Medical Cert No
		medicalCertificateNo: req.body.medicalCertificateNo,
		// specifyInstructions
		specifyInstructions: req.body.specifyInstructions
	}).save();

	res.redirect('/master/DischargePlanning');
});

// get single Discharge Planning info
router.get('/DischargePlanning/:dischargePlanningID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	
	MasterDischargePlanning.find({patientID: req.session.patient.patientID}).sort({'datetime':1})
	.then(newDischargePlanning => {
		MasterDischargePlanning.findOne({dischargePlanningID: req.params.dischargePlanningID})
		.then(editDischargePlanning => {
			editDischargePlanning.date = moment(editDischargePlanning.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			
			if (editDischargePlanning.appointmentDate == "Invalid date") {
				editDischargePlanning.appointmentDate = "";
			}
			else {
				editDischargePlanning.appointmentDate = moment(editDischargePlanning.appointmentDate , 'YYYY-MM-DD').format('DD/MM/YYYY');
			}
			res.render('discharge-planning/master/discharge-planning', {
				editDischargePlanning: editDischargePlanning,
				newDischargePlanning: newDischargePlanning,
				patient: req.session.patient,
				showMenu: true
			});
		})
	});
});

// edit Discharge Planning
router.put('/edit-DischargePlanning/:dischargePlanningID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.dateDischargePlanning, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeDischargePlanning;

	MasterDischargePlanning.findOne({ dischargePlanningID: req.params.dischargePlanningID}).then(editDischargePlanning => {
		editDischargePlanning.date = moment(req.body.dateDischargePlanning, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editDischargePlanning.time = req.body.timeDischargePlanning,
		editDischargePlanning.datetime = datetime,
		// 1
		editDischargePlanning.dischargePlan = req.body.dischargePlan,
		editDischargePlanning.dischargeCondition = req.body.dischargeCondition,
		// 2
		editDischargePlanning.dischargeTo = req.body.dischargeTo,
		editDischargePlanning.dischargeToSpecify = req.body.dischargeToSpecify,
		// 3
		editDischargePlanning.accompaniedBy = req.body.accompaniedBy,
		editDischargePlanning.accompaniedBySpecify = req.body.accompaniedBySpecify,
		// 4
		editDischargePlanning.modeOfTransport = req.body.modeOfTransport,
		editDischargePlanning.modeOfTransportSpecify = req.body.modeOfTransportSpecify,
		// 5
		editDischargePlanning.removalOf = req.body.removalOf,
		// 6
		editDischargePlanning.checkedAndReturned = req.body.checkedAndReturned,
		editDischargePlanning.checkedAndReturnedAppliancesSpecify = req.body.checkedAndReturnedAppliancesSpecify,
		editDischargePlanning.checkedAndReturnedSpecify = req.body.checkedAndReturnedSpecify,
		// 7
		editDischargePlanning.adviceGivenOn = req.body.adviceGivenOn,
		// Others
		editDischargePlanning.othersSpecify = req.body.othersSpecify,
		// Referrals
		editDischargePlanning.referrals = req.body.referrals,
		editDischargePlanning.referralsSpecify = req.body.referralsSpecify,
		// Medical Cert No
		editDischargePlanning.medicalCertificateNo = req.body.medicalCertificateNo,
		// specifyInstructions
		editDischargePlanning.specifyInstructions = req.body.specifyInstructions

		editDischargePlanning.save();
	});
	res.redirect("/master/DischargePlanning");
})

// Add Appointment
router.post('/add-appointment', ensureAuthenticated, (req, res) => {

	datetime = moment(req.body.appointmentDate1, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.appointmentTime1;
	appointmentID = (new standardID('AAA0000')).generate();
	new MasterAppointment({
		patientID: req.session.patient.patientID,
		appointmentID: appointmentID,
		datetime: datetime,
		date: moment(req.body.appointmentDate1, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.appointmentTime1,
		// Follow-up Appointment
		followUpAppointment: req.body.followUpAppointment1,
		followUpAppointmentSpecify: req.body.followUpAppointmentSpecify1,
		clinic: req.body.clinic1,
		nameOfDoctor: req.body.nameOfDoctor1,
		memoGiven: req.body.memoGiven1,
		remarks: req.body.remarks1,
	}).save();
	
	res.redirect('/master/DischargePlanning');
});

// get single Appointment
router.get('/FollowUpApppointment/:appointmentID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	
	MasterAppointment.find({patientID: req.session.patient.patientID}).sort({'datetime':1})
	.then(newAppointment => {
		MasterAppointment.findOne({appointmentID: req.params.appointmentID})
		.then(editAppointment => {
			editAppointment.date = moment(editAppointment.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
			
			res.render('discharge-planning/master/discharge-planning', {
				editAppointment: editAppointment,
				newAppointment: newAppointment,
				patient: req.session.patient,
				showMenu: true
			});
		})
	});
});

// edit Appointment
router.put('/edit-Appointment/:appointmentID', ensureAuthenticated, ensureAuthorised, (req,res) => {
	datetime = moment(req.body.appointmentDate1, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.appointmentTime1;

	MasterAppointment.findOne({ appointmentID: req.params.appointmentID}).then(editAppointment => {
		editAppointment.date = moment(req.body.appointmentDate1, 'DD/MM/YYYY').format('YYYY-MM-DD')
		editAppointment.time = req.body.appointmentTime1,
		editAppointment.datetime = datetime,

		editAppointment.followUpAppointment = req.body.followUpAppointment1,
		editAppointment.followUpAppointmentSpecify = req.body.followUpAppointmentSpecify1,
		editAppointment.clinic = req.body.clinic1,
		editAppointment.nameOfDoctor = req.body.nameOfDoctor1,
		editAppointment.memoGiven = req.body.memoGiven1,
		editAppointment.remarks = req.body.remarks1,

		editAppointment.save();
	});
	res.redirect("/master/DischargePlanning");
})

router.get('/mna', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMNA.find({ patientID: req.session.patient.patientID }).then(newMNA => {
		res.render('charts/master/charts-mna', {
			newMNA: newMNA,
			patient: req.session.patient,
			showMenu: true
		});
	});
});

router.get('/mna/:mnaID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMNA.find({ patientID: req.session.patient.patientID }).then(newMNA => {
		MasterMNA.findOne({ mnaID: req.params.mnaID }).then(editMNA => {
			res.render('charts/master/charts-mna', {
				newMNA: newMNA,
				editMNA: editMNA,
				patient: req.session.patient,
				showMenu: true
			});
		});
	});
});

router.post('/add-mna1', ensureAuthenticated, ensureAuthorised, (req, res) => {
	mnaID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateMna, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

		total = parseInt(req.body.foodIntake.slice(-1)) 
			+ parseInt(req.body.weightLoss.slice(-1)) 
			+ parseInt(req.body.mobility.slice(-1))
			+ parseInt(req.body.psych.slice(-1)) 
			+ parseInt(req.body.neuroPsych.slice(-1)) 
			+ parseInt(req.body.BMI.slice(-1))

		foodIntake = removeNumber.removeNumberFunction(req.body.foodIntake);
		weightLoss = removeNumber.removeNumberFunction(req.body.weightLoss);
		mobility = removeNumber.removeNumberFunction(req.body.mobility);
		psych = removeNumber.removeNumberFunction(req.body.psych);
 		neuroPsych = removeNumber.removeNumberFunction(req.body.neuroPsych);

		new MasterMNA({
			patientID: req.session.patient.patientID,
			mnaID: mnaID,
			date: req.body.dateMna,
			time: req.body.timeMNA,
			datetime: datetime,
			foodIntake: foodIntake,
			weightLoss: weightLoss,
			mobility: mobility,
			psych: psych,
			neuroPsych: neuroPsych,
			BMI: req.body.BMI,
			screenScore: total,

			foodIntakefull: req.body.foodIntake,
			weightLossfull: req.body.weightLoss,
			mobilityfull: req.body.mobility,
			psychfull: req.body.psych,
			neuroPsychfull: req.body.neuroPsych,

			totalScore: total
	
		}).save();

	res.redirect('/master/mna');
});

router.post('/add-mna2', ensureAuthenticated, ensureAuthorised, (req, res) => {
	mnaID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateMNA2, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

	function extractNo(str) {
        var matches = str.match(/\d+\.?\d*/);

        if (matches) {
            return matches[0]
        }
	}
	
	function calcProteinIntake() {
		var dairy = req.body.dairy;
		var eggs = req.body.eggs;
		var meats = req.body.meats;

		let myArray = [dairy, eggs, meats];

		//checks for no of occurence in array 
		function getOccurence(array, value) {
			var i = 0;
			array.forEach((v) => (v === value && i++));
			return i;
		}

		var count = getOccurence(myArray, 'Yes');
		console.log(count);

		//build logic table
		if (count <= 1) {
			var score = 0.0
			return score;
		}
		else if (count == 2) {
			var score = 0.5
			return score;
		}
		else if (count == 3) {
			var score = 1.0
			return score;
		}

	}

	console.log("Calc Protein Intake: " + calcProteinIntake())

	total = parseFloat(extractNo(req.body.liveInd))
		+ parseFloat(extractNo(req.body.drugs))
		+ parseFloat(extractNo(req.body.ulcers))
		+ parseFloat(extractNo(req.body.fullmeals))
		+ parseFloat(extractNo(req.body.vegetal))
		+ parseFloat(extractNo(req.body.fluids))
		+ parseFloat(extractNo(req.body.feeding))
		+ parseFloat(extractNo(req.body.nutrition))
		+ parseFloat(extractNo(req.body.healthStat))
		+ parseFloat(extractNo(req.body.mac))
		+ parseFloat(extractNo(req.body.cc))
		+ parseFloat(calcProteinIntake());

	liveInd = removeNumber.removeNumberFunction(req.body.liveInd);
	drugs = removeNumber.removeNumberFunction(req.body.drugs);
	ulcers = removeNumber.removeNumberFunction(req.body.ulcers);
	fullmeals = removeNumber.removeNumberFunction(req.body.fullmeals);
	vegetal = removeNumber.removeNumberFunction(req.body.vegetal);
	fluids = removeNumber.removeNumberFunction(req.body.fluids);
	feeding = removeNumber.removeNumberFunction(req.body.feeding);
	nutrition = removeNumber.removeNumberFunction(req.body.nutrition);
	healthStat = removeNumber.removeNumberFunction(req.body.healthStat);
	mac = removeNumber.removeNumberFunction(req.body.mac);
	cc = removeNumber.removeNumberFunction(req.body.cc);
	dairy = req.body.dairy;
	eggs = req.body.eggs;
	meats = req.body.meats;

	console.log("Total: " + total);

	new MasterMNA({
		patientID: req.session.patient.patientID,
		mnaID: mnaID,
		date: req.body.dateMNA2,
		time: req.body.timeMNA2,
		datetime: datetime,
		liveInd: liveInd,
		drugs: drugs,
		ulcers: ulcers,
		fullmeals: fullmeals,
		dairy: req.body.dairy,
		eggs: req.body.eggs,
		meats: req.body,meats,
		vegetal: vegetal,
		fluids: fluids,
		feeding: feeding,
		nutrition: nutrition,
		healthStat: healthStat,
		mac: mac,
		cc: cc,
		assessmentScore: total,

		liveIndfull: req.body.liveInd,
		drugsfull: req.body.drugs,
		ulcersfull: req.body.ulcers,
		fullmealsfull: req.body.fullmeals,
		vegetalfull: req.body.vegetal,
		fluidsfull: req.body.fluids,
		feedingfull: req.body.feeding,
		nutritionfull: req.body.nutrition,
		healthStatfull: req.body.healthStat,
		macfull: req.body.mac,
		ccfull: req.body.cc,
		totalScore: total

	}).save();

	res.redirect('/master/mna');
});

router.put('/edit-mna/:mnaID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateMna, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

	total = parseInt(req.body.foodIntake.slice(-1)) 
		+ parseInt(req.body.weightLoss.slice(-1)) 
		+ parseInt(req.body.mobility.slice(-1))
		+ parseInt(req.body.psych.slice(-1)) 
		+ parseInt(req.body.neuroPsych.slice(-1)) 
		+ parseInt(req.body.BMI.slice(-1));

	foodIntake = removeNumber.removeNumberFunction(req.body.foodIntake);
	weightLoss = removeNumber.removeNumberFunction(req.body.weightLoss);
	mobility = removeNumber.removeNumberFunction(req.body.mobility);
	psych = removeNumber.removeNumberFunction(req.body.psych);
	neuroPsych = removeNumber.removeNumberFunction(req.body.neuroPsych);

	MasterMNA.findOne({ mnaID: req.params.mnaID }).then(editMNA => {
		editMNA.foodIntake = foodIntake,
		editMNA.weightLoss = weightLoss,
		editMNA.mobility = mobility,
		editMNA.psych = psych,
		editMNA.neuroPsych = neuroPsych,
		editMNA.BMI = req.body.BMI,
		editMNA.screenScore = total,

		editMNA.foodIntakefull = req.body.foodIntake,
		editMNA.weightLossfull = req.body.weightLoss,
		editMNA.mobilityfull = req.body.mobility,
		editMNA.psychfull = req.body.psych,
		editMNA.neuroPsychfull = req.body.neuroPsych,
		editMNA.totalScore = total + editMNA.assessmentScore;

		editMNA.save();
	});
	res.redirect('/master/mna')
});

router.put('/edit-mna2/:mnaID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateMna, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";

	function extractNo(str) {
        var matches = str.match(/\d+\.?\d*/);

        if (matches) {
            return matches[0]
        }
	}
	
	function calcProteinIntake() {
		var dairy = req.body.dairy;
		var eggs = req.body.eggs;
		var meats = req.body.meats;

		let myArray = [dairy, eggs, meats];

		//checks for no of occurence in array 
		function getOccurence(array, value) {
			var i = 0;
			array.forEach((v) => (v === value && i++));
			return i;
		}

		var count = getOccurence(myArray, 'Yes');
		console.log(count);

		//build logic table
		if (count <= 1) {
			var score = 0.0
			return score;
		}
		else if (count == 2) {
			var score = 0.5
			return score;
		}
		else if (count == 3) {
			var score = 1.0
			return score;
		}

	}

	console.log("Calc Protein Intake: " + calcProteinIntake())

	total = parseFloat(extractNo(req.body.liveInd))
		+ parseFloat(extractNo(req.body.drugs))
		+ parseFloat(extractNo(req.body.ulcers))
		+ parseFloat(extractNo(req.body.fullmeals))
		+ parseFloat(extractNo(req.body.vegetal))
		+ parseFloat(extractNo(req.body.fluids))
		+ parseFloat(extractNo(req.body.feeding))
		+ parseFloat(extractNo(req.body.nutrition))
		+ parseFloat(extractNo(req.body.healthStat))
		+ parseFloat(extractNo(req.body.mac))
		+ parseFloat(extractNo(req.body.cc))
		+ parseFloat(calcProteinIntake());

	liveInd = removeNumber.removeNumberFunction(req.body.liveInd);
	drugs = removeNumber.removeNumberFunction(req.body.drugs);
	ulcers = removeNumber.removeNumberFunction(req.body.ulcers);
	fullmeals = removeNumber.removeNumberFunction(req.body.fullmeals);
	vegetal = removeNumber.removeNumberFunction(req.body.vegetal);
	fluids = removeNumber.removeNumberFunction(req.body.fluids);
	feeding = removeNumber.removeNumberFunction(req.body.feeding);
	nutrition = removeNumber.removeNumberFunction(req.body.nutrition);
	healthStat = removeNumber.removeNumberFunction(req.body.healthStat);
	mac = removeNumber.removeNumberFunction(req.body.mac);
	cc = removeNumber.removeNumberFunction(req.body.cc);
	dairy = req.body.dairy;
	eggs = req.body.eggs;
	meats = req.body.meats;

	MasterMNA.findOne({ mnaID: req.params.mnaID }).then(editMNA2 => {
		editMNA2.liveInd = liveInd,
		editMNA2.drugs = drugs,
		editMNA2.ulcers = ulcers,
		editMNA2.fullmeals = fullmeals,
		editMNA2.vegetal = vegetal,
		editMNA2.fluids = fluids,
		editMNA2.feeding = feeding,
		editMNA2.nutrition = nutrition,
		editMNA2.healthStat = healthStat,
		editMNA2.mac = mac,
		editMNA2.cc = cc,
		editMNA2.dairy = dairy,
		editMNA2.eggs = eggs,
		editMNA2.meats = meats,
		editMNA2.assessmentScore = total

		editMNA2.liveIndfull = req.body.liveInd,
		editMNA2.drugsfull = req.body.drugs,
		editMNA2.ulcersfull = req.body.ulcers,
		editMNA2.fullmealsfull = req.body.fullmeals,
		editMNA2.vegetalfull = req.body.vegetal,
		editMNA2.fluidsfull = req.body.fluids,
		editMNA2.feedingfull = req.body.feeding,
		editMNA2.nutritionfull = req.body.nutrition,
		editMNA2.healthStatfull = req.body.healthStat,
		editMNA2.macfull = req.body.mac,
		editMNA2.ccfull = req.body.cc,
		editMNA2.totalScore = total + editMNA2.screenScore;

		editMNA2.save();
	});
	res.redirect('/master/mna')
});

router.delete('/del-mna/:mnaID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterMNA.deleteOne({mnaID: req.params.mnaID}, function(err) {
		if (err) {
			console.log("cannot delete record")
		}
	});
	res.redirect('/master/mna');
});

router.get('/ivfluid', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterFluidRegime.find({user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newFluid => {
		MasterFluidRegime.find({ patientID: req.session.patient.patientID})
		.then(newOtherFluid => {
			res.render('charts/master/charts-fluid-regime', {
				newFluid: newFluid,
				checkifEmpty: true,
				patient: req.session.patient,
				currentName: req.user.firstName,
				newOtherFluid: newOtherFluid,
				showMenu: true
			});
		});
	});

});

router.post('/add-fluid', ensureAuthenticated, ensureAuthorised, (req, res) => {
	fluidID = (new standardID('AAA0000')).generate();
	datetime = moment(req.body.dateFluid, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeFluid;

	new MasterFluidRegime({
		patientID: req.session.patient.patientID,
		fluidID: fluidID,
		date: moment(req.body.dateFluid, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		time: req.body.timeFluid,
		datetime: datetime,
		typeofFluid: req.body.typeofFluid,
		ordersFluid: req.body.ordersFluid,
		masterpatientID: req.session.patient.patientID,
		by: req.user.firstName,

	}).save();

	res.redirect('/master/ivfluid');
})

router.get('/ivfluid/:fluidID/:name', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterFluidRegime.find({ user:{'$ne':req.user.id}, masterpatientID: req.session.patient.patientID})
	.then(newFluid => {
		MasterFluidRegime.findOne({ patientID: req.session.patient.patientID})
		.then(newOtherFluid=>{//(your own record) you need this (if you only put in the /HistoryTaking, this route do not know the newOtherHistory)
			MasterFluidRegime.findOne({ feedID: req.params.feedID }).then(editFluid =>{
				
				var name = req.params.name;
				
				editFluid.date = moment(editFluid.date, 'YYYY-MM-DD').format('DD/MM/YYYY');

				res.render('charts/master/charts-fluid-regime',{
					newFluid: newFluid,
					editFluid: editFluid,
					newOtherFluid: newOtherFluid,
					patient: req.session.patient,
					checkifEmpty: false,
					currentName: req.user.firstName,
					by: name,
					showMenu: true
				})
			})
		});
	})
})

router.put('/edit-fluid-regime/:fluidID/:name', ensureAuthenticated, ensureAuthorised, (req, res) => {
	datetime = moment(req.body.dateFluid, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + req.body.timeFluid;

	MasterFluidRegime.findOne({ patientID: req.session.patient.patientID, feedID: req.params.feedID })
	.then(editFluid => {
		editFluid.date = moment(req.body.dateFluid, 'DD/MM/YYYY').format('YYYY-MM-DD'),
		editFluid.time = req.body.timeFluid,
		editFluid.datetime = datetime,
		editFluid.typeofFluid = req.body.typeofFluid,
		editFluid.ordersFluid = req.body.ordersFluid,

		editFluid.save();
	});
	res.redirect('/master/ivfluid');
})

//open route to wound page
router.get('/wound', ensureAuthenticated, ensureAuthorised, (req, res) => {
	PatientMasterModel.find({ patientID: req.session.patient.patientID }).then(newG => {
		MasterWound.find({ patientID: req.session.patient.patientID }).sort({'date':-1}).then(Gwound => { // change to newWound if nv work
			//alertMessage.flashMessage(res, newgender.gender, 'fas fa-exclamation', true);
			//console.log("EEEEEEEEEE"+newG + "EEEEEEEEEEEEEEEEE");
		
			sample = [];
			sampleDate = [];
			let newWound = Object.assign([], Gwound);
			woundCount = -1;
			noRecord = 'No existing record';
			
			Gwound.forEach(wou => {
				if (!(sample.includes(wou.datetime))) {
					sample.push(wou.datetime);
					sampleDate.push(wou.date);
				}
			});
			sample.sort();
			sampleDate.sort();
			console.log(sample);
			
			for (i = 0; i < sample.length; i++) {
				//Counter for empty data
				//.length here refers to last index of the array
				if (woundCount !== (newWound.length - 1)) {
					woundCount++;
				}

				//Insert empty data when value doesnt match
				//Count here does the index count of flow array
				if (newWound != '') {
					if (sample[i] < newWound[woundCount].datetime) {
						newWound.splice(woundCount, 0, {datetime: ''});
					} else if (sample[i] > newWound[woundCount].datetime) {
						newWound.splice(woundCount + 1, 0, {datetime: ''});
					}
				} else {
					newWound.push({datetime: ''});
				}
			};		

			res.render('charts/master/charts-wound', {
				newWound: newWound,
				newG: newG,
				patient: req.session.patient,
				showMenu: true


			})
		})
	})
});

//get single wound info
router.get('/wound/:woundID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	PatientMasterModel.find({ patientID: req.session.patient.patientID }).then(newG => {
		MasterWound.find({ patientID: req.session.patient.patientID }).sort({'date':-1}).then(newWound => {
			MasterWound.findOne({ woundID: req.params.woundID }).sort({'date':-1}).then(editWound => {
				res.render('charts/master/charts-wound', {
					newWound: newWound,
					newG: newG,
					editWound: editWound,
					patient: req.session.patient,
					showMenu: true
				})
			})
		})
	})	
})

//add wound info
router.post('/add-wound', ensureAuthenticated, ensureAuthorised, (req, res) => {
	woundID = (new standardID('AAA0000')).generate();
	today = new Date();
	datetime = moment(today, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + moment(today, 'HH:mm:ss').format('HH:mm:ss');
	//date = moment(today, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";
	time = moment(today, 'HH:mm:ss').format('HH:mm:ss') + " ";
	console.log(req.body.woundLabel);

	if (req.body.woundLabel === "" || /^\s*$/.test(req.body.woundLabel) || req.body.woundLabel.length === 0) {
			req.flash('error_msg', 'Please Key In the Wound label');
	}
	else if(req.body.woundLat === "" && req.body.woundLng === "")
	{
		req.flash('error_msg', 'Please Add a marker before saving the wound');
	}
	else if(req.body.statuswound === undefined){
		req.flash('error_msg', 'Please select the wound status before saving');
	}
	else {
		new MasterWound({
			patientID: req.session.patient.patientID,
			woundID: woundID,
			date: datetime,
			time: time,
			gender: PatientMasterModel.gender,
			woundLabel: req.body.woundLabel,
			markerID: req.body.markerId,
			woundP1: req.body.woundLat,
			woundP2: req.body.woundLng,
			woundCat: req.body.woundCat,
			woundtype: req.body.woundtype,
			woundLocation: req.body.woundLocation,
			woundL: req.body.woundL,
			woundW: req.body.woundW,
			woundD: req.body.woundD,
			wounddrain: req.body.wounddrain,
			woundodor: req.body.woundodor,
			woundedges: req.body.woundedges,
			periwound: req.body.periwound,
			dresswound: req.body.dresswound,
			solutionsU: req.body.solutionsU,
			interventions: req.body.interventions,
			patientresponse: req.body.patientresponse,
			woundremarks: req.body.woundremarks,
			woundstatus: req.body.statuswound
		}).save();
	}
	res.redirect('/master/wound');
})



// Delete Route for wound

router.delete('/del-wound/:woundID', ensureAuthenticated, ensureAuthorised, (req, res) => {
	MasterWound.deleteOne({woundID: req.params.woundID}, function(err) {
		if (err) {
			console.log("cannot delete wound record");
		}
	});
	res.redirect('/master/wound');
})

//Edit wound information
router.put('/edit-wound/:woundID', ensureAuthenticated, ensureAuthorised, (req, res) => {

	today = new Date();
	datetime = moment(today, 'DD/MM/YYYY').format('MM/DD/YYYY') + " " + moment(today, 'HH:mm:ss').format('HH:mm:ss');
	//date = moment(today, 'DD/MM/YYYY').format('MM/DD/YYYY') + " ";
	time = moment(today, 'HH:mm:ss').format('HH:mm:ss') + " ";

	MasterWound.findOne({ woundID: req.params.woundID }).then(editWound => {

		editWound.date = datetime,
		editWound.time = time,
		editWound.gender = PatientMasterModel.gender,
		editWound.woundLabel = req.body.woundLabel,
		editWound.markerID = req.body.markerId,
		editWound.woundP1 = req.body.woundLat,
		editWound.woundP2 = req.body.woundLng,
		editWound.woundCat = req.body.woundCat,
		editWound.woundtype = req.body.woundtype,
		editWound.woundLocation = req.body.woundLocation,
		editWound.woundL = req.body.woundL,
		editWound.woundW = req.body.woundW,
		editWound.woundD = req.body.woundD,
		editWound.wounddrain = req.body.wounddrain,
		editWound.woundodor = req.body.woundodor,
		editWound.woundedges = req.body.woundedges,
		editWound.periwound = req.body.periwound,
		editWound.dresswound = req.body.dresswound,
		editWound.solutionsU = req.body.solutionsU,
		editWound.interventions = req.body.interventions,
		editWound.patientresponse = req.body.patientresponse,
		editWound.woundremarks =  req.body.woundremarks,
		editWound.woundstatus =  req.body.statuswound

			editWound.save();
	});
	res.redirect('/master/Wound');
})

// Ward list of MAR and EMR patients
router.get('/list-mar-patients/:ward', ensureAuthenticated, ensureAuthorised, (req,res) =>{
	PatientMasterModel.find({ward: req.params.ward, user: req.user._id}).then(mPatients =>{
		PatientStudentModel.find({ward: req.params.ward}).then(sPatients =>{
			// MAR patient (Patient created in MAR)
			MARPatientMaster.find({ward: req.params.ward, user: req.user._id}).then(marMPatient=>{
				res.render('mar/list-patients/master-list-patients',{
					mPatients: mPatients,
					sPatients: sPatients,
					marMPatient: marMPatient,
					toaster: req.session.toaster
				});
				req.session.toaster = null; // reset toaster
			})
		})
	})
})

// Route to add a MAR patient
router.get('/add-mar-patient', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	res.render('mar/mar-patient/master-add-patient');
})

// MAR Patient
router.post('/add-mar-patient', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	let {
		nric, familyName, givenName, gender, ethinicity, dob, weight, height, allergy,
		ward, bed, consultant, diagnosis, history
	} = req.body;

	new MARPatientMaster({
		patientId: (new standardID('AAA0000')).generate(),
		user: req.user._id,
		nric,
		familyName,
		givenName,
		gender,
		weight,
		height,
		allergy,
		dob: moment(dob, 'DD/MM/YYYY', true).format(),
		ethinicity,
		ward,
		bed,
		consultant,
		diagnosis,
		history
	}).save().then(patient=>{
		new MARCase({
			poId: patient._id,
			patientId: patient.patientId
		}).save().then((newCase)=>{
			toaster.setSuccessMessage(' ', 'MAR Record Added');
			req.session.toaster = toaster;
			res.redirect(`/master/list-mar-patients/${ward}`);
		});
	})
})

// MAR patient
router.get('/delete-mar-patient/:patientId', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	MARPatientMaster.findOneAndDelete({_id: req.params.patientId}).then(result=>{
		toaster.setSuccessMessage(' ', 'MAR Record Deleted');
		req.session.toaster = toaster;
		res.redirect(`/master/list-mar-patients/${result.ward}`)
	})
})

// MAR patient
router.get('/edit-mar-patient/:patientId', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	MARPatientMaster.findOne({_id: req.params.patientId}).then(patient=>{
		res.render('mar/mar-patient/master-edit-patient',{
			patient: patient
		});
	})
})

// MAR patient
router.post('/edit-mar-patient/:patientId', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	
	let {
		nric, familyName, givenName, gender, ethinicity, dob, weight, height, allergy,
		ward, bed, consultant, diagnosis, history
	} = req.body;

	MARPatientMaster.findOne({_id: req.params.patientId}).then(patient=>{
		patient.nric = nric;
		patient.familyName = familyName;
		patient.givenName = givenName;
		patient.gender = gender;
		patient.weight = weight;
		patient.height = height;
		patient.allergy = allergy;
		patient.dob = moment(dob, 'DD/MM/YYYY', true).format();
		patient.ethinicity = ethinicity;
		patient.ward = ward;
		patient.bed = bed;
		patient.consultant = consultant;
		patient.diagnosis = diagnosis;
		patient.history = history;

		patient.save().then(result=>{
			toaster.setSuccessMessage(' ', 'MAR Record Updated');
			req.session.toaster = toaster;
			res.redirect(`/master/list-mar-patients/${patient.ward}`)
		})
	})
})

// MAR management includes case, adding of medication, medication list for a patient/case
router.get('/mar-management/:patientId', ensureAuthenticated, ensureAuthorised,(req,res) =>{

	DrugList.find().then(drugList=>{
		DrugRoutes.find().then(drugRoutes=>{
			DrugFreq.find().then(drugFreq=>{

				PatientMasterModel.findOne({patientID: req.params.patientId}).then(mPatient=>{

					MARCase.findOne({patientId: req.params.patientId}).then(marCase=>{

						MARMedication.find({caseId: marCase._id}).then(marMedication=>{
							
							MedAdministration.find({medicationId: marMedication._id}).then(medAdmin=>{
								// If patient is created from MAR
								if(mPatient == null){
									MARPatientMaster.findOne({patientId: req.params.patientId}).then(mPatient=>{
										res.render('mar/management/mar-management',{
											medAdmin: medAdmin,
											marMedication: marMedication,
											marCase: marCase,
											mPatient: mPatient,
											drugList: drugList,
											drugFreq: drugFreq,
											drugRoutes: drugRoutes,
											toaster: req.session.toaster,
											scaleId: (new standardID('AAA0000')).generate(),
											historyId: (new standardID('AAA0000')).generate()
										})
										req.session.toaster = null; // reset toaster
									})
								}

								// Patient created for EMR
								else{
									res.render('mar/management/mar-management',{
										medAdmin: medAdmin,
										marMedication: marMedication,
										marCase: marCase,
										mPatient: mPatient,
										drugList: drugList,
										drugFreq: drugFreq,
										drugRoutes: drugRoutes,
										patient: mPatient,
										showMenu: true,
										toaster: req.session.toaster,
										scaleId: (new standardID('AAA0000')).generate(),
										historyId: (new standardID('AAA0000')).generate()
									})
									req.session.toaster = null; // reset toaster
								}
							})

						})
					})
				})
			})
		})
	})
})
// MAR Medication Administration Page
router.get('/medication-administration/:caseId',  ensureAuthenticated, ensureAuthorised,(req, res) =>{
	MARCase.findOne({_id: req.params.caseId}).then(marCase =>{
		console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + marCase.date);
		PatientMasterModel.findOne({patientID: marCase.patientId}).then(mPatient=>{	
			// console.log("patientId", marCase.patientId);
			MARMedication.find({caseId: req.params.caseId}).then(marMedication=>{
				MedAdministration.find({caseId: marCase._id}).then(medAdmin=>{
					// If patient is created from MAR
					if(mPatient == null){
						MARPatientMaster.findOne({patientId: marCase.patientId}).then(mPatient=>{
							res.render('mar/management/mar-administration',{
								medAdmin: medAdmin,
								marMedication: marMedication,
								marCase: marCase,
								marpatient: mPatient,
								serveMedicationMAR: true,
								toaster: req.session.toaster
							})
							req.session.toaster = null; // reset toaster
						})
					}
					// Patient created for EMR
					else{
						res.render('mar/management/mar-administration',{
							medAdmin: medAdmin,
							marMedication: marMedication,
							marCase: marCase,
							patient: mPatient,
							serveMedication: true,
							toaster: req.session.toaster
						})
						req.session.toaster = null; // reset toaster
					}			
				})			
			})
		})
	})


})
//Create Medication Administration Case
router.post('/add-med-adm/:medicationId', ensureAuthenticated, ensureAuthorised, (req, res) =>{
	let {admAdmBy, admCosBy, admType, admdate, admremarks, hour, min, admOverduetimehour, admOverduetimemin} =req.body;
	let admmedID = req.params.medicationId;
	var admtime = "";
	var admmin = "";
	admmin = min.toString();
	if(min.length < 2){
		minString = min.toString();
		admmin = "0" + minString;		
	}
		admhour = hour.toString();
		admtime =  admhour + admmin;
	MARMedication.findOne({_id: req.params.medicationId}).then(marMedication =>{
		MARCase.findOne({_id: marMedication.caseId}).then(marCase =>{
			MedAdministration.find({medicationId: marMedication._id}).then(medAdmin=>{
				if (admType == 'A'){
					new MedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						administeredBy: admAdmBy,
						cosignedBy: admCosBy,
						caseId: marCase._id,

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'Due'){
					new MedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						caseId: marCase._id,
					

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'OD'){
					var ODadmtime = "";
					var ODadmmin = admOverduetimemin.toString();
					var ODadmhour =admOverduetimehour.toString();
					if(admOverduetimemin.length < 2){
						ODminString = admOverduetimemin.toString();
						ODadmmin = "0" + minString;
						
					}
					if(admOverduetimehour.length < 2){
						ODhourString = admOverduetimehour.toString();
						ODadmhour = "0" + ODhourString;
					}
					ODadmtime =  ODadmhour + ODadmmin;
					new MedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						overdueTime: ODadmtime,
						remarks: admremarks,
						caseId: marCase._id,

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'M'){
					new MedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						remarks: admremarks,
						caseId: marCase._id,

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});		
				} else if(admType == 'E'){
					new MedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						remarks: admremarks,
						caseId: marCase._id
					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});		
				};
			});
		});
	});

	//Creating the same medical administration as master for student side
	MARMedication.findOne({_id: req.params.medicationId}).then(marMedication =>{
		MARCase.findOne({_id: marMedication.caseId}).then(marCase =>{
			StudMedAdministration.find({medicationId: marMedication._id}).then(medAdmin=>{
				if (admType == 'A'){
					new StudMedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						administeredBy: admAdmBy,
						cosignedBy: admCosBy,
						caseId: marCase._id,
						createdByMaster: "1",
		
					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'Due'){
					new StudMedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						caseId: marCase._id,
						createdByMaster: "1",

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'OD'){
					var ODadmtime = "";
					var ODadmmin = admOverduetimemin.toString();
					var ODadmhour =admOverduetimehour.toString();
					if(admOverduetimemin.length < 2){
						ODminString = admOverduetimemin.toString();
						ODadmmin = "0" + minString;
						
					}
					if(admOverduetimehour.length < 2){
						ODhourString = admOverduetimehour.toString();
						ODadmhour = "0" + ODhourString;
					}
					ODadmtime =  ODadmhour + ODadmmin;
					new StudMedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						overdueTime: ODadmtime,
						remarks: admremarks,
						caseId: marCase._id,
						createdByMaster: "1",

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});
				} else if(admType == 'M'){
					new StudMedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						remarks: admremarks,
						caseId: marCase._id,
						createdByMaster: "1",

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});		
				} else if(admType == 'E'){
					new StudMedAdministration({
						medicationId: admmedID,
						adminType: admType,
						date: admdate,
						time: admtime,
						remarks: admremarks,
						caseId: marCase._id,
						createdByMaster: "1",

					}).save().then(marAdm=>{
						res.redirect(`/master/medication-administration/${marMedication.caseId}`)
					});		
				};
			});
		});
	});

});
// Update Medication Administration Case
router.post('/edit-med-adm/:admId', ensureAuthenticated, ensureAuthorised,(req,res)=>{
	let {admAdmBy, admCosBy, admType, admremarks, hour, min, admOverduetimehour, admOverduetimemin} =req.body;
	var admtime = "";
	var admmin = "";
	admmin = min.toString();
	if(min.length < 2){
		minString = min.toString();
		admmin = "0" + minString;		
	}
	admhour = hour.toString();
	admtime =  admhour + admmin;
	console.log(admAdmBy)
	console.log(admCosBy)
	MedAdministration.findOne({_id: req.params.admId}).then(editadm =>{
		if(admType == 'A'){
			editadm.adminType = admType,
			editadm.time = admtime,
			editadm.administeredBy = admAdmBy,
			editadm.cosignedBy = admCosBy,
			editadm.overdueTime = "",
			editadm.remarks = ""
		} else if(admType == 'Due'){
			editadm.adminType = admType,
			editadm.time = admtime,
			editadm.administeredBy = "",
			editadm.cosignedBy = "",
			editadm.overdueTime = "",
			editadm.remarks = ""
		} else if(admType == 'OD'){
			var ODadmtime = "";
			var ODadmmin = admOverduetimemin.toString();
			var ODadmhour =admOverduetimehour.toString();
			if(admOverduetimemin.length < 2){
				ODminString = admOverduetimemin.toString();
				ODadmmin = "0" + minString;
				
			}
			if(admOverduetimehour.length < 2){
				ODhourString = admOverduetimehour.toString();
				ODadmhour = "0" + ODhourString;
			}
			ODadmtime =  ODadmhour + ODadmmin;
			editadm.adminType = admType,
			editadm.time = admtime,
			editadm.administeredBy = "",
			editadm.cosignedBy = "",
			editadm.overdueTime = ODadmtime,
			editadm.remarks = admremarks
			
		} else if(admType == 'M'){
			editadm.adminType = admType,
			editadm.time = admtime,
			editadm.administeredBy = "",
			editadm.cosignedBy = "",
			editadm.overdueTime = "",
			editadm.remarks = admremarks

		} else if(admType == 'E'){
			editadm.adminType = admType,
			editadm.time = admtime,
			editadm.administeredBy = "",
			editadm.cosignedBy = "",
			editadm.overdueTime = "",
			editadm.remarks = admremarks
		};

		editadm.save().then(savedadm =>{
			res.redirect(`/master/medication-administration/${savedadm.caseId}`)
		})
	})

})

//Delete Medication Administration Case
router.get('/delete-med-adm/:admId', ensureAuthenticated, ensureAuthorised, (req, res)=>{
	MedAdministration.findOneAndDelete({_id: req.params.admId}).then(result=>{
		backURL=req.header('Referer');
		res.redirect(backURL);
	})

})


// Save case details
router.post('/save-case/:caseId', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	let {caseDate, caseTime} = req.body;
	MARCase.findOne({_id: req.params.caseId}).then(editCase=>{
		editCase.date = caseDate,
		editCase.time = caseTime

		editCase.save().then(savedCase =>{
			toaster.setSuccessMessage(' ', 'MAR Case Updated');
			req.session.toaster = toaster;
			res.redirect(`/master/mar-management/${savedCase.patientId}/#caseDetails`)
		})
	})
})

// Save medication
router.post('/save-medication/:caseId/:patientId', ensureAuthenticated, ensureAuthorised,(req,res)=>{
	let {
		search, barcodeId, category, dose, route, frequency, doseDate1, doseTime1, doseInterval, doseNumber,
		iDoseDate1, iDoseTime1, doseTime2, doseTime3, doseTime4, doseTime5,
		rDoseDate1, rDoseTime1, rDoseDate2, rDoseTime2, rDoseDate3, rDoseTime3,
		discDate, discTime, vStatus, cosign, status, remarks, scaleId, nebList, doseType, historyId
	} = req.body;
	if(category !== "Insulin"){
		scaleId = "";
		// ScaleId is used to reference sliding scale records
	}

	if(category == "Nebulising Med"){
		nebList = nebList.split(",")
		nebList.pop();
		search = "";
		// Format of nebList is ["medication:dose"] | string array
	}
	if(doseType === "Regular"){
		
		// Calculate the time for interval doses
		// Using moment
		let doseTimeArr = [];
		let startTime = moment(doseTime1, 'HH:mm');

		if(startTime.isValid()){
			doseTimeArr.push(startTime.format("HH:mm"));

			for(let count = 0; count < parseInt(doseNumber)-1; count++){
				let newTime = moment(startTime).add(parseInt(doseInterval), 'hours');
				
				if(startTime.isSame(newTime, 'date')){
					startTime = newTime;
					doseTimeArr.push(newTime.format("HH:mm"));
				}
				else{
					break;
				}
			}
		}
		new MARMedication({
			name: search,
			barcodeId: barcodeId,
			category,
			dose,
			route,
			doseType,
			doseDate: doseDate1,
			doseTime: doseTimeArr,
			randomDoseDate: [rDoseDate1, rDoseDate2, rDoseDate3],
			randomDoseTime: [rDoseTime1, rDoseTime2, rDoseTime3],
			frequency,
			doseInterval,
			numOfDoses: doseNumber,
			discontinuationDate: discDate,
			discontinuationTime: discTime,
			pharmacistVerification: vStatus,
			cosign,
			status,
			remarks,
			slidingScaleId: scaleId,
			historyId,
			nebList,
			caseId: req.params.caseId
		}).save().then(newMedication=>{
			toaster.setSuccessMessage(' ', 'Medication Added');
			req.session.toaster = toaster;
			res.redirect(`/master/mar-management/${req.params.patientId}/#addMedication`)
		})
	}
	else{
		// Non-Interval Dosage
		new MARMedication({
			name: search,
			druglist: druglist.barcodeId,
			category,
			dose,
			route,
			doseType,
			doseDate: iDoseDate1,
			doseTime: [iDoseTime1, doseTime2, doseTime3, doseTime4, doseTime5],
			randomDoseDate: [rDoseDate1, rDoseDate2, rDoseDate3],
			randomDoseTime: [rDoseTime1, rDoseTime2, rDoseTime3],
			frequency,
			discontinuationDate: discDate,
			discontinuationTime: discTime,
			pharmacistVerification: vStatus,
			cosign,
			status,
			remarks,
			slidingScaleId: scaleId,
			historyId,
			nebList,
			caseId: req.params.caseId
		}).save().then(newMedication=>{
			toaster.setSuccessMessage(' ', 'Medication Added');
			req.session.toaster = toaster;
			res.redirect(`/master/mar-management/${req.params.patientId}/#addMedication`)
		})
	}
})

// Delete medication
router.get('/delete-medication/:medicationId', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	MARMedication.deleteOne({_id: req.params.medicationId}).then(result =>{
		MedAdministration.deleteMany({medicationId: req.params.medicationId}).then(meddel =>{

			backURL=req.header('Referer')+"#medication";

			toaster.setSuccessMessage(' ', 'Medication Deleted');
			req.session.toaster = toaster;
			res.redirect(backURL);
		})
	})
})

// Edit medication
router.get('/edit-medication/:medicationId', ensureAuthenticated, ensureAuthorised,(req, res)=>{

	DrugList.find().then(drugList=>{
		DrugRoutes.find().then(drugRoutes=>{
			DrugFreq.find().then(drugFreq=>{
				MARMedication.findOne({_id: req.params.medicationId}).then(medication =>{
					res.render("mar/management/edit-medication", {
						drugList: drugList,
						drugRoutes: drugRoutes,
						drugFreq: drugFreq,
						medication: medication
					})
				})
			})
		})
	})
})

// Edit medication
router.post('/edit-medication/:medicationId', ensureAuthenticated, ensureAuthorised,(req, res)=>{

	let {
		search, category, dose, route, frequency, doseDate1, doseTime1, doseInterval, doseNumber,
		iDoseDate1, iDoseTime1, doseTime2, doseTime3, doseTime4, doseTime5,
		rDoseDate1, rDoseTime1, rDoseDate2, rDoseTime2, rDoseDate3, rDoseTime3,
		discDate, discTime, vStatus, cosign, status, remarks, nebList
	} = req.body;

	if(nebList != undefined){
		nebList = nebList.split(",")
		nebList.pop();
		search = "";
	}

	if(iDoseDate1 === ""){
		
		// Calculate the time for interval doses
		let doseTimeArr = [];
		let startTime = moment(doseTime1, 'HH:mm');
		doseTimeArr.push(startTime.format("HH:mm"));

		for(let count = 0; count < parseInt(doseNumber)-1; count++){
			let newTime = moment(startTime).add(parseInt(doseInterval), 'hours');
			
			if(startTime.isSame(newTime, 'date')){
				startTime = newTime;
				doseTimeArr.push(newTime.format("HH:mm"));
			}
			else{
				break;
			}
		}
		
		MARMedication.findOne({_id: req.params.medicationId}).then(medication=>{
			medication.dose = dose;
			medication.route = route;
			medication.doseType = "Regular";
			medication.doseDate = doseDate1;
			medication.doseTime = doseTimeArr;
			medication.randomDoseDate = [rDoseDate1, rDoseDate2, rDoseDate3];
			medication.randomDoseTime = [rDoseTime1, rDoseTime2, rDoseTime3];
			medication.frequency = frequency;
			medication.doseInterval = doseInterval;
			medication.numOfDoses = doseNumber,
			medication.discontinuationDate = discDate;
			medication.discontinuationTime = discTime;
			medication.pharmacistVerification = vStatus;
			medication.cosign = cosign;
			medication.status = status;
			medication.remarks = remarks;
			medication.nebList = nebList;

			medication.save()

			MARCase.findOne({_id: medication.caseId}).then(marCase=>{
				toaster.setSuccessMessage(' ', 'Medication Updated');
				req.session.toaster = toaster;
				res.redirect(`/master/mar-management/${marCase.patientId}/#medication`)
			})
		})
	}
	else{
		// Non-Interval Dosage

		MARMedication.findOne({_id: req.params.medicationId}).then(medication=>{
			medication.dose = dose;
			medication.route = route;
			medication.doseType = "Irregular";
			medication.doseDate = iDoseDate1;
			medication.doseTime = [iDoseTime1, doseTime2, doseTime3, doseTime4, doseTime5];
			medication.randomDoseDate = [rDoseDate1, rDoseDate2, rDoseDate3];
			medication.randomDoseTime = [rDoseTime1, rDoseTime2, rDoseTime3];
			medication.frequency = frequency;
			medication.doseInterval = doseInterval;
			medication.numOfDoses = doseNumber,
			medication.discontinuationDate = discDate;
			medication.discontinuationTime = discTime;
			medication.pharmacistVerification = vStatus;
			medication.cosign = cosign;
			medication.status = status;
			medication.remarks = remarks;
			medication.nebList = nebList;

			medication.save()

			MARCase.findOne({_id: medication.caseId}).then(marCase=>{
				res.redirect(`/master/mar-management/${marCase.patientId}/#medication`)
			})
		})
	}
})

// Sliding scale
// Used for insulin cases when sliding scale is applied instead of dose
router.get('/slidingScale/:scaleId', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	MARSlidingScale.find({scaleId: req.params.scaleId}).then(scale=>{
		res.render("mar/slidingScale/slidingScaleMaster",{
			scaleId: req.params.scaleId,
			scale: scale,
			toaster: req.session.toaster,
		})
		req.session.toaster = null;
	})
})

// Sliding scale
router.post('/addScaleRow/:scaleId', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	let {BG, add} = req.body;
	
	MARSlidingScale.find({scaleId: req.params.scaleId}).then(result=>{
		new MARSlidingScale({
			index: result.length + 1,
			BG,
			additionalInsulin: add,
			scaleId: req.params.scaleId
		}).save().then(result=>{
			toaster.setSuccessMessage(' ', 'Row added');
			req.session.toaster = toaster;
			res.redirect(`/master/slidingScale/${req.params.scaleId}/#addRow`)
		})
	})
})

// Sliding scale
router.get('/editScale/:Id', ensureAuthenticated, ensureAuthorised,(req,res) =>{

	MARSlidingScale.findOne({_id: req.params.Id}).then(result=>{
		res.render("mar/slidingScale/editSlidingScaleMaster",{
			row: result
		})
	})
})

// Sliding scale
router.post('/editScale/:Id', ensureAuthenticated, ensureAuthorised,(req,res) =>{
	let {BG, add} = req.body;

	MARSlidingScale.findOne({_id: req.params.Id}).then(scale=>{
		scale.BG = BG;
		scale.additionalInsulin = add;
		scale.save();

		toaster.setSuccessMessage(' ', 'Row Updated');
		req.session.toaster = toaster;
		res.redirect(`/master/slidingScale/${scale.scaleId}`)
	})
})

// Sliding scale
router.get('/deleteScale/:id', ensureAuthenticated, ensureAuthorised,(req,res) =>{

	MARSlidingScale.findOneAndDelete({_id: req.params.id}).then(result=>{
		toaster.setSuccessMessage(' ', 'Row Deleted');
		req.session.toaster = toaster;
		res.redirect(`/master/slidingScale/${result.scaleId}`)
	})
})

// New storage for excel files
var excelStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/assets/excel')
	},
	filename: function (req, file, cb) {
		var ext = file.mimetype.split('/')[1];
		cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
	}
})

//Ensures only picture format can be uploaded
// Note that file will not be uploaded to server if mime type does not match excel formats
var excelFilter = (req, file, cb) => {
	// Check mimetype for excel files only .xlsx or .xls
	if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === "application/vnd.ms-excel") {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

var excelUpload = multer({ storage: excelStorage, fileFilter: excelFilter })

// Drug list
router.get('/drug-list', ensureAuthenticated, ensureAuthorised,(req,res)=>{

	DrugList.find().then(drugList=>{

		DrugRoutes.find().then(drugRoutes=>{


			DrugFreq.find().then(drugFreq =>{
				res.render('mar/management/drug-list',
				{
					drugList: drugList,
					drugRoutes: drugRoutes,
					drugFreq: drugFreq,
					toaster: req.session.toaster
				})
				req.session.toaster = null; // reset toaster
			})
		})
	})
})

// Drug list
router.post('/uploadExcelFile', excelUpload.single('myFile'), ensureAuthenticated, ensureAuthorised, (req, res, next) => {
	const file = req.file
	if (!file) {
		// When file type is incorrect
		toaster.setErrorMessage(' ', 'Invalid File');
		req.session.toaster = toaster;
		res.redirect('/master/drug-list/#upload')
	}
	else{
		// Add data into collection before flushing
		// Cheat way to avoid errors
		new DrugFreq({
			frequency: "Test",
		}).save().then(r =>{
			DrugFreq.collection.drop().then(r=>{
				readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet:'Frequency'}).then((rows) => {
					rows.forEach(element => {
						new DrugFreq({
							frequency: element[0]
						}).save()
					});
				})
			})
		})

		new DrugRoutes({
			route: "Test",
		}).save().then(r =>{
			DrugRoutes.collection.drop().then(r=>{
				readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet:'Routes'}).then((rows) => {
					rows.forEach(element => {
						new DrugRoutes({
							route: element[0]
						}).save()
					});
				});
			})
		})

		new DrugList({
			drug: "Test",
			medicationName: "Test",
			strength: "Test",
			preparation: "Test"
		}).save().then(r =>{
			DrugList.collection.drop().then(r =>{
				readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet:'Full Drug List'}).then((rows) => {
					rows.shift();
					rows.forEach(element => {
						
						let generator = new standardID("AA00");
						let newID = generator.generate();

						new DrugList({
							drug: element[0],
							medicationName: element[1],
							strength: element[2],
							preparation: element[3],
							barcodeId: newID
							
						}).save()

					});
				}).then(r=>{
					toaster.setSuccessMessage(' ', 'Drug List Added');
					req.session.toaster = toaster;
					res.redirect('/master/drug-list/#drugList')
				})
			});
		})
	}
})

// Generate barcode
router.get('/viewBarcode/:barcodeId', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	res.render("mar/management/barcode")
})

// Generate CSV summary of case
router.get('/exportCase/:caseId/:filename', ensureAuthenticated, ensureAuthorised, (req, res)=>{
	
	MARPatientMaster.findOne({patientId: req.params.caseId}).then(marPatient=>{

		if(marPatient!= null){

			MARCase.findOne({patientId: marPatient.patientId}).then(marCase=>{
				MARMedication.find({caseId: marCase._id}).then(medications=>{
					DrugList.find().then(drugs=>{
						res.render("mar/management/exportCase",{
							medications: medications,
							drugs: drugs
						})
					})
				})
			})
		}
		else{
			PatientMasterModel.findOne({patientID: req.params.caseId}).then(patient=>{
				MARCase.findOne({patientId: patient.patientID}).then(emrCase=>{
					MARMedication.find({caseId: emrCase._id}).then(medications=>{
						DrugList.find().then(drugs=>{
							res.render("mar/management/exportCase",{
								medications: medications,
								drugs: drugs
							})
						})
					})	
				})
			})
		}
	})
})

// Dose history for particular medication
router.get('/doseHistory/:historyId', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	MedicationHistory.find({historyId: req.params.historyId}).then(history =>{
		res.render("mar/management/doseHistory", {
			history: history,
			historyId: req.params.historyId
		})
	})
})

// Dose history
router.post('/doseHistory/:historyId', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	let {date, time, serve} = req.body;
	
	new MedicationHistory({
		date,
		time,
		servedBy: serve,
		historyId: req.params.historyId
	}).save().then(history=>{
		res.redirect(`/master/doseHistory/${req.params.historyId}#addRow`);
	})
})

// Dose history
router.get('/deleteDoseHistory/:id', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	MedicationHistory.findOneAndDelete({_id: req.params.id}).then(history =>{
		res.redirect(`/master/doseHistory/${history.historyId}`);
	})
})

// Dose history
router.get('/editDoseHistory/:id', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	MedicationHistory.findOne({_id: req.params.id}).then(row =>{
		res.render("mar/management/editDoseHistory", {
			row: row,
		})
	})
})

// Dose history
router.post('/editDoseHistory/:id', ensureAuthenticated, ensureAuthorised,(req, res)=>{
	let {date, time, serve} = req.body;

	MedicationHistory.findOne({_id: req.params.id}).then(history =>{
		history.date = date;
		history.time = time;
		history.servedBy = serve;

		history.save();

		res.redirect(`/master/doseHistory/${history.historyId}`);
	})
})


//emergency notes
router.get('/ednotes/:patientID', ensureAuthenticated, (req, res) =>{

	// userType = req.user.userType == 'student';
	// if (req.user.userType == 'staff')
	// {
	// 	userType = 'student';
	// }

	PatientMasterModel.findOne({
		patientID: req.params.patientID  //gets current user??
	})
	.then(retrievedPatient => {
		if(JSON.stringify(retrievedPatient.user._id) === JSON.stringify(req.user.id)){
			EDNotesModel.findById(retrievedPatient.EDNotes_ID, {
			}).then(ednotes => {
				req.session.ednotes = ednotes;
				res.render('patient/master/ednotes', {
					ednotes: ednotes,
					patient: retrievedPatient,
					user: req.user,
					currentUserType: req.user.userType,
					showMenu: true
				});
			});
		}else{
			console.log('User that created record is different from this user')
			toaster.setErrorMessage(' ', 'User that created record is different from this user');
			res.redirect('/master/master-list-patients');
			// if("{{currentUserType}}" == 'staff'){
			// 	res.redirect('/master/master-list-patients');
			// }else{
			// 	res.redirect('/student/student-list-patients');
			// }
		}
	});
});

router.put('/save-ednotes/:patientID/:EDNotes_ID', ensureAuthenticated, (req, res) => {
	EDNotesModel.findByIdAndUpdate(
		req.params.EDNotes_ID,
		req.body,
		{new: true},
		(err, ednotes) => {
			// Handle any possible database errors
			if (err) {
				return res.status(500).send(err);
			}
			toaster.setSuccessMessage(' ', 'EDNotes Updated');
			res.render('patient/master/ednotes', {
				ednotes: ednotes,
				patient: req.session.patient,
				user: req.user,
				toaster,
				showMenu: true
			});
		}

	);
});

router.get('/opprocedure/post-op-procedure-notes/:patientID', ensureAuthenticated, (req, res) => {
	PatientMasterModel.findOne({
		patientID: req.params.patientID
	})
	.then(retreivePatient => {
		if(JSON.stringify(retreivePatient.user._id) === JSON.stringify(req.user.id)){
			postopProcedureNotesModel.findById(retreivePatient.PostOp_ProcedureNotesID, {
			}).then(postopProNotes => {
				req.session.postopProNotes = postopProNotes;
				res.render('patient/master/postop-procedurenotes', {
					postopProNotes: postopProNotes,
					patient: retreivePatient,
					user: req.user,
					currentUserType: req.user.userType,
					showMenu: true
				});
			})
		}else{
			console.log('unable to access post-op procedure notes');
			res.redirect('/master/master-list-patients');
		}
	});
});

router.put('/save-postopprocedurenotes/:patientID/:PostOp_ProcedureNotesID', ensureAuthenticated, (req, res) => {
	postopProcedureNotesModel.findByIdAndUpdate(
		req.params.PostOp_ProcedureNotesID,
		req.body,
		{new: true},
		(err, postopProNotes) => {
			if(err){
				return res.status(500).send(err);
			}
			toaster.setSuccessMessage(' ', 'Operation Report Updated');
			res.render('patient/master/postop-procedurenotes', {
				postopProNotes: postopProNotes,
				patient: req.session.patient,
				user: req.user,
				toaster,
				showMenu: true
			});
		}
	);
});

//building upload staff list in progress 

router.get('/staff-list', ensureAuthenticated, ensureAuthorised,(req,res)=>{
	StaffList.find().then(staffList => {
		res.render('system-management/staff-list',
		{
			staffList: staffList,
			toaster: req.session.toaster
		})
		req.session.toaster = null;
	})
});

router.post('/uploadStaffExcelFile', excelUpload.single('myFile'), ensureAuthenticated, ensureAuthorised, (req, res, next) => {
	const file = req.file
	if (!file) {
		// When file type is incorrect
		toaster.setErrorMessage(' ', 'Invalid File');
		req.session.toaster = toaster;
		res.redirect('/master/staff-list/#upload')
	}
	else{
		new StaffList({
			staffname: "Test",
			staffemail: "Test",
		}).save().then(r =>{
			StaffList.collection.drop().then(r =>{
				var XLSX = require('xlsx');
				var workbook = XLSX.readFile('C:/staffList/staff list.xlsx');
				var sheet_name_list = workbook.SheetNames;
				console.log("names of all sheets in selected excel file: ", sheet_name_list);
				sheet_name_list.forEach(function(eachSheetName){
				console.log("==================================");
					readXlsxFile(`./public/assets/excel/${file.filename}`, {getSheets: true}).then((getSheetNames) => {
						readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet: eachSheetName}).then((rows) => {
						console.table(getSheetNames);
						console.log("name of each wbk sheet: ", getSheetNames);
						console.log("===================================")
						console.log(rows);
						rows.shift();
						rows.forEach(element => {
						
						// let generator = new standardID("AA00");
						// let newID = generator.generate();

						new StaffList({
							staffname: element[0],
							staffemail: element[1]
							}).save()
						},
						console.log(rows),
						console.table(rows)
						);
						}).then(r=>{
							toaster.setSuccessMessage(' ', 'List Added');
							req.session.toaster = toaster;
							res.redirect('/master/staff-list/#staffList')
						})
					});
				});
			});
		})
	}
});

router.get('/student-list', ensureAuthenticated, ensureAuthorised, (req, res) => {
	ModuleList.find().then(moduleList=> {
		StudentList.find().then(studentList => {
			res.render('system-management/student-list',
			{
				studentList: studentList,
				moduleList: moduleList,
				toaster: req.session.toaster
			})
			req.session.toaster = null;
		})	
	})
});

router.post('/uploadStudentExcelFile', excelUpload.single('myFile'), ensureAuthenticated, ensureAuthorised, (req, res, next) => {
	const file = req.file
	if (!file) {
		// When file type is incorrect
		toaster.setErrorMessage(' ', 'Invalid File');
		req.session.toaster = toaster;
		res.redirect('/master/student-list/#upload')
	}
	else{
		new StudentList({
			studmoduleCode: "Test",
			studmoduleGroup: "Test",
			schoolCode: "Test",
			studacadyearIntake: "Test",
			sem: "Test",
			studtutMentorGrp: "Test",
			studadmNo: "Test",
			studName: "Test",
			studemail: "Test"
		}).save().then(r =>{
			// var sheetnames = ["Full Student List", "Other student list"]
			// var workbookused = XLSX.readFile('formstudent.xlsx');
			// var workbksheets = workbookused.Sheets;
			StudentList.collection.drop().then(r =>{
				// var sheetnames = ['Full Student List', 'Other student list', 'studlist2'];
				// var sheetnames = readXlsxFile(`./public/assets/excel/${'formstudent'}`, {getSheets: true});
				// console.log("namesssss: ", sheetnames);
				var XLSX = require('xlsx');
				var workbook = XLSX.readFile('C:/studentList/student list.xlsx');
				// console.log("dir name: ", __dirname);
				// var workbook = XLSX.readFile(__dirname + req.url);
				var sheet_name_list = workbook.SheetNames;
				console.log("names of all sheets in selected excel file: ", sheet_name_list);
				// var inputcode = document.getElementById('modcodeinput');
				sheet_name_list.forEach(function(eachSheetName){
				// console.log(eachSheetName);
				console.log("==================================");
				readXlsxFile(`./public/assets/excel/${file.filename}`, {getSheets: true}).then((getSheetNames) => {
					readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet: eachSheetName}).then((rows) => {
						// readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet: 'Other student list'}).then((rows2) => {
						console.table(getSheetNames);
						console.log("name of each wbk sheet: ", getSheetNames);
						console.log("===================================")
						console.log(rows);
						rows.shift();
						rows.forEach(element => {
							new StudentList({
								studmoduleCode: element[0],
								studmoduleGroup: element[1],
								schoolCode: element[2],
								studacadyearIntake: element[3],
								sem: element[4],
								studtutMentorGrp: element[5],
								studadmNo: element[6],
								studName: element[7],
								studemail: element[8]
							}).save()
							//retrieve mod code 
							// var modcode = element[0];
							// console.log("mod code2: ", modcode);
						});
					}).then(r=>{
						toaster.setSuccessMessage(' ', 'List Added');
						req.session.toaster = toaster;
						res.redirect('/master/student-list/#studentList')
					})
				});
				});
			});
			// });
		})
	}
});

router.get('/manual-list', ensureAuthenticated, (req, res) => {
	res.render('system-management/manual-list');
});

router.post('/upload-particulars-staff', ensureAuthenticated, (req, res)=>{
	let{
		staffname, staffemail
	} = req.body;

	new StaffList({
		staffname,
		staffemail
	}).save()
	.then((uploadedInfo) => {
		toaster.setSuccessMessage(' ', 'Particulars Added');
		req.session.toaster = toaster;
		res.render('system-management/manual-list',{
			toaster
		});	
		req.session.toaster = null;
	});
});

router.post('/upload-particulars-student', ensureAuthenticated, (req, res) => {
	let{
		studName, studadmNo, studemail, studmoduleCode, studmoduleGroup,
		schoolCode, studacadyearIntake, sem, studtutMentorGrp
	} = req.body;

	new StudentList({
		studName,
		studadmNo,
		studemail,
		studmoduleCode,
		studmoduleGroup,
		schoolCode,
		studacadyearIntake,
		sem,
		studtutMentorGrp
	}).save()
	.then((uploadedStudInfo) => {
		toaster.setMessage(' ', 'Particulars Added');
		req.session.toaster;
		res.render('system-management/manual-list', {
			toaster
		});
		req.session.toaster = null;
	});
});

router.get('/module-list', ensureAuthenticated, (req, res) => {
	ModuleList.find().then(moduleList => {
		res.render('system-management/module-list',
		{
			moduleList: moduleList,
			toaster: req.session.toaster
		})
		req.session.toaster = null;
	})
});

router.post('/uploadModuleExcelFile', excelUpload.single('myFile'), ensureAuthenticated, ensureAuthorised, (req, res, next) => {
	const file = req.file
	if (!file) {
		// When file type is incorrect
		toaster.setErrorMessage(' ', 'Invalid File');
		req.session.toaster = toaster;
		res.redirect('/master/module-list/#upload')
	}
	else{
		new ModuleList({
			courseCode: "Test",
			moduleCode: "Test",
			modulecourseDescriptn: "Test",
		}).save().then(r =>{
			ModuleList.collection.drop().then(r =>{
				var XLSX = require('xlsx');
				var workbook = XLSX.readFile('C:/modList/module list.xlsx');
				var sheet_name_list = workbook.SheetNames;
				console.log("names of all sheets in selected excel file: ", sheet_name_list);
				sheet_name_list.forEach(function(eachSheetName){
				console.log("==================================");
				readXlsxFile(`./public/assets/excel/${file.filename}`, {getSheets: true}).then((getSheetNames) => {
					readXlsxFile(`./public/assets/excel/${file.filename}`, {sheet: eachSheetName}).then((rows) => {
					console.table(getSheetNames);
					console.log("name of each wbk sheet: ", getSheetNames);
					console.log("===================================")
					console.log(rows);
					rows.shift();
					rows.forEach(element => {
						let generator = new standardID("AAA00");
						let modID = generator.generate();

						new ModuleList({
							courseCode: element[0],
							moduleCode: element[1],
							modulecourseDescriptn: element[2],
							moduleID: modID
						}, console.log("mod code: ", ModuleList.courseCode)).save()
					});
					}).then(r=>{
						toaster.setSuccessMessage(' ', 'Module List Added');
						req.session.toaster = toaster;
						res.redirect('/master/module-list/#moduleList')
					})
				});
			});
		});
		})
	}
});

router.get('/create-user-acct', ensureAuthenticated, (req, res) => {
	res.render('system-management/create-user-acct');
});

router.get('/enrol-user', ensureAuthenticated, (req, res) => {
	ModuleList.find().then(moduleList => {
		res.render('system-management/enrol-user',
		{
			moduleList: moduleList
		})
	})
});

router.get('/delete-user', ensureAuthenticated, (req, res) => {
	res.render('system-management/delete-user');
});

module.exports = router;
