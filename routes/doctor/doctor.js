const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {
    forgotpassHandler,
    postResetPass,
    postResetPassDoctor,
    emailVerificationLinkGenerator,
    checkEmailVerified,
    checkEmailNotVerified,
    emailVerificationHandler,
    checkNotAuthenticated,
    checkAuthenticated,
    checkAuthenticatedDoctor,
    checkAuthenticatedDoctorForAjax,
    checkEmailVerifiedForAjax,
} = require("../../controllers/auth_helper");
// Load Patient model
const Patient = require("../../models/patient");
const { session } = require("passport");
const Doctor = require("../../models/doctor").doctorModel;
const DoctorPatient = require("../../models/doctorPatient").doctorPatientModel;
const e = require("express");

let checkNotNull = (val) => {
    return typeof val != "undefined" && val != "" && val != null;
};

router.get("/resetpassword", checkAuthenticatedDoctor, (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    let role = req.user.role
    res.render("resetPass", { navDisplayName, userRole, role });
});

router.post(
    "/resetpassword",
    checkAuthenticatedDoctor,
    postResetPassDoctor
);

router.get(
    "/accountVerification",
    checkAuthenticatedDoctor,
    checkEmailNotVerified,
    async (req, res) => {
        let navDisplayName = req.user.name.displayName;
        let fullName = req.user.name.firstName + " " + req.user.name.lastName;
        let userEmail = req.user.email;
        let userRole = req.user.role
        let role = req.user.role;
        res.render("accountVerification", {
            navDisplayName,
            fullName,
            userEmail,
            userRole,
            role
        });
    }
);


router.post(
    "/accountVerification",
    checkAuthenticatedDoctor,
    emailVerificationLinkGenerator
);

// patient list page
router.get('/patients', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
    const LIMIT = 10
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    const page = parseInt((typeof req.query.page != 'undefined') ? req.query.page : 1)
    
    const doctorPatients = await DoctorPatient
        .find({}, 'patient recordCount')
        .limit(LIMIT)
        .skip(LIMIT * (page - 1))

    const totalItems = await DoctorPatient.countDocuments();
    // console.log(doctorPatients)
    let patientDesk = []

    doctorPatients.forEach((element) => {
        let instance = {
            _id: element.patient._id,
            name: element.patient.name,
            email: element.patient.email,
            phoneNumber: element.patient.phoneNumber,
            gender: element.patient.gender,
            recordCount: `${element.recordCount} Records`,
            exists: true
        }
        patientDesk.push(instance)
    })
    // console.log(patientDesk)

    let paginationUrl = req.originalUrl.toString()
    if(paginationUrl.includes(`page=`)) 
        paginationUrl = paginationUrl.replace(`page=${page}`, 'page=')
    else{
        paginationUrl = (paginationUrl.includes('?')) ? `${paginationUrl}&page=` : `${paginationUrl}?page=`
    }

    return res.render('doctorPatients', {
        navDisplayName,
        userRole,
        patientDesk,
        currentPage: page,
        hasNextPage: page * LIMIT < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / LIMIT),
        URL: paginationUrl
    });
})

router.get('/patients/records', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    res.render('doctorPatientRecords', { navDisplayName, userRole })
})

router.get('/patients/searchResults', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
    // console.log(req.query)
    const LIMIT = 10
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role

    let {
        searchKey,
        searchOption,
        searchFilter,
        page
    } = req.query

    page = parseInt((typeof page != 'undefined') ? page : 1)
    searchKey = (typeof searchKey != 'undefined') ? searchKey.toString().trim() : searchKey

    let paginationUrl = req.originalUrl.toString()
    if(paginationUrl.includes(`page=`)) 
        paginationUrl = paginationUrl.replace(`page=${page}`, 'page=')
    else{
        paginationUrl = (paginationUrl.includes('?')) ? `${paginationUrl}&page=` : `${paginationUrl}?page=`
    }

    if (!checkNotNull(searchKey) || typeof searchOption == 'undefined') {
        let searchResults = []

        return res.render('doctorPatients', {
            navDisplayName,
            userRole,
            searchResults,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            nextPage: 1,
            previousPage: 1,
            lastPage: 1,
            URL: paginationUrl
        });
    }

    searchFilter = (typeof searchFilter != 'undefined') ? searchFilter : []
    searchFilter = (Array.isArray(searchFilter)) ? searchFilter : [searchFilter]

    let genderFilter = []
    if (searchFilter.includes('male')) genderFilter.push('male')
    if (searchFilter.includes('female')) genderFilter.push('female')

    let queryForDoctorPatients = { 'doctor._id': req.user._id }
    if (genderFilter.length) queryForDoctorPatients['patient.gender'] = { $in: genderFilter }
    if (searchOption == 'name') queryForDoctorPatients['patient.name'] = { $regex: `${searchKey}`, $options: 'i' }
    else queryForDoctorPatients[`patient.${searchOption}`] = searchKey
    // console.log(queryForDoctorPatients)

    try {
        if (searchFilter.includes('followupRunning')) {
            const doctorPatients = await DoctorPatient
                .find(queryForDoctorPatients, 'patient recordCount')
                .limit(LIMIT)
                .skip(LIMIT * (page - 1))

            const totalItems = await DoctorPatient.countDocuments(queryForDoctorPatients);

            // console.log(doctorPatients)
            let searchResults = []

            doctorPatients.forEach((element) => {
                let instance = {
                    _id: element.patient._id,
                    name: element.patient.name,
                    email: element.patient.email,
                    phoneNumber: element.patient.phoneNumber,
                    gender: element.patient.gender,
                    recordCount: `${element.recordCount} Records`,
                    exists: true
                }
                searchResults.push(instance)
            })
            // console.log(searchResults)

            return res.render('doctorPatients', {
                navDisplayName,
                userRole,
                searchKey,
                searchOption,
                searchFilter,
                searchResults,
                currentPage: page,
                hasNextPage: page * LIMIT < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / LIMIT),
                URL: paginationUrl
            });

        } else {
            let queryForPatients = {}
            if (genderFilter.length) queryForPatients['gender'] = { $in: genderFilter }
            if (searchOption == 'name') queryForPatients['name.fullName'] = { $regex: `${searchKey}`, $options: 'i' }
            else queryForPatients[`${searchOption}`] = searchKey
            // console.log(queryForPatients)

            let doctorPatients = await DoctorPatient.find(queryForDoctorPatients, 'patient._id recordCount')
            // console.log(doctorPatients)

            let searchedPatients = await Patient
                .find(queryForPatients, 'name.fullName email phoneNumber gender')
                .limit(LIMIT)
                .skip(LIMIT * (page - 1))

            const totalItems = await Patient.countDocuments(queryForPatients);

            let searchResults = []

            searchedPatients.forEach((element) => {
                let idx = doctorPatients.findIndex((x) => {
                    return x.patient._id.toString() == element._id.toString()
                })

                let instance = {
                    _id: element._id,
                    name: element.name.fullName,
                    email: element.email,
                    phoneNumber: element.phoneNumber,
                    gender: element.gender,
                    recordCount: (idx != -1) ? `${doctorPatients[idx].recordCount} Records` : '-',
                    exists: (idx != -1) ? true : false
                }
                searchResults.push(instance)
            })
            // console.log(searchResults)

            return res.render('doctorPatients', {
                navDisplayName,
                userRole,
                searchKey,
                searchOption,
                searchFilter,
                searchResults,
                currentPage: page,
                hasNextPage: page * LIMIT < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / LIMIT),
                URL: paginationUrl
            });
        }
    } catch (err) {
        return res.render('404', { navDisplayName, userRole })
    }
})

router.get(
    "/notifications",
    checkAuthenticatedDoctor,
    checkEmailVerified,
    (req, res) => {
        let navDisplayName = req.user.name.displayName;
        let userRole = req.user.role;
        res.render('doctorNotifications', { navDisplayName, userRole })
    }
);

// this provides new id
router.get('/getNewId', (req, res) => {
    res.send({ id: new mongoose.Types.ObjectId() })
})


router.use("/profile", require("./profile.js"))
router.use("/followupQues", require("./followup.js"))

module.exports = router