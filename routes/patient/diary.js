const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;

const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkEmailVerified,
} = require("../../controllers/auth_helper");

const {
  checkNotNull, 
  calculateUnseenNotifications, 
  preprocessData,
  findTimeDiff
} = require("../../controllers/functionCollection")

const {diaryModel} = require("../../models/diary")


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './resources/diaryPictures',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 10000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).any()

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

async function deleteFile( filePath){
  if(!checkNotNull(filePath)) return
  console.log({filePath})
  try {
    await fs.unlink(filePath);      
    console.log(`successfully deleted ${filePath}`);
  } catch (err) {
    console.log('deleteFile err = ',{err})
    throw new Error(err.message)
  }
}



router.get("/", checkAuthenticated, checkEmailVerified, async (req, res) => {
  const LIMIT = 10;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role;
  let dateNow = new Date()

  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

    let {page} = req.query
    page = parseInt( typeof page != "undefined" ? page : 1);
    
    let queryForDiary = {"patientId": req.user._id};
    
    let diaryData = await diaryModel
      .find(queryForDiary)
      .sort({ created: -1})
      .limit(LIMIT)
      .skip(LIMIT * (page - 1));

    // console.log(util.inspect({diaryData}, false, null, true /* enable colors */))

    for(let diary of diaryData)
    {
      diary['timeDiff'] = findTimeDiff(diary.created, dateNow)
    }

    const totalItems = await diaryModel.countDocuments(queryForDiary);


    let paginationUrl = req.originalUrl.toString();
    if (paginationUrl.includes(`page=`))
      paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
    else {
      paginationUrl = paginationUrl.includes("?")
        ? `${paginationUrl}&page=`
        : `${paginationUrl}?page=`;
    }

    return res.render("patientDiary", {
      navDisplayName,
      userRole,
      totalUnseenNotifications,
      data: diaryData,
      currentPage: page,
      hasNextPage: page * LIMIT < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / LIMIT),
      URL: paginationUrl,
    });
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }

});

router.get("/details", checkAuthenticated, checkEmailVerified, async(req, res) => {
  let navDisplayName = req.user.name.displayName;
  let {dId}= req.query
  let userRole = req.user.role;
  let data
  let dateNow = new Date()

  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    data = await diaryModel.findOne({_id: dId})
    data['timeDiff'] = findTimeDiff(data.created, dateNow)

    // console.log(util.inspect({data}, false, null, true /* enable colors */))
    
    res.render("patientDiaryDetails", {
      navDisplayName,
      userRole,
      totalUnseenNotifications,
      data
    });
  }
  catch(err){
    res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
    return
  }   
});

router.get("/new", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role;

  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render("patientDiaryNew", {
      navDisplayName,
      userRole,
      totalUnseenNotifications,
    });
  }
  catch(err)
  {
    res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
    return
  }
});

router.post("/new", checkAuthenticated, checkEmailVerified, (req, res) => {
  preprocessData(req.body)
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  let result
  

  upload(req, res, async (err) => {
    let data = req.body
    let files = req.files
    let {diaryId, title, description} = data
    let images = [], errors = []
    
    console.log(req.body)
    console.log(req.files)
    console.log({err})

    if(err){      
      req.flash('error_msg', err)
      res.redirect('back')
      return 
    } 
    console.log('File Uploaded!')
   
    let imageId = typeof data.imageId!= 'undefined'? Array.isArray(data.imageId)? data.imageId : [data.imageId] : []
    for(let i=0; i<imageId.length; i++){
      let idx = files.findIndex((file) => {
        return file.fieldname == `imageFile${imageId[i]}`
      })

      let image = {
        _id: imageId[i],
        imagePath: data['prevImagePath'+imageId[i]]
      }

      if(idx != -1){
        let prevPath =  data['prevImagePath'+imageId[i]]
        if(checkNotNull(prevPath))
        {
          try{
            await deleteFile(prevPath)
          }catch(err){
            errors.push({msg: err.message})
          }  
        }
        image.imagePath = files[idx].path.replace(/\\/g, "/")                
      }

      if(checkNotNull(image.imagePath))
      {
        images.push(image)
      }
    }
    
    if(diaryId ==''){
      diary =  new diaryModel({
        _id: new mongoose.Types.ObjectId()
      })
    }
    else{
      diary = await diaryModel.findOne({_id: diaryId})
      diary.images.forEach(async (image) => {
        if(typeof data['prevImagePath'+image._id] == 'undefined'){
          try{
            await deleteFile(image.imagePath)
          }catch(err){
            errors.push({msg: err.message})
          } 
        } 
      })
    }

    diary.title = title
    diary.description = description
    diary.patientId = req.user._id
    diary.images = images

    // console.log(util.inspect({diary}, false, null, true /* enable colors */))
    
    try{
      result = await diary.save()
    }catch(err){
      errors.push({msg: err.message})
    }
    
    if(errors.length>0){      
      try{
        console.log({errors})
        res.render('patientDiaryNew', {navDisplayName, errors})
        return
      }catch(err){
        res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
        return
      }      
    }

    req.flash('success_msg', 'Successfully created new diary.')
    res.redirect(`/patient/diary/details?dId=${result._id}`)
    return
  });

})


router.get("/edit", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role;
  let {dId} = req.query
  let result
  
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let data = await diaryModel.findOne({_id: dId})
    // console.log(util.inspect({data}, false, null, true /* enable colors */))
    res.render("patientDiaryEdit", {
      navDisplayName,
      userRole,
      totalUnseenNotifications,
      data
    });
  }
  catch(err)
  {
    res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
    return
  }
});

router.post("/edit", checkAuthenticated, checkEmailVerified, (req, res) => {
  preprocessData(req.body)
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  

  upload(req, res, async (err) => {
    let data = req.body
    let files = req.files
    let {diaryId, title, description} = data
    let images = [], errors = []
    
    console.log(req.body)
    console.log(req.files)
    console.log({err})

    if(err){      
      req.flash('error_msg', err)
      res.redirect('back')
      return 
    } 
    console.log('File Uploaded!')
   
    let imageId = typeof data.imageId!= 'undefined'? Array.isArray(data.imageId)? data.imageId : [data.imageId] : []
    for(let i=0; i<imageId.length; i++){
      let idx = files.findIndex((file) => {
        return file.fieldname == `imageFile${imageId[i]}`
      })

      let image = {
        _id: imageId[i],
        imagePath: data['prevImagePath'+imageId[i]]
      }

      if(idx != -1){
        let prevPath =  data['prevImagePath'+imageId[i]]
        if(checkNotNull(prevPath))
        {
          try{
            await deleteFile(prevPath)
          }catch(err){
            errors.push({msg: err.message})
          }  
        }
        image.imagePath = files[idx].path.replace(/\\/g, "/")                
      }

      if(checkNotNull(image.imagePath))
      {
        images.push(image)
      }
    }
    
    if(diaryId ==''){
      diary =  new diaryModel({
        _id: new mongoose.Types.ObjectId()
      })
    }
    else{
      diary = await diaryModel.findOne({_id: diaryId})
      diary.images.forEach(async (image) => {
        if(typeof data['prevImagePath'+image._id] == 'undefined'){
          try{
            await deleteFile( image.imagePath)
          }catch(err){
            errors.push({msg: err.message})
          } 
        } 
      })
    }

    diary.title = title
    diary.description = description
    diary.patientId = req.user._id
    diary.images = images

    console.log(util.inspect({diary}, false, null, true /* enable colors */))
    try{
      result = await diary.save()
    }catch(err){
      errors.push({msg: err.message})
    }
    
    if(errors.length>0){      
      try{
        console.log({errors})
        res.render('patientDiaryEdit', {navDisplayName, errors})
        return
      }catch(err){
        res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
        return
      }      
    }

    req.flash('success_msg', 'Successfully updated diary details.')
    res.redirect(`/patient/diary/details?dId=${result._id}`)
    return
  });

})

router.get("/delete", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  let {dId} = req.query
  
  try{
    let data = await diaryModel.findOne({_id: dId})
    for(let i=0; i<data.images.length; i++)
    {
      await deleteFile(data.images[i].imagePath)
    }
    await diaryModel.deleteOne({_id: dId})
  }catch(err)
  {
    res.render('404', {navDisplayName, userRole, error: err.message });
    return
  }

  req.flash('success_msg', 'Successfully deleted one diary.')
  res.redirect('/patient/diary')
  return
})



module.exports = router;
