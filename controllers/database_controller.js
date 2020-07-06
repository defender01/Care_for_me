const {vaccineModel, substanceModel, answerModel} = require("../models/inputCollection") 

let substanceCategories = ['Alcohol','Cannabis','Stimulants','Sleeping pills','Opioids','Hallucinogens','Inhalants']
let substanceNames = [["Alcohol"],["Cannabis"],["Yaba","Cocaine"],["Diazepam", "Clonazepam", "Eszopiclone", "Flurazepam", "Lorazepam", "Midazolam", "Diphenhydramine hydrochloride"],["Opium", "Morphine", "Heroin"], ["LSD", "PCP", "MDA", "Mescaline", "Peyote", "Mushrooms", "Ecstasy(MDMA)", "Nitrous oxide"], ["Glue", "Gasoline", "Aerosols", "Paint thinner"]]

let vaccineNames = ["BCG","Pentavalent","PCV","OPV","MR","Measles","TT (Tetanus toxoid)"]
let vaccineDiseases = [["Tuberculosis"],["Diphtheria", "Pertussis", "Tetanus", "Hepatitis B", "Hemophilus Influenza B"],["Pneumococcal Pneumonia"],["Poliomyelitis"],["Measles", "Rubella"],["Measles"],["Tetanus"]]

let saveVaccine = async () =>
{
    // deleting all data from vaccine collection
    await vaccineModel.deleteMany({});

    // Saving vaccines to the vaccine collection
    for(let i=0, max = vaccineNames.length; i<max; i++){
        // console.log(vaccineNames[i] + "  " +vaccineDiseases[i].toString())
        const vaccine = new vaccineModel({
            name: vaccineNames[i],
            diseases: vaccineDiseases[i]
        })

        try{
            await vaccine.save();
        }catch(err){
            console.error(err);
        }
    }
}

let saveSubstance = async () =>
{
    // deleting all data from substance collection
    await substanceModel.deleteMany({});

    // Saving sbustances to the substance collection
    for(let i=0, max = substanceCategories.length; i<max; i++){

        for(let j=0, maxj = substanceNames[i].length; j<maxj; j++){
            // console.log(substanceCategories[i] + "   " + substanceNames[i][j]);
            
            const substance = new substanceModel({
                name: substanceNames[i][j],
                category: substanceCategories[i]
            })

            try{
                await substance.save();
            }catch(err){
                console.error(err);
            }
        }

    }
}

let uploadVaccineAndSubstanceToDB = async (req, res) => {
    
    // // clearing whole vaccine collection and uploading all vaccines to the database
    // await saveVaccine()

    // // clearing whole substance collection and uploading all substances to the database
    // await saveSubstance()

    // return res.json({
    //     msg : "vaccines and substances are uploaded to the database"
    // })

    return res.json({
        msg : "currently not available"
    })
}

let clearWholeAnswerCollection = async (req, res) =>
{
    // await answerModel.deleteMany({})

    // return res.send({
    //     "msg" : "The whole answer collection is cleared."
    // })

    return res.json({
        msg : "currently not available"
    })
}

module.exports = {
    uploadVaccineAndSubstanceToDB,
    clearWholeAnswerCollection
}