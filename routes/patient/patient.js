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
// Load Patient model
const Patient = require("../../models/patient");
const { session } = require("passport");

let checkNotNull = (val) => {
  return typeof val !== "undefined" && val !== "" && val !== null;
};

// resetpassword
router.get("/resetpassword", checkAuthenticated, (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    let role = req.user.role
    res.render("resetPass", {userRole, navDisplayName, role});
});

router.post("/resetpassword", checkAuthenticated, postResetPass);

router.get(
    "/accountVerification",
    checkAuthenticated,
    checkEmailNotVerified,
    async (req, res) => {
        let navDisplayName = req.user.name.displayName;
        let userRole = req.user.role
        let fullName = req.user.name.firstName + " " + req.user.name.lastName;
        let userEmail = req.user.email;
        let role = req.user.role;
        res.render("accountVerification", {
            navDisplayName,
            userRole,
            fullName,
            userEmail,
            role,
        });
    }
);

router.post(
  "/accountVerification",
  checkAuthenticated,
  emailVerificationLinkGenerator
);

router.get(
  "/notifications",
  checkAuthenticated,
  checkEmailVerified,
  (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    res.render('patientNotifications', {navDisplayName, userRole})
  }
);

router.get('/records', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  res.render('patientRecords', {navDisplayName, userRole})
})

// this provides new id
router.get("/getNewId", (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

router.use("/profile", require("./profile.js"));

module.exports = router;
