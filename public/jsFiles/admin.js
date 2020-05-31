// const {getSectionSubSection} = require('../../controllers/adminFunctions')
function addOption(idAdder){
  console.log('idAdder='+idAdder)
  let opCount= parseInt($("#opCounter"+idAdder).val())+1
  console.log('opCount='+opCount)

  console.log('idAdder+opCount='+idAdder+opCount)
  $("#opCounter"+idAdder).val(opCount)  
  
  elm = document.querySelector("#addHelper"+idAdder)

  elm.outerHTML =  '<!-- opiton -->'+
                    '<div class="family-container">'+
                      '<!-- it stores the number of questions for this option -->'+
                      '<input type="number" id="qCounter'+ idAdder+opCount +'" name="qCount" value="0"  style="display: none;">'+                      
                      'Option '+ opCount + ':' +
                      '<br>'+
                      '<input type="text" name="option">'+
                      '<!-- question for this option adding place -->'+
                      '<div id="addHelper'+idAdder+opCount+'"></div>'+
                      '<!-- question for this option -->'+
                      '<button type="button" class="btn btn-secondary addButton"  onclick="addQuestion('+idAdder+opCount+')">Add question</button>'+

                      '<br>'+
                    '</div>'+
                    '<!-- next option adding place -->'+
                    '<div id="addHelper'+idAdder+'"></div>'
}

function addQuestion(idAdder){
  console.log(idAdder)
  console.log('idAdder='+idAdder)
  let qCount= parseInt($("#qCounter"+idAdder).val())+1
  console.log('qCount='+qCount)
  console.log('idAdder+qCount='+idAdder+qCount)

  $("#qCounter"+idAdder).val(qCount)

  elm = document.querySelector("#addHelper"+idAdder)
  
  console.log(elm.outerHTML)

  elm.outerHTML =  '<!-- question -->'+
                  '<div class="family-container">'+
                    '<!-- it stores the number of options -->'+
                    '<input type="number" id="opCounter'+ idAdder+qCount +'" name="opCount" value="0" style="display: none;">'+
                    'Question '+ qCount + ':' +
                    '<br>'+
                    '<input type="text" name="question">'+
                    '<br>     '+
                    '<label class="fieldlabels">Select your question type form below:</label>'+
                    '<div class="custom-control custom-radio">'+
                      '<input type="radio" id="singleLineType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="singleLine"  onclick="hideConditionalSection(['+'multiChoiceOptions'+''+ idAdder+qCount +']);">'+
                      '<label class="custom-control-label" for="singleLineType'+ idAdder+qCount +'">Single line answer</label>'+
                    '</div>'+
                    '<div class="custom-control custom-radio">'+
                      '<input type="radio" id="multiLineType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiLine"  onclick="hideConditionalSection(['+'multiChoiceOptions'+''+ idAdder+qCount +']);">'+
                      '<label class="custom-control-label" for="multiLineType'+ idAdder+qCount +'">Multiple line answer</label>'+
                    '</div>'+
                    '<div class="custom-control custom-radio">'+
                      '<input type="radio" id="multiChoiceSingleType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiChoiceSingleAns" onclick="displayConditionalSection(['+'multiChoiceOptions'+''+ idAdder+qCount +']);">'+
                      '<label class="custom-control-label" for="multiChoiceSingleType'+ idAdder+qCount +'">Multiple choice with single answer</label>'+
                    '</div>'+                    
                    '<!-- radio for multiple choice multiple ans type  -->'+
                    '<div class="custom-control custom-radio">'+
                      '<input type="radio" id="multiChoiceMultiType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiChoiceMultiAns" onclick="displayConditionalSection(['+'multiChoiceOptions'+''+ idAdder+qCount +']);">'+
                      '<label class="custom-control-label" for="multiChoiceMultiType'+ idAdder+qCount +'">Multiple choice with multiple answer</label>'+
                    '</div>'+
                    '<div id="multiChoiceOptions'+ idAdder+qCount +'">'+
                      '<div id="addHelper'+ idAdder+qCount +'"></div>'+
                      '<button type="button" class="btn btn-secondary addButton" onclick="addOption('+ idAdder+qCount +')">Add option</button>'+
                    '</div>'+
                  '</div>'+
                  '<!-- next question adding place -->'+
                  '<div id="addHelper'+idAdder+'"></div>'
}

function displayConditionalSection(conditionalSectionIds){
  for(var i=0; i<conditionalSectionIds.length; i++){
    var el = document.getElementById(conditionalSectionIds[i])
    if(el!=null)
      el.style.display = "block";
  }
}

function hideConditionalSection(conditionalSectionIds){
  for(var i=0; i<conditionalSectionIds.length; i++){
    var el = document.getElementById(conditionalSectionIds[i])
    if(el!=null)
      el.style.display = "none";
  }
}

function myFunc(id){
  console.log(id)
  alert("ccc")
}
function getSubSections(id, subSectionNames) {
  console.log(id)
	
  var ind = document.getElementById("sectionId").selectedIndex-1;

  let rawhtml='<option disabled selected value> -- Select a Sub Section -- </option>'
  for(var i = 0 ; i < subSectionNames[ind].length; i++) {
    rawhtml+= '<option value="'+subSectionNames[ind][i]+'">'+ subSectionNames[ind][i] +'</option>'
  }
  document.getElementById('subSectionId').innerHTML= rawhtml
}
  
function onStart(){
  let idsForHiddenElements = ["multiChoiceOptions"]

  for(var i=0; i<idsForHiddenElements.length; i++){
    var el=document.getElementById(idsForHiddenElements[i])
    if(el!=null){
       console.log(idsForHiddenElements[i])
       el.style.display="none";
    }
  }
}