var mongoose = require('mongoose');

var medHistory_schema = new mongoose.Schema({
    _dataId: mongoose.Schema.Types.ObjectId,
    email: {type: String},
    updated: { type: Date, default: Date.now },
    birthAndDevHistory: {
        first_sit: {type: String},
        first_walk: {type: String},
        first_speak: {type: String},
        vaccine: [{
            name: {type: String},
            dateTaken: {type: Date}
        }]
    },
    familyInfo:{    
        relativeDiseases: [{ 
            name: {type: String},
            state: {type: String}
        }],
        diseaseDetails: {type: String},
        familyHistory:[{
            relation: {type: String},
            name: {type: String},
            gender: {type: String},
            birthDate: {type: Date},
            health: {type: String},
            psychiatric: {type: String}
        }]
    },
    foodHabit:{
        meals_per_day: {type: String},
        meals_type: {type: String}
    },
    physicalExercise:{
        exercise_types: {type: String},
        exercise_per_week: {type: String}
    },
    smokingHistory:{
        sticks_per_day: {type: String}
    },
    substanceUseHistory: [{
        substanceName: {type: String},
        firstUse: {type: Number},
        quantity: {type: String},
        duration: {type: Number},
        lastUse: {type: String},
        currentUseCheck: {type: String}
    }],
    education:{
        highestEducationalDegree: {type: String},
        specialization:[{
            name: {type: String},
            passingDate: {type: String},
            university: {type: String},
            certifcateLink: {type: String}
        }] 
    },
    occupation:{
        occupationName: {type: String},
        workingHour: {type: Number},
        modeOfWork: {type: String},
        unemploymentReason: {type: String}        
    },
    previousDiseaseDisorder:[{
        name: {type: String},
        state: {type: String},
        details: {type: String}
    }]
});

module.exports = mongoose.model('medHistoryCollection', medHistory_schema);
