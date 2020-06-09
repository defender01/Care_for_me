// const {getSectionSubSection} = require('../../controllers/adminFunctions')
function addOption(idAdder){
  console.log('idAdder='+idAdder)
  let opCount= parseInt($("#opCounter"+idAdder).val())+1
  let totalOpCount= parseInt($("#totalOpCounter"+idAdder).val())+1
  console.log('opCount='+opCount)

  console.log('idAdder+opCount='+idAdder+opCount)
  $("#opCounter"+idAdder).val(opCount)  
  $("#totalOpCounter"+idAdder).val(totalOpCount)  
  
  $("#addHelper"+idAdder).replaceWith('<!-- opiton -->'+
                    '<div id ="optionContainer'+ idAdder+totalOpCount +'" class="">'+
                      '<div class="option-Container family-container" >'+
                        '<!-- it stores the number of questions for this option -->'+
                        '<input type="number" id="qCounter'+ idAdder+opCount +'" name="qCount" value="0" style="display: none;" >'+
                        '<input type="number" id="totalQCounter'+ idAdder+totalOpCount +'" value="0" style="display: none;" >'+                      
                        'Option :' +
                        '<br>'+
                        '<div class="flx_prnt_input_opt">'+
                          '<div class="flx_chld_input">'+
                            '<input type="text" name="option" required>'+
                          '</div>'+
                          '<div class="flx_chld_opt">'+
                            '<button type="button" class="btn btn-danger" onclick="deleteOption('+'\'opCounter'+idAdder+'\','+'\'optionContainer'+idAdder+totalOpCount+'\')">Delete</button>'+
                          '</div>'+
                        '</div>'+
                        '<!-- question for this option adding place -->'+
                        '<div id="addHelper'+idAdder+opCount+'"></div>'+
                        '<!-- question for this option -->'+
                        '<button type="button" class="btn btn-secondary addButton"  onclick="addQuestion('+idAdder+opCount+')">Add question</button>'+

                        '<br>'+
                      '</div>'+
                    '</div>'+
                    '<!-- next option adding place -->'+
                    '<div id="addHelper'+idAdder+'"></div>')
}

function deleteOption(opCounterId, opContainerId){
  console.log('delete opCounterId= '+opCounterId)
  console.log('delete opContainerId = '+opContainerId)
  let opCount= parseInt($("#"+opCounterId).val())-1
  console.log('opCount='+opCount)

  $("#"+opCounterId).val(opCount) 
  $("#"+opContainerId).empty()
}

function addQuestion(idAdder){
  console.log(idAdder)
  console.log('idAdder='+idAdder)
  let qCount= parseInt($("#qCounter"+idAdder).val())+1
  let totalQCount= parseInt($("#totalQCounter"+idAdder).val())+1
  console.log('qCount='+qCount)
  console.log('idAdder+qCount='+idAdder+qCount)

  $("#qCounter"+idAdder).val(qCount)
  $("#totalQCounter"+idAdder).val(totalQCount)
  
  $("#addHelper"+idAdder).replaceWith('<!-- question -->'+
                  '<div id="questionContainer'+ idAdder+totalQCount +'" class="">'+
                    '<div class="question-Container family-container">'+
                      '<!-- it stores the number of options -->'+
                      '<input type="number" id="opCounter'+ idAdder+qCount +'" name="opCount" value="0" style="display: none;" >'+
                      '<input type="number" id="totalOpCounter'+ idAdder+totalQCount +'" value="0" style="display: none;" >'+ 
                      'Question :' +
                      '<br>'+
                      '<div class="flx_prnt_input_opt">'+
                          '<div class="flx_chld_input">'+
                            '<input type="text" name="question" required>'+
                          '</div>'+
                          '<div class="flx_chld_opt">'+
                            '<button type="button" class="btn btn-danger" onclick="deleteQuestion('+'\'qCounter'+idAdder+'\','+'\'questionContainer'+idAdder+totalQCount+'\')">Delete</button>'+
                          '</div>'+
                        '</div>'+
                      '<br>     '+
                      '<label class="fieldlabels">Select your question type form below:</label>'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="numericalType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="numerical"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+ idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'numerical\');" required>'+
                        '<label class="custom-control-label" for="numericalType'+ idAdder+qCount +'">Numerical answer</label>'+
                      '</div>'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="dateType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="date"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+ idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'date\');">'+
                        '<label class="custom-control-label" for="dateType'+ idAdder+qCount +'">Date answer</label>'+
                      '</div>'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="singleLineType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="singleLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+ idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'singleLine\');" required>'+
                        '<label class="custom-control-label" for="singleLineType'+ idAdder+qCount +'">Single line answer</label>'+
                      '</div>'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="multiLineType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+ idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'multiLine\');">'+
                        '<label class="custom-control-label" for="multiLineType'+ idAdder+qCount +'">Multiple line answer</label>'+
                      '</div>'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="multiChoiceSingleType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiChoiceSingleAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+ idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'multiChoiceSingleAns\');">'+
                        '<label class="custom-control-label" for="multiChoiceSingleType'+ idAdder+qCount +'">Multiple choice with single answer</label>'+
                      '</div>'+                    
                      '<!-- radio for multiple choice multiple ans type  -->'+
                      '<div class="custom-control custom-radio">'+
                        '<input type="radio" id="multiChoiceMultiType'+ idAdder+qCount +'" name="type'+ idAdder+qCount +'" class="custom-control-input" value="multiChoiceMultiAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+idAdder+qCount +'\']); setTypeIndicator(\'typeIndicator'+idAdder+qCount +'\',\'multiChoiceMultiAns\');">'+
                        '<label class="custom-control-label" for="multiChoiceMultiType'+ idAdder+qCount +'">Multiple choice with multiple answer</label>'+
                      '</div>'+
                      '<input type="text" id="typeIndicator'+ idAdder+qCount +'" name="typeIndicator"  style="display: none;"  >'+
                      '<div id="multiChoiceOptions'+ idAdder+qCount +'">'+
                        '<div id="addHelper'+ idAdder+qCount +'"></div>'+
                        '<button type="button" class="btn btn-secondary addButton" onclick="addOption('+ idAdder+qCount +')">Add option</button>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
                  '<!-- next question adding place -->'+
                  '<div id="addHelper'+idAdder+'"></div>')
  
                  hideConditionalSection(['multiChoiceOptions'+idAdder+qCount ])
}
function deleteQuestion(qCounterId, qContainerId){
  console.log('delete qCounterId= '+qCounterId)
  console.log('delete qContainerId = '+qContainerId)
  let qCount= parseInt($("#"+qCounterId).val())-1
  console.log('qCount='+qCount)

  $("#"+qCounterId).val(qCount) 
  $("#"+qContainerId).empty()
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
    console.log("conditional seciton"+ conditionalSectionIds[i])
    var el = document.getElementById(conditionalSectionIds[i])
    if(el!=null)
      el.style.display = "none";
  }
}

function setTypeIndicator(typeIndicator, type){
  console.log({typeIndicator})
  console.log({type})
  $('#'+typeIndicator).val(type)
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