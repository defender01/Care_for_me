function createEducation(){
    $.get('/doctor/getNewId', (data) => {
      let newId = data.id
      $('#addPlaceEducation').replaceWith(
        `<div class="item-holder" id="education${newId}">`+
            ` <div class="delete-btn">`+
                `<button onclick="deleteItem('education${newId}')">Delete</button>`+
            `</div>  `+
            `<div class="single-ques">`+
              `<div class="label">`+
                `*Degree:`+
              `</div>`+
              `<div class="input-field">`+
                `<input type="text" name="degree" class="form-control"  required>`+
              `</div>`+
            `</div> `+
            `<div class="single-ques">`+
              `<div class="label">`+
                `Institute:`+
              `</div>`+
              `<div class="input-field">`+
                `<input type="text" name="institute" class="form-control" >`+
              `</div>`+
            `</div>   `   +
            `<div class="single-ques">`+
              `<div class="label">`+
                `Passing Year:`+
              `</div>`+
              `<div class="input-field">`+
                `<input type="number" min="1900" max="2099" step="1" name="passingYear" class="form-control" >`+
              `</div>`+
            `</div>`+
            `<div class="single-ques">`+
              `<div class="label">`+
                `Subject:`+
              `</div>`+
              `<div class="input-field">`+
                `<input type="text" name="subject" class="form-control" >`+
              `</div>`+
            `</div>   `+       
          `</div>`+
          `<div id="addPlaceEducation"></div>`
      )
    })
}

function createTraining(){
    $.get('/doctor/getNewId', (data) => {
      let newId = data.id
      $('#addPlaceTraining').replaceWith(
        `<div class="item-holder" id='training${newId}'>`+
                ` <div class="delete-btn">`+
                    `<button onclick="deleteItem('training${newId}')">Delete</button>`+
                `</div>  `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `*Name:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="text" name="traintingName" class="form-control"  required>`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Year:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="number" min="1900" max="2099" step="1" name="trainingYear" class="form-control"  >`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Details:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<textarea class="form-control" name="trainingDetails" rows="3"></textarea>`+
                  `</div>`+
                `</div>           `+              
              `</div>`+
              `<div id="addPlaceTraining"></div>`
      )
    })
}

function createWork(){
    $.get('/doctor/getNewId', (data) => {
      let newId = data.id
      $('#addPlaceWork').replaceWith(
        `<div class="item-holder" id="work${newId}">`+
                ` <div class="delete-btn">`+
                    `<button onclick="deleteItem('work${newId}')">Delete</button>`+
                `</div>  `+ 
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `*Work Place:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="text" name="workPlace" class="form-control"  required>`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Work From(year):`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="number" min="1900" max="2099" step="1" name="workFromYear" class="form-control"  >`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Work To(year):`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="number" min="1900" max="2099" step="1" name="workToYear" class="form-control"  >`+
                  `</div>`+
                `</div>   `+                       
              `</div>`+
              `<div id="addPlaceWork"></div>`
      )
    })
}

function createAward(){
    $.get('/doctor/getNewId', (data) => {
      let newId = data.id
      $('#addPlaceAward').replaceWith(
        `<div class="item-holder" id="award${newId}">`+
                ` <div class="delete-btn">`+
                    `<button onclick="deleteItem('award${newId}')">Delete</button>`+
                `</div>  `+ 
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `*Name:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="text" name="awardName" class="form-control"  required>`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Year:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<input type="number" min="1900" max="2099" step="1" name="awardYear" class="form-control"  >`+
                  `</div>`+
                `</div>   `+
                `<div class="single-ques">`+
                  `<div class="label">`+
                    `Details:`+
                  `</div>`+
                  `<div class="input-field">`+
                    `<textarea class="form-control" name="awardDetails" rows="3"></textarea>`+
                  `</div>`+
                `</div>   ` +                       
              `</div>`+
              `<div id="addPlaceAward"></div>`
      )
    })
}

function deleteItem(id){
 $('#'+id).remove()
}