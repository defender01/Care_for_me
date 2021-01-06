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
    res.render("resetPass", { navDisplayName, role: "doctor" });
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
        let role = "doctor";
        res.render("accountVerification", {
            navDisplayName,
            fullName,
            userEmail,
            role,
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
    res.render('patients', {navDisplayName})
  })
  
  router.get('/patients/records', (req, res) => {
    let navDisplayName = req.user.name.displayName;
    res.render('patientRecords', {navDisplayName})
  })

  router.get(
    "/notifications",
    checkAuthenticatedDoctor,
    checkEmailVerified,
    (req, res) => {
      let navDisplayName = req.user.name.displayName;
      let userRole = req.user.role;
      res.render('doctorNotifications', {navDisplayName, userRole})
    }
  );

// this provides new id
router.get('/getNewId', (req, res) => {
    res.send({ id: new mongoose.Types.ObjectId() })
})
  

router.use("/profile", require("./profile.js"))
router.use("/followupQues", require("./followup.js"))

module.exports = router