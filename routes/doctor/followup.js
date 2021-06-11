const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require("util");
const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkAuthenticatedDoctor,
  checkEmailVerified,
} = require("../../controllers/auth_helper");

const {
  parameterModel,
  followupModel,
  followupQuesModel,
  followupQuesAnsModel,
} = require("../../models/followup");
const Patient = require("../../models/patient");

const {
  checkNotNull,
  calculateUnseenNotifications,
  preprocessData,
} = require("../../controllers/functionCollection");

router.get(
  "/assign",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let pId = req.query.pId;
    // console.log({pId})
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    try {
      let parameters = await parameterModel.find({});
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );
      res.render("followupQues", {
        navDisplayName,
        userRole,
        parameters,
        totalUnseenNotifications,
        pId,
      });
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.get(
  "/assign/continue",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let pId = req.query.pId;
    // console.log({pId})
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    try {
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );
      res.render("followupQuesContinue", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        pId,
      });
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.post(
  "/assign/continue",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let pId = req.query.pId;
    // console.log({pId})
    preprocessData(req.body);
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    let data = req.body;
    let qIds = data.questionId;
    let questionIds = [];
    let recordStartDate, recordEndDate;
    // console.log({data})
    try {
      if (checkNotNull(qIds)) {
        qIds = Array.isArray(qIds) ? qIds : [qIds];
        for (let i = 0; i < qIds.length; i++) {
          let qId = qIds[i];
          // console.log(data['startDate'+qId])

          // date by default have hour value of 6h so manually have to set hour value to 0h
          data['startDate'+qId] = new Date(data['startDate'+qId])
          data['startDate'+qId].setHours(0,0,0)
          data['endDate'+qId] = new Date(data['endDate'+qId])
          data['endDate'+qId].setHours(0,0,0)

          console.log(data['startDate'+qId].toString())
          console.log(data['startDate'+qId].toDateString())
          
          if (i == 0) {
            recordStartDate = data["startDate" + qId];
            recordEndDate = data["endDate" + qId];
          } else {
            recordStartDate = Math.min(
              recordStartDate,
              data["startDate" + qId]
            );
            recordEndDate = Math.max(
              recordEndDate,
              data["endDate" + qId]
            );
          }
          let question = new followupQuesModel({
            id: qId,
            inputType: data["inputType" + qId],
            name: data["name" + qId],
            maxVal: data["maxVal" + qId],
            minVal: data["minVal" + qId],
            duration: {
              startDate: data["startDate" + qId],
              endDate: data["endDate" + qId],
            },
            frequency: data["frequency" + qId],
          });
          await question.save();
          questionIds.push(question.id);
        }
        let followupRecord = new followupModel({
          doctorId: req.user._id,
          patientId: pId,
          questions: questionIds,
          recordStartDate: recordStartDate,
          recordEndDate: recordEndDate,
        });
        await followupRecord.save();
        // console.log(util.inspect( {followupRecord} , false, null, true /* enable colors */));
      }
      // console.log(util.inspect( {questions} , false, null, true /* enable colors */));
      res.redirect(`/doctor/followupQues/records?pId=${pId}`);
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.get(
  "/records",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    const LIMIT = 10;
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    try {
      let { pId, followupStatus, page } = req.query;
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );

      page = parseInt(typeof page != "undefined" ? page : 1);
      followupStatus =
        typeof followupStatus != "undefined" ? followupStatus : [];
      followupStatus = Array.isArray(followupStatus)
        ? followupStatus
        : [followupStatus];

      let paginationUrl = req.originalUrl.toString();
      if (paginationUrl.includes(`page=`))
        paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
      else {
        paginationUrl = paginationUrl.includes("?")
          ? `${paginationUrl}&page=`
          : `${paginationUrl}?page=`;
      }

      let queryForFollowupRecords = {
        doctorId: req.user._id,
        patientId: pId,
      };
      let currentDate = Date.now();
      if (followupStatus.length) {
        let followupStatusQuery = [];
        if (followupStatus.includes("Upcoming"))
          followupStatusQuery.push({
            recordStartDate: { $gt: currentDate },
          });
        if (followupStatus.includes("Ended"))
          followupStatusQuery.push({
            recordEndDate: { $lt: currentDate },
          });
        if (followupStatus.includes("Running"))
          followupStatusQuery.push({
            recordStartDate: { $lte: currentDate },
            recordEndDate: { $gte: currentDate },
          });
        queryForFollowupRecords["$or"] = followupStatusQuery;
      }

      let followupRecords = await followupModel
        .find(queryForFollowupRecords)
        .sort({ created: -1 })
        .limit(LIMIT)
        .skip(LIMIT * (page - 1));

      let formattedFollowupRecords = followupRecords.map((element, index) => {
        let instance = {
          _id: element._id,
          index: (LIMIT * (page - 1)) + index + 1,
          startDate: element.recordStartDate.toDateString(),
          endDate: element.recordEndDate.toDateString(),
          followupStatus: '',
          totalQuestions: element.questions.length
        }
        if(currentDate < element.recordStartDate) instance.followupStatus = 'Upcoming'
        else if(currentDate > element.recordEndDate) instance.followupStatus = 'Ended'
        else instance.followupStatus = 'Running'

        return instance
      }) 

      const totalItems = await followupModel.countDocuments(
        queryForFollowupRecords
      );

      let patientInfo = await Patient.findOne(
        {
          _id: pId,
        },
        "_id name"
      );

      // console.log(util.inspect( {followupRecords} , false, null, true /* enable colors */));
      res.render("doctorPatientRecords", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        patientInfo,
        formattedFollowupRecords,
        followupStatus,
        currentPage: page,
        hasNextPage: page * LIMIT < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / LIMIT),
        URL: paginationUrl
      });
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.get(
  "/questions",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    try {
      let { pId, recordId, recordInd, followupStatus} = req.query;
      // console.log({ recordId, recordInd });
      
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );

      followupStatus =
        typeof followupStatus != "undefined" ? followupStatus : [];
      followupStatus = Array.isArray(followupStatus)
        ? followupStatus
        : [followupStatus];

      let queryForFollowUpQuestions = {};
      let currentDate = Date.now();

      if (followupStatus.length) {
        let followupStatusQuery = [];
        if (followupStatus.includes("Upcoming"))
          followupStatusQuery.push({
            "duration.startDate": { $gt: currentDate },
          });
        if (followupStatus.includes("Ended"))
          followupStatusQuery.push({
            "duration.endDate": { $lt: currentDate },
          });
        if (followupStatus.includes("Running"))
          followupStatusQuery.push({
            "duration.startDate": { $lte: currentDate },
            "duration.endDate": { $gte: currentDate },
          });
        queryForFollowUpQuestions["$or"] = followupStatusQuery;
      }

      let followupRecord = await followupModel
      .findOne({
        _id: recordId,
      })
      .populate({
        path: "questions",
        match: queryForFollowUpQuestions,
        select: "name duration answers"
      })
      .exec();

      let followupQuestions = followupRecord.questions.map((element, index) => {
        let instance = {
          _id: element._id,
          index: index + 1,
          name: element.name,
          startDate: element.duration.startDate.toDateString(),
          endDate: element.duration.endDate.toDateString(),
          followupStatus: '',
          totalResponses: element.answers.length
        }
        if(currentDate < element.duration.startDate) instance.followupStatus = 'Upcoming'
        else if(currentDate > element.duration.endDate) instance.followupStatus = 'Ended'
        else instance.followupStatus = 'Running'

        return instance
      }) 

      let patientInfo = await Patient.findOne(
        {
          _id: pId,
        },
        "_id name"
      );


      // console.log(
      //   util.inspect({ followupRecord }, false, null, true /* enable colors */)
      // );

      res.render("doctorPatientRecordsQues", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        patientInfo,
        followupQuestions,
        recordInd,
        followupStatus,
      });

    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

// With pagination 
// Will be used if pagination is required in that page 
// router.get(
//   "/questions",
//   checkAuthenticatedDoctor,
//   checkEmailVerified,
//   async (req, res) => {
//     const LIMIT = 10
//     let navDisplayName = req.user.name.displayName;
//     let userRole = req.user.role;
//     try {
//       let { pId, recordId, recordInd, followupStatus, page } = req.query;
//       // console.log({ recordId, recordInd });
      
//       const totalUnseenNotifications = await calculateUnseenNotifications(
//         req.user._id,
//         userRole
//       );

//       page = parseInt(typeof page != "undefined" ? page : 1);
//       followupStatus =
//         typeof followupStatus != "undefined" ? followupStatus : [];
//       followupStatus = Array.isArray(followupStatus)
//         ? followupStatus
//         : [followupStatus];

//       let paginationUrl = req.originalUrl.toString();
//       if (paginationUrl.includes(`page=`))
//         paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
//       else {
//         paginationUrl = paginationUrl.includes("?")
//           ? `${paginationUrl}&page=`
//           : `${paginationUrl}?page=`;
//       }

//       let queryForFollowUpQuestions = {};
//       let currentDate = Date.now();

//       if (followupStatus.length) {
//         let followupStatusQuery = [];
//         if (followupStatus.includes("Upcoming"))
//           followupStatusQuery.push({
//             "duration.startDate": { $gt: currentDate },
//           });
//         if (followupStatus.includes("Ended"))
//           followupStatusQuery.push({
//             "duration.endDate": { $lt: currentDate },
//           });
//         if (followupStatus.includes("Running"))
//           followupStatusQuery.push({
//             "duration.startDate": { $lte: currentDate },
//             "duration.endDate": { $gte: currentDate },
//           });
//         queryForFollowUpQuestions["$or"] = followupStatusQuery;
//       }

//       let followupRecord = await followupModel
//       .findOne({
//         _id: recordId,
//       })
//       .populate({
//         path: "questions",
//         match: queryForFollowUpQuestions,
//         select: "name duration answers",
//         options: { 
//           limit: LIMIT,
//           skip: LIMIT * (page - 1) 
//         }
//       })
//       .exec();

//       const recordWithAllQuestions = await followupModel
//       .findOne({
//         _id: recordId,
//       })
//       .populate({
//         path: "questions",
//         match: queryForFollowUpQuestions,
//         select: "_id",
//       })
//       .exec();

//       const totalItems = recordWithAllQuestions.questions.length;

//       let followupQuestions = followupRecord.questions.map((element, index) => {
//         let instance = {
//           _id: element._id,
//           index: (LIMIT * (page - 1)) + index + 1,
//           name: element.name,
//           startDate: element.duration.startDate.toDateString(),
//           endDate: element.duration.endDate.toDateString(),
//           followupStatus: '',
//           totalResponses: element.answers.length
//         }
//         if(currentDate < element.duration.startDate) instance.followupStatus = 'Upcoming'
//         else if(currentDate > element.duration.endDate) instance.followupStatus = 'Ended'
//         else instance.followupStatus = 'Running'

//         return instance
//       }) 

//       let patientInfo = await Patient.findOne(
//         {
//           _id: pId,
//         },
//         "_id name"
//       );


//       console.log(
//         util.inspect({ followupRecord }, false, null, true /* enable colors */)
//       );

//       res.render("doctorPatientRecordsQues", {
//         navDisplayName,
//         userRole,
//         totalUnseenNotifications,
//         patientInfo,
//         followupQuestions,
//         recordInd,
//         followupStatus,
//         currentPage: page,
//         hasNextPage: page * LIMIT < totalItems,
//         hasPreviousPage: page > 1,
//         nextPage: page + 1,
//         previousPage: page - 1,
//         lastPage: Math.ceil(totalItems / LIMIT),
//         URL: paginationUrl
//       });

//     } catch (err) {
//       return res.render("404", {
//         navDisplayName,
//         userRole,
//         error: err.message,
//       });
//     }
//   }
// );

router.get(
  "/questionAns",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    let {recordInd, qId} = req.query
    console.log({qId})
    try {
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );

      let question = await followupQuesModel.findOne({
        _id: qId
      }).populate({
        path: "answers",
        options: {sort:{"_id":-1}} //source https://stackoverflow.com/questions/11512965/mongoose-sort-query-by-populated-field
      })

      res.render("doctorPatientRecordsQuesAns", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        recordInd,
        question,
      });
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.post(
  "/deleteRecord",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let { recordId } = req.body;
    console.log({ recordId });
    try {
      let followupRecord = await followupModel.findOne({ _id: recordId });

      for (let qId of followupRecord.questions) {
        let question = await followupQuesModel.findOne({ _id: qId });

        for (let aId of question.answers) {
          await followupQuesAnsModel.deleteOne({ _id: aId });
        }

        await followupQuesModel.deleteOne({ _id: qId });
      }

      await followupModel.deleteOne({ _id: recordId });
      return res.send({ status: true });
    } catch (err) {
      console.log(err.message);
      return res.send({ status: false });
    }
  }
);

module.exports = router;
