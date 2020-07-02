function createQuestion(opId, questions){
    console.log({questions})   
    let qStr =''
    for(let i=0; i<questions.length; i++){
      qStr+='<!-- question -->'+
                    '<div id="questionContainer'+ questions[i]._id +'" class="">'+
                        '<div class="question-Container family-container">'+
                        '<input type="text" name="questions'+opId+'" value="'+questions[i]._id+'" style="display: none;">'+
                          '<input type="text" name="questionId" value="'+questions[i]._id+'" style="display: none;">'+
                        'Question :' +
                        '<br>'+
                        '<div class="flx_prnt_input_opt">'+
                            '<div class="flx_chld_input">'+
                            '<input type="text" name="qName'+ questions[i]._id +'" value="'+questions[i].name+'" required>'+
                            '</div>'+
                            '<div class="flx_chld_opt">'+
                            '<button type="button" class="btn btn-danger" onclick="deleteItem(\'questionContainer'+questions[i]._id+'\')">Delete</button>'+
                            '</div>'+
                        '</div>'+
                        '<br>'+
                        '<label class="fieldlabels">Write a label for this question:(E.g. Question: What is your name?, Label for it: Name) </label>'+
                        '<input type="text" name="qLabel'+ questions[i]._id +'" value="'+questions[i].qLabel+'" required/>'+
                        '<br>     '+
                        '<label class="fieldlabels">Select your question type form below:</label>'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="numericalType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="numerical"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id+'\']); " '+(questions[i].inputType=='numerical'?'checked':'')+' required>'+
                            '<label class="custom-control-label" for="numericalType'+questions[i]._id+'" >Numerical answer</label>'+
                        '</div>'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="dateType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="date"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id+'\']); " '+(questions[i].inputType=='date'?'checked':'')+'>'+
                            '<label class="custom-control-label" for="dateType'+questions[i]._id+'">Date answer</label>'+
                        '</div>'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="singleLineType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="singleLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id+'\']); "  '+(questions[i].inputType=='singleLine'?'checked':'')+'>'+
                            '<label class="custom-control-label" for="singleLineType'+questions[i]._id+'">Single line answer</label>'+
                        '</div>'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="multiLineType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="multiLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id+'\']);" '+(questions[i].inputType=='multiLine'?'checked':'')+'>'+
                            '<label class="custom-control-label" for="multiLineType'+questions[i]._id+'" >Multiple line answer</label>'+
                        '</div>'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="multiChoiceSingleType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="multiChoiceSingleAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id+'\']);" '+(questions[i].inputType=='multiChoiceSingleAns'?'checked':'')+'>'+
                            '<label class="custom-control-label" for="multiChoiceSingleType'+questions[i]._id+'" >Multiple choice with single answer</label>'+
                        '</div>'+                    
                        '<!-- radio for multiple choice multiple ans type  -->'+
                        '<div class="custom-control custom-radio">'+
                            '<input type="radio" id="multiChoiceMultiType'+questions[i]._id+'" name="type'+questions[i]._id+'" class="custom-control-input" value="multiChoiceMultiAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+questions[i]._id +'\']);" '+(questions[i].inputType=='multiChoiceMultiAns'?'checked':'')+'>'+
                            '<label class="custom-control-label" for="multiChoiceMultiType'+questions[i]._id+'" >Multiple choice with multiple answer</label>'+
                        '</div>'+
                        '<div id="multiChoiceOptions'+questions[i]._id+'">'+
                             (questions[i].options.length>0 ? createOption(questions[i]._id, questions[i].options) : '')+
                            '<div id="addOpPlace'+questions[i]._id+'"></div>'+
                            '<button type="button" class="btn btn-secondary addButton" onclick="addOption(\''+questions[i]._id+'\')">Add option</button>'+
                        '</div>'+
                        '</div>'+
                    '</div>'
    }
    return qStr
  } 

  function createOption(qId, options){
    let opStr=''
    for(let i=0; i<options.length; i++){
      opStr+='<!-- opiton -->'+
            '<div id ="optionContainer'+ options[i]._id +'" class="">'+
                '<div class="option-Container family-container" >'+     
                '<input type="text" name="options'+qId+'" value="'+options[i]._id+'" style="display: none;">'+
                  '<input type="text" name="optionId" value="'+options[i]._id+'" style="display: none;">'+               
                    'Option :' +
                    '<br>'+
                    '<div class="flx_prnt_input_opt">'+
                    '<div class="flx_chld_input">'+
                        '<input type="text" name="opName'+options[i]._id+'" value="'+options[i].name+'" required>'+
                    '</div>'+
                    '<div class="flx_chld_opt">'+
                        '<button type="button" class="btn btn-danger" onclick="deleteItem(\'optionContainer'+options[i]._id+'\')">Delete</button>'+
                    '</div>'+
                    '</div>'+
                    '<!-- question for this option adding place -->'+
                    (options[i].questions.length>0 ? createQuestion(options[i]._id, options[i].questions) : '')+
                    '<div id="addQuesPlace'+options[i]._id+'"></div>'+
                    '<!-- question for this option -->'+
                    '<button type="button" class="btn btn-secondary addButton"  onclick="addQuestion(\''+options[i]._id+'\')">Add question</button>'+

                    '<br>'+
                '</div>'+
                '</div>'
    }
    return opStr
  }
  function addQuestion(opId){    
      $.get('/admin/getNewId', data =>{
          console.log('newQId'+data.id)
          let qId = data.id
          $("#addQuesPlace"+opId).replaceWith('<!-- question -->'+
                        '<div id="questionContainer'+ qId +'" class="">'+
                            '<div class="question-Container family-container">'+
                            '<input type="text" name="questions'+opId+'" value="'+qId+'" style="display: none;">'+
                                '<input type="text" name="questionId" value="'+qId+'" style="display: none;">'+
                            'Question :' +
                            '<br>'+
                            '<div class="flx_prnt_input_opt">'+
                                '<div class="flx_chld_input">'+
                                '<input type="text" name="qName'+ qId +'" value="" required>'+
                                '</div>'+
                                '<div class="flx_chld_opt">'+
                                '<button type="button" class="btn btn-danger" onclick="deleteItem(\'questionContainer'+qId+'\')">Delete</button>'+
                                '</div>'+
                            '</div>'+
                            '<br>'+
                            '<label class="fieldlabels">Write a label for this question:(E.g. Question: What is your name?, Label for it: Name) </label>'+
                            '<input type="text" name="qLabel'+ qId +'" value="" required/>'+
                            '<br>     '+
                            '<label class="fieldlabels">Select your question type form below:</label>'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="numericalType'+qId+'" name="type'+qId+'" class="custom-control-input" value="numerical"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+qId+'\']); "  required>'+
                                '<label class="custom-control-label" for="numericalType'+qId+'" >Numerical answer</label>'+
                            '</div>'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="dateType'+qId+'" name="type'+qId+'" class="custom-control-input" value="date"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+qId+'\']); " >'+
                                '<label class="custom-control-label" for="dateType'+qId+'">Date answer</label>'+
                            '</div>'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="singleLineType'+qId+'" name="type'+qId+'" class="custom-control-input" value="singleLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+qId+'\']); " >'+
                                '<label class="custom-control-label" for="singleLineType'+qId+'">Single line answer</label>'+
                            '</div>'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="multiLineType'+qId+'" name="type'+qId+'" class="custom-control-input" value="multiLine"  onclick="hideConditionalSection(['+'\'multiChoiceOptions'+qId+'\']);" >'+
                                '<label class="custom-control-label" for="multiLineType'+qId+'" >Multiple line answer</label>'+
                            '</div>'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="multiChoiceSingleType'+qId+'" name="type'+qId+'" class="custom-control-input" value="multiChoiceSingleAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+qId+'\']);" >'+
                                '<label class="custom-control-label" for="multiChoiceSingleType'+qId+'" >Multiple choice with single answer</label>'+
                            '</div>'+                    
                            '<!-- radio for multiple choice multiple ans type  -->'+
                            '<div class="custom-control custom-radio">'+
                                '<input type="radio" id="multiChoiceMultiType'+qId+'" name="type'+qId+'" class="custom-control-input" value="multiChoiceMultiAns" onclick="displayConditionalSection(['+'\'multiChoiceOptions'+qId +'\']);" >'+
                                '<label class="custom-control-label" for="multiChoiceMultiType'+qId+'" >Multiple choice with multiple answer</label>'+
                            '</div>'+
                            '<div id="multiChoiceOptions'+qId+'" style="display: none;">'+
                                '<div id="addOpPlace'+qId+'"></div>'+
                                '<button type="button" class="btn btn-secondary addButton" onclick="addOption(\''+qId+'\')">Add option</button>'+
                            '</div>'+
                            '</div>'+
                        '</div>'+
                    '<!-- next question adding place -->'+
                    '<div id="addQuesPlace'+opId+'"></div>')
      })
    
  }  
  
  function addOption(qId){
    $.get('/admin/getNewId', data =>{
        console.log('newOpId'+data.id)
        let opId = data.id
        $("#addOpPlace"+qId).replaceWith('<!-- opiton -->'+
                        '<div id ="optionContainer'+ opId +'" class="">'+
                        '<div class="option-Container family-container" >'+   
                        '<input type="text" name="options'+qId+'" value="'+opId+'" style="display: none;">'+  
                            '<input type="text" name="optionId" value="'+opId+'" style="display: none;">'+               
                            'Option :' +
                            '<br>'+
                            '<div class="flx_prnt_input_opt">'+
                            '<div class="flx_chld_input">'+
                                '<input type="text" name="opName'+opId+'" value="" required>'+
                            '</div>'+
                            '<div class="flx_chld_opt">'+
                                '<button type="button" class="btn btn-danger" onclick="deleteItem(\'optionContainer'+opId+'\')">Delete</button>'+
                            '</div>'+
                            '</div>'+
                            '<!-- question for this option adding place -->'+
                            '<div id="addQuesPlace'+opId+'"></div>'+
                            '<!-- question for this option -->'+
                            '<button type="button" class="btn btn-secondary addButton"  onclick="addQuestion(\''+opId+'\')">Add question</button>'+

                            '<br>'+
                        '</div>'+
                        '</div>'+
                      '<!-- next option adding place -->'+
                      '<div id="addOpPlace'+qId+'"></div>'
                      )
    })
  }
  function removeConditionalOp(qId){
    $("#multiChoiceOptions"+qId).replaceWith('')
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

  function deleteItem(id){
    $("#"+id).empty()
  }
  