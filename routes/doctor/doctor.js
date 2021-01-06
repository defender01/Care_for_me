const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {
    forgotpassHandler,
    postResetPass,
    postResetPassDoctor,
    emailVerificationLinkGenerator,
    checkEmailNotVerified,
    emailVerificationHandler,
    checkNotAuthenticated,
    checkAuthenticated,
    checkAuthenticatedDoctor,
} = require("../../controllers/auth_helper");
// Load User model
const User = require("../../models/userInfo");
const { session } = require("passport");
const Doctor = require("../../models/doctor").doctorModel;

let checkNotNull = (val) => {
    return typeof val !== "undefined" && val !== "" && val !== null;
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
router.get('/patients', (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    res.render('patients', {navDisplayName, userRole})
  })
  
  router.get('/patients/records', (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    res.render('patientRecords', {navDisplayName, userRole})
  })

// this provides new id
router.get('/getNewId', (req, res) => {
    res.send({ id: new mongoose.Types.ObjectId() })
})
  

router.use("/profile", require("./profile.js"))
router.use("/followupQues", require("./followup.js"))

module.exports = router