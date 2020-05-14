var familyCnt = [0,0,0];


$(document).ready(function () {

    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    var current = 1;
    var steps = $("fieldset").length;

    setProgressBar(current);

    $(".next").click(function () {

        current_fs = $(this).parent();
        next_fs = $(this).parent().next();

        //Add Class Active
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        //show the next fieldset
        next_fs.show();
        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                next_fs.css({ 'opacity': opacity });
            },
            duration: 500
        });
        setProgressBar(++current);
    });

    $(".previous").click(function () {

        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();

        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({ 'opacity': opacity });
            },
            duration: 500
        });
        setProgressBar(--current);
    });

    function setProgressBar(curStep) {
        var percent = parseFloat(100 / steps) * curStep;
        percent = percent.toFixed();
        $(".progress-bar")
            .css("width", percent + "%")
    }

    $(".submit").click(function () {
        return false;
    })

});

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function togglePopUp(option, substanceTypes) {
    
    var i
    var substances = substanceTypes.split(",")
    var args = "togglePopUpForOK("

    for (i = 0; i < substances.length; i++) {

        var str1,str2, htmlForCollapse;

        args = args + '"' + substances[i] + '"';
        if(i!=substances.length-1) args = args + ",";

        var htmlForCollapsePart1 = ' <div class="card"> ' +
                            ' <div class="card-header" id="heading-' + i +'"  data-toggle="collapse" data-target="#collapse-' + i +'" > ' +
                            '<h5 class="mb-0">';

        var htmlForCollapsePart2 = substances[i] +
                                '</a>' +
                            '</h5>' +
                            '</div>';

        var htmlForCollapsePart3 = '<div class="collapse-card-body">' + 
                                '<label class="fieldlabels" for="for_popup_first_use_'+ camelCase(substances[i]) + '">Age when you first used this:</label>' +
                                '<input type="text" name="for_popup_first_use_'+ camelCase(substances[i]) + '" id="for_popup_first_use_'+camelCase(substances[i]) + '" placeholder="" />' +

                                '<label class="fieldlabels" for="for_popup_how_much_use_'+camelCase(substances[i]) + '">How much & how often did you use this?</label>' +
                                '<input type="text" name="for_popup_how_much_use_'+camelCase(substances[i]) + '" id="for_popup_how_much_use_'+camelCase(substances[i]) + '" placeholder="" />' +

                                '<label class="fieldlabels" for="for_popup_how_many_year_'+camelCase(substances[i]) + '">How many years did you use this?</label>' +
                                '<input type="text" name="for_popup_how_many_year_'+camelCase(substances[i]) + '" id="for_popup_how_many_year_'+camelCase(substances[i]) + '" placeholder="" />' +
                                
                                '<label class="fieldlabels" for="for_popup_last_use_'+camelCase(substances[i]) + '">When did you last use this?</label>' +
                                '<input type="text" name="for_popup_last_use_'+camelCase(substances[i]) + '" id="for_popup_last_use_'+camelCase(substances[i]) + '" placeholder="" />' +

                                '<label class="fieldlabels" for="currently_use">Do you currently use this?</label>' +
                                '<div>' +
                                '<div class="custom-control custom-radio">' +
                                    '<input type="radio" id="radio_yes_'+camelCase(substances[i]) + '" name="for_popup_currently_use_'+camelCase(substances[i]) + '" class="custom-control-input" value="yes">' +
                                    '<label class="custom-control-label" for="radio_yes_'+camelCase(substances[i]) + '">Yes</label>' +
                                '</div>' +
                                '<div class="custom-control custom-radio">' +
                                    '<input type="radio" id="radio_no_'+camelCase(substances[i]) + '" name="for_popup_currently_use_'+camelCase(substances[i]) + '" class="custom-control-input" value="no">' +
                                    '<label class="custom-control-label" for="radio_no_'+camelCase(substances[i]) + '">No</label>' +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                            '</div>' +

                        '</div>';
        
        if(i==0){
            str1 = '<a class="btn" id="collapse-button-' + (i) +'" role="button"  aria-expanded="true" aria-controls="collapse-' + (i) +'">';
            str2 = '<div id="collapse-' + (i) +'" class="collapse show" aria-labelledby="heading-' + (i) +'" data-parent="#accordion">';
            htmlForCollapse = htmlForCollapsePart1 + str1 + htmlForCollapsePart2 + str2 + htmlForCollapsePart3;
        }
        else{
            str1 = '<a class="btn collapsed" id="collapse-button-' + (i) +'" role="button" aria-expanded="false" aria-controls="collapse-' + (i) +'">';
            str2 = '<div id="collapse-' + (i) +'" class="collapse" aria-labelledby="heading-' + (i) +'" data-parent="#accordion">'; 
            htmlForCollapse = htmlForCollapsePart1 + str1 + htmlForCollapsePart2 + str2 + htmlForCollapsePart3;
        }
        
        var newDiv = document.createElement('div');
        document.getElementById('accordion').appendChild(newDiv);
        newDiv.outerHTML = htmlForCollapse;   
    }
    
    if(option == 'h6'){
        $("#accordion :input").attr("disabled", true);
    }

    args = args + ")";

    $('[id="popUpOKButton"]').attr('onclick',args)

    if (document.getElementById('popup').style.display == "flex") {
      document.getElementById('popup').style.display = "none";
    } else {
      document.getElementById('popup').style.display = "flex";
    }
    
}

function togglePopUpForOK()
{
    // var i;
    // for(i=0;i<arguments.length;i++){
    //   //console.log(arguments[i]);

    //   var newDiv = document.createElement('div');
    //   document.getElementById('substance_details').appendChild(newDiv);
    //   newDiv.outerHTML = htmlForCollapse;

    // }
    
    var collapsediv = document.getElementById('accordion');
    collapsediv.innerHTML = '';

    if (document.getElementById('popup').style.display == "flex") {
        document.getElementById('popup').style.display = "none";
      } else {
        document.getElementById('popup').style.display = "flex";
    }
}


function togglePopUpForClose()
{
    var collapsediv = document.getElementById('accordion');
    collapsediv.innerHTML = '';

    if (document.getElementById('popup').style.display == "flex") {
        document.getElementById('popup').style.display = "none";
      } else {
        document.getElementById('popup').style.display = "flex";
      }
}

function displayHowMuchInputField(id)
{
    var elem = document.getElementById(id)
    var extraDiv1 = document.getElementById("howMuchGeneralDisorder_1")
    var extraDiv2 = document.getElementById("howMuchGeneralDisorder_2")

    if(id == "generalDisorderID_1"){
        if(elem.checked) extraDiv1.style.display = "block"
        else extraDiv1.style.display = "none"
    }

    if(id == "generalDisorderID_2"){
      if(elem.checked) extraDiv2.style.display = "block"
      else extraDiv2.style.display = "none"
    }
}


function displayWhereInputField(id){
  var idx = id.indexOf('_')
  var str = "whereMuscleDisorder_" + id[idx+1]

  var elem = document.getElementById(id)
  var extraDiv = document.getElementById(str)

  if(elem.checked) extraDiv.style.display = "block"
  else extraDiv.style.display = "none"

}

function togglePopUpFamilyHistory(from) {
    var fieldNames =["name","gender","birthDate","health","psychiaty"]
    var popupElmIds = ["famimilyMemberName","famimilyMemberGender","famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
    var tabTypes = ["siblings", "children"]
    var collapseIds = ["collaplseExampleSiblings", "collaplseExampleChildren"]
    var detailIds = ["siblingsDetails", "childrenDetails"]
    var inputValues = {
        
    }

    $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistory("ok")')
    $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistory("cancel")')

    if(from !== 'ok' && from !== 'cancel')
        $('p[id = "calledFrom"]').html(from)

    var parentID = $('p[id = "calledFrom"]').html();
    
    console.log(parentID)

    if(from === 'ok')
    {
        var ind =0,ind2=0,typeNo;
        for(var i=0; i<tabTypes.length; i++)
            if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;

        var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length

        for(var i=0; i<popupElmIds.length; i++)
            inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
        
        console.log(inputValues)

        divHtml = $('[id = '+ parentID +']').html()

        console.log(divHtml)
        $('[id = '+ parentID +']').html(
            '<div class="sub-part-row">'+
                '<p class="title">'+
                  'Name'+
                '</p>'+
                '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistory(this.parentElement.parentElement.id)">Edit</button>'+
              '</div>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div>' +           
              '<div class="collapse" id="'+'collapseExample'+parentID+'">'+
                  '<hr>'+
                    '<p class="title">'+
                      'Gender'+
                    '</p>'+
                    '<div class="sub-sub-part">'+
                      '<p>'+
                      inputValues[fieldNames[ind++]]+
                      '</p>'+
                    '</div>'+
                '<p class="title">'+
                  'Birth date'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    'Born on '+ inputValues[fieldNames[ind++]] +
                  '</p>'+
                '</div>'+
                '<hr>'+
                '<p class="title">'+
                  'Health'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    inputValues[fieldNames[ind++]]+
                  '</p>'+
                '</div> '+
                '<hr>'+
                '<p class="title">'+
                  'Psychiatric'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    inputValues[fieldNames[ind++]]+
                  '</p>'+
                '</div> '+
              '</div>'+
              '<div class="extend">'+
                '<p>'+
                  '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+parentID+'" id="seeMore'+ parentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
                    'See more'+
                  '</a>'+
                '</p>'+
              '</div>'+
              '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
              '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
              '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
              '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
              '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
        )
        
    
        
    }

    if (document.getElementById('popupFamilyHistory').style.display == "flex") {
        document.getElementById('popupFamilyHistory').style.display = "none";
    } else {
        document.getElementById('popupFamilyHistory').style.display = "flex";
    }
}

function togglePopUpFamilyHistoryRelative(from) {
  var fieldNames =["name","relation","gender","birthDate","health","psychiaty"]
  var popupElmIds = ["famimilyMemberName","famimilyMemberRelation","famimilyMemberGender","famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
  var tabTypes = ["relative"]
  var collapseIds = ["collaplseExampleRelative"]
  var detailIds = ["relativeDetails"]
  var inputValues = {
      
  }

  $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistoryRelative("ok")')
  $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistoryRelative("cancel")')

  if(from !== 'ok' && from !== 'cancel')
      $('p[id = "calledFrom"]').html(from)

  var parentID = $('p[id = "calledFrom"]').html();
  
  console.log(parentID)

  if(from === 'ok')
  {
      var ind =0,ind2=0,typeNo;
      for(var i=0; i<tabTypes.length; i++)
          if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;

      var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length

      for(var i=0; i<popupElmIds.length; i++)
          inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
      
      console.log(inputValues)

      divHtml = $('[id = '+ parentID +']').html()

      console.log(divHtml)
      $('[id = '+ parentID +']').html(
          '<div class="sub-part-row">'+
              '<p class="title">'+
                'Name'+
              '</p>'+
              '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistoryRelative(this.parentElement.parentElement.id)">Edit</button>'+
            '</div>'+
            '<div class="sub-sub-part">'+
              '<p>'+
              inputValues[fieldNames[ind++]]+
              '</p>'+
            '</div>' +           
            '<div class="collapse" id="'+'collapseExample'+parentID+'">'+
                '<hr>'+
                '<p class="title">'+
                  'Relation with you'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    inputValues[fieldNames[ind++]]+
                  '</p>'+
                '</div>'+
                '<hr>'+
                  '<p class="title">'+
                    'Gender'+
                  '</p>'+
                  '<div class="sub-sub-part">'+
                    '<p>'+
                    inputValues[fieldNames[ind++]]+
                    '</p>'+
                  '</div>'+
              '<p class="title">'+
                'Birth date'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  'Born on '+ inputValues[fieldNames[ind++]] +
                '</p>'+
              '</div>'+
              '<hr>'+
              '<p class="title">'+
                'Health'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
              '<hr>'+
              '<p class="title">'+
                'Psychiatric'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
            '</div>'+
            '<div class="extend">'+
              '<p>'+
                '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+parentID+'" id="seeMore'+ parentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
                  'See more'+
                '</a>'+
              '</p>'+
            '</div>'+
            '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
      )
  
  }

  if (document.getElementById('popupFamilyHistoryRelative').style.display == "flex") {
      document.getElementById('popupFamilyHistoryRelative').style.display = "none";
  } else {
      document.getElementById('popupFamilyHistoryRelative').style.display = "flex";
  }
}


function togglePopUpFamilyHistoryParent(from) {
  var fieldNames =["name","birthDate","health","psychiaty"]
  var popupElmIds = ["famimilyMemberName", "famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
  var tabTypes = ["father", "mother"]
  var collapseIds = ["collapseExampleFather", "collaplseExampleMother"]
  var detailIds = ["fatherDetails", "motherDetails"]
  var inputValues = {
      
  }

  $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistoryParent("ok")')
  $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistoryParent("cancel")')

  if(from !== 'ok' && from !== 'cancel')
      $('p[id = "calledFrom"]').html(from)

  var parentID = $('p[id = "calledFrom"]').html();
  
  console.log(parentID)

  // if(parentID.indexOf("fatherDetails") != -1  || parentID.indexOf("motherDetails") != -1)
  // {
  //     $('[class= "conditional"]').hide()
  // }
  // else {
  //     $('[class= "conditional"]').show()
  // }

  if(from === 'ok')
  {
      var ind =0,ind2=0,typeNo;
      for(var i=0; i<tabTypes.length; i++)
          if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;

      var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length

      for(var i=0; i<popupElmIds.length; i++)
          inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
      
      console.log(inputValues)

      divHtml = $('[id = '+ parentID +']').html()

      console.log(divHtml)
      $('[id = '+ parentID +']').html(
          '<div class="sub-part-row">'+
              '<p class="title">'+
                'Name'+
              '</p>'+
              '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistory(this.parentElement.parentElement.id)">Edit</button>'+
            '</div>'+
            '<div class="sub-sub-part">'+
              '<p>'+
              inputValues[fieldNames[ind++]]+
              '</p>'+
            '</div>' +           
            '<div class="collapse" id="'+'collapseExample'+parentID+'">'+
                '<hr>'+
              '<p class="title">'+
                'Birth date'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  'Born on '+ inputValues[fieldNames[ind++]] +
                '</p>'+
              '</div>'+
              '<hr>'+
              '<p class="title">'+
                'Health'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
              '<hr>'+
              '<p class="title">'+
                'Psychiatric'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
            '</div>'+
            '<div class="extend">'+
              '<p>'+
                '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+parentID+'" id="seeMore'+ parentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
                  'See more'+
                '</a>'+
              '</p>'+
            '</div>'+
            '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
      )
      
      console.log(parentID+' typeNo= '+typeNo)
      // if(typeNo==0)
      //     $('#'+parentID+' > #collapseExample'+parentID+' > .conditional').hide()
      // if(typeNo==1)
      //     $('#'+parentID+' > #collapseExample'+parentID+' > .conditional').hide()

      
  }

  if (document.getElementById('popupFamilyHistoryParent').style.display == "flex") {
      document.getElementById('popupFamilyHistoryParent').style.display = "none";
  } else {
      document.getElementById('popupFamilyHistoryParent').style.display = "flex";
  }
}

function togglePopUpFamilyHistoryRelative(from) {
  var fieldNames =["name","birthDate","health","psychiaty"]
  var popupElmIds = ["famimilyMemberName", "famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
  var tabTypes = ["father", "mother"]
  var collapseIds = ["collapseExampleFather", "collaplseExampleMother"]
  var detailIds = ["fatherDetails", "motherDetails"]
  var inputValues = {
      
  }

  $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistoryRelative("ok")')
  $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistoryRelative("cancel")')

  if(from !== 'ok' && from !== 'cancel')
      $('p[id = "calledFrom"]').html(from)

  var parentID = $('p[id = "calledFrom"]').html();
  
  console.log(parentID)

  // if(parentID.indexOf("fatherDetails") != -1  || parentID.indexOf("motherDetails") != -1)
  // {
  //     $('[class= "conditional"]').hide()
  // }
  // else {
  //     $('[class= "conditional"]').show()
  // }

  if(from === 'ok')
  {
      var ind =0,ind2=0,typeNo;
      for(var i=0; i<tabTypes.length; i++)
          if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;

      var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length

      for(var i=0; i<popupElmIds.length; i++)
          inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
      
      console.log(inputValues)

      divHtml = $('[id = '+ parentID +']').html()

      console.log(divHtml)
      $('[id = '+ parentID +']').html(
          '<div class="sub-part-row">'+
              '<p class="title">'+
                'Name'+
              '</p>'+
              '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistory(this.parentElement.parentElement.id)">Edit</button>'+
            '</div>'+
            '<div class="sub-sub-part">'+
              '<p>'+
              inputValues[fieldNames[ind++]]+
              '</p>'+
            '</div>' +           
            '<div class="collapse" id="'+'collapseExample'+parentID+'">'+
                '<hr>'+
              '<p class="title">'+
                'Birth date'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  'Born on '+ inputValues[fieldNames[ind++]] +
                '</p>'+
              '</div>'+
              '<hr>'+
              '<p class="title">'+
                'Health'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
              '<hr>'+
              '<p class="title">'+
                'Psychiatric'+
              '</p>'+
              '<div class="sub-sub-part">'+
                '<p>'+
                  inputValues[fieldNames[ind++]]+
                '</p>'+
              '</div> '+
            '</div>'+
            '<div class="extend">'+
              '<p>'+
                '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+parentID+'" id="seeMore'+ parentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
                  'See more'+
                '</a>'+
              '</p>'+
            '</div>'+
            '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
            '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
      )
      
      console.log(parentID+' typeNo= '+typeNo)
      // if(typeNo==0)
      //     $('#'+parentID+' > #collapseExample'+parentID+' > .conditional').hide()
      // if(typeNo==1)
      //     $('#'+parentID+' > #collapseExample'+parentID+' > .conditional').hide()

      
  }

  if (document.getElementById('popupFamilyHistoryRelative').style.display == "flex") {
      document.getElementById('popupFamilyHistoryRelative').style.display = "none";
  } else {
      document.getElementById('popupFamilyHistoryRelative').style.display = "flex";
  }
}

function togglePopUpFamilyHistoryAdd(from) {
  console.log("from="+from)

    if (document.getElementById('popupFamilyHistory').style.display == "flex") {
        document.getElementById('popupFamilyHistory').style.display = "none";
    } else {
        document.getElementById('popupFamilyHistory').style.display = "flex";
    }

    $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistoryAdd("ok")')
    $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistoryAdd("cancel")')


    var fieldNames =["name","gender","birthDate","health","psychiaty"]
    var popupElmIds = ["famimilyMemberName","famimilyMemberGender","famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
    var tabTypes = ["siblings", "children"]
    var collapseIds = ["collaplseExampleSiblings", "collaplseExampleChildren"]
    var detailIds = [ "siblingsDetails", "childrenDetails"]
    var inputValues = {

    }

    if(from !== 'ok' && from !== 'cancel')
        $('p[id = "calledFrom"]').html(from)

    var parentID = $('p[id = "calledFrom"]').html();
    
    console.log('parentID= '+parentID)



    if(from === 'ok')
    {
        var ind =0,ind2=0,typeNo;
        for(var i=0; i<tabTypes.length; i++)
            if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;
        familyCnt[typeNo]+=1
        $('#'+tabTypes[typeNo]+'Cnt').html('Total number: '+ familyCnt[typeNo])

        var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length
        console.log(detailIds[typeNo]+'  '+currentItemNo)

        for(var i=0; i<popupElmIds.length; i++)
            inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
        
        console.log(inputValues)

        var parent = document.getElementById(parentID)
        var newParentID = detailIds[typeNo]+(currentItemNo+1)
        console.log('newParentID= '+newParentID)
        var newDiv = document.createElement("div")
        parent.appendChild(newDiv)
        newDiv.outerHTML = 
        '<div class="sub-part" id="'+newParentID+'">'+
        '<div class="sub-part-row">'+
        '<p class="title">'+
          'Name'+
        '</p>'+
        '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistory(this.parentElement.parentElement.id)">Edit</button>'+
      '</div>'+
      '<div class="sub-sub-part">'+
        '<p>'+
        inputValues[fieldNames[ind++]]+
        '</p>'+
      '</div>' +           
      '<div class="collapse" id="'+'collapseExample'+newParentID+'">'+
          '<hr>'+
            '<p class="title">'+
              'Gender'+
            '</p>'+
            '<div class="sub-sub-part">'+
              '<p>'+
              inputValues[fieldNames[ind++]]+
              '</p>'+
            '</div>'+
        '<p class="title">'+
          'Birth date'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            'Born on '+ inputValues[fieldNames[ind++]] +
          '</p>'+
        '</div>'+
        '<hr>'+
        '<p class="title">'+
          'Health'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            inputValues[fieldNames[ind++]]+
          '</p>'+
        '</div> '+
        '<hr>'+
        '<p class="title">'+
          'Psychiatric'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            inputValues[fieldNames[ind++]]+
          '</p>'+
        '</div> '+
      '</div>'+
      '<div class="extend">'+
        '<p>'+
           '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+newParentID+'" id="seeMore'+ newParentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
            'See more'+
          '</a>'+
        '</p>'+
      '</div>'+
      '</div>'+
      '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
    }
}

function togglePopUpFamilyHistoryRelativeAdd(from) {
  console.log("from="+from)

    if (document.getElementById('popupFamilyHistoryRelative').style.display == "flex") {
        document.getElementById('popupFamilyHistoryRelative').style.display = "none";
    } else {
        document.getElementById('popupFamilyHistoryRelative').style.display = "flex";
    }

    $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistoryRelativeAdd("ok")')
    $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistoryRelativeAdd("cancel")')


    var fieldNames =["name","relation","gender","birthDate","health","psychiaty"]
    var popupElmIds = ["famimilyMemberName","famimilyMemberRelation","famimilyMemberGender","famimilyMemberBirthDate","famimilyMemberHealth","famimilyMemberPsychiatric"]
    var tabTypes = ["relative"]
    var collapseIds = ["collaplseExampleRelative"]
    var detailIds = [ "relativeDetails"]
    var inputValues = {

    }

    if(from !== 'ok' && from !== 'cancel')
        $('p[id = "calledFrom"]').html(from)

    var parentID = $('p[id = "calledFrom"]').html();
    
    console.log('parentID= '+parentID)



    if(from === 'ok')
    {
        var ind =0,ind2=0,typeNo;
        for(var i=0; i<tabTypes.length; i++)
            if(parentID.indexOf(tabTypes[i])!=-1) typeNo=i;
        familyCnt[typeNo]+=1
        $('#'+tabTypes[typeNo]+'Cnt').html('Total number: '+ familyCnt[typeNo])

        var currentItemNo = $('[id^="'+detailIds[typeNo]+'"]').length
        console.log(detailIds[typeNo]+'  '+currentItemNo)

        for(var i=0; i<popupElmIds.length; i++)
            inputValues[fieldNames[i]] = $('[id='+ popupElmIds[i] +']').val()
        
        console.log(inputValues)

        var parent = document.getElementById(parentID)
        var newParentID = detailIds[typeNo]+(currentItemNo+1)
        console.log('newParentID= '+newParentID)
        var newDiv = document.createElement("div")
        parent.appendChild(newDiv)
        newDiv.outerHTML = 
        '<div class="sub-part" id="'+newParentID+'">'+
        '<div class="sub-part-row">'+
        '<p class="title">'+
          'Name'+
        '</p>'+
        '<button type="button" class="btn btn-outline-dark" onclick="togglePopUpFamilyHistoryRelative(this.parentElement.parentElement.id)">Edit</button>'+
      '</div>'+
      '<div class="sub-sub-part">'+
        '<p>'+
        inputValues[fieldNames[ind++]]+
        '</p>'+
      '</div>' +           
      '<div class="collapse" id="'+'collapseExample'+newParentID+'">'+
          '<hr>'+
          '<p class="title">'+
                  'Relation with you'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    inputValues[fieldNames[ind++]]+
                  '</p>'+
                '</div>'+
                '<hr>'+
            '<p class="title">'+
              'Gender'+
            '</p>'+
            '<div class="sub-sub-part">'+
              '<p>'+
              inputValues[fieldNames[ind++]]+
              '</p>'+
            '</div>'+
        '<p class="title">'+
          'Birth date'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            'Born on '+ inputValues[fieldNames[ind++]] +
          '</p>'+
        '</div>'+
        '<hr>'+
        '<p class="title">'+
          'Health'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            inputValues[fieldNames[ind++]]+
          '</p>'+
        '</div> '+
        '<hr>'+
        '<p class="title">'+
          'Psychiatric'+
        '</p>'+
        '<div class="sub-sub-part">'+
          '<p>'+
            inputValues[fieldNames[ind++]]+
          '</p>'+
        '</div> '+
      '</div>'+
      '<div class="extend">'+
        '<p>'+
           '<a class="btn btn-light" data-toggle="collapse" href="#'+'collapseExample'+newParentID+'" id="seeMore'+ newParentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
            'See more'+
          '</a>'+
        '</p>'+
      '</div>'+
      '</div>'+
      '<input type="text" name="name" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="gender" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="birthDate" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="health" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'+
      '<input type="text" name="psychiatric" value= "'+inputValues[fieldNames[ind2++]] +'" style="display: none">'
    }
}


function changeButtonText(id)
{
    console.log(id)
    var elem = document.getElementById(id)
    if (elem.innerText=="See more") elem.innerText = "See less";
    else elem.innerText = "See more";
}

function displayOccupationDetails(id){

    var elem = document.getElementById(id)
    var el = document.getElementById("employmentDetails")
    var uel = document.getElementById("unemploymentDetails")
   
    if(id == "employed" && elem.checked){
        el.style.display = "block"
        uel.style.display = "none"
    }
    else {
        el.style.display = "none"
        uel.style.display = "block"
    }
}
function displayConditionalSection(id, conditionalSectionId){

  var elem = document.getElementById(id)
  var el = document.getElementById(conditionalSectionId)
  if(elem.value=="yes" && elem.checked){
      el.style.display = "block"
  }
  else {
      el.style.display = "none"
  }
}

function displayConditionalSectionCheckbox(id, conditionalSectionId){

  var elem = document.getElementById(id)
  var el = document.getElementById(conditionalSectionId)
  if(elem.checked){
      el.style.display = "block"
  }
  else {
      el.style.display = "none"
  }
}

function addVaccineDetails(){
    var parent = document.getElementById("vaccineDetails")
    var newDiv = document.createElement("div")
    parent.appendChild(newDiv)
    newDiv.outerHTML = '<div class="row" id= "vaccine">'+
    '<div class="col-7">'+
      '<input type="text" name="vaccine" placeholder="Vaccine name" />'+
    '</div>'+
    '<div class="row">'+
                  '<div class="col">'+
                    '<div class="custom-control custom-checkbox">'+
                      '<input '+
                        'type="radio" '+
                        'class="custom-control-input"'+
                        'id="vaccineCompleted"'+
                        'name="linguisticDevelopment"'+
                        'value="completed"'+
                        'checked'+
                      '>'+
                      '<label class="custom-control-label" for="vaccineCompleted">'+
                        'completed'+
                      '</label>'+
                    '</div>'+
                  '</div>'+
                  '<div class="col">'+
                    '<div class="custom-control custom-checkbox">'+
                      '<input '+
                        'type="radio"'+
                        'class="custom-control-input" '+
                        'id="vaccineNotCompleted"'+
                        'name="linguisticDevelopment"'+
                        'value="incomplete"'+
                      '>'+
                      '<label class="custom-control-label" for="vaccineNotCompleted">'+
                        'incomplete'+
                      '</label>'+
                    '</div>'+
                  '</div>'+
                  '<div class="col">'+
                  '</div>'+
                '</div>'+
  '</div>'
}

function showCount()
{
  var ids= ['siblingsDetails','childrenDetails','relativeDetails']
  var cntIds = ['siblingsCnt','childrenCnt','relativeCnt']
  for(var i = 0; i<ids.length; i++)
    {
        var items = document.querySelectorAll('[id='+ids[i]+']')
        console.log(ids[i]+' total number= '+items.length+'---------')
        $(cntIds[i]).html('Total number: '+items.length)


        // for(var j=0; j<items.length; j++){
        //     items[j].id = ids[i] + j.toString()
        //     $('#'+items[j].id+' > .extend > p:eq(0) > a:eq(0)').attr('id', 'seeMore' + items[j].id)
        // }   
    }



}
function onStart()
{
     // keep occupation details of step4 hidden at the beginning
     idsForHiddenElements=["coworkerInjuryDetails","substanceRashDetails", "offForIllnessDetails", "occuredBreathingProblemDetails", 
                            "jobChangeForInjuryDetails", "backProblemDetails", "employmentDetails", "unemploymentDetails", "cancerTypeContainerFamilyMember",
                          "cancerTypeContainerRelative", "cancerTypeContainerParent", "deathDetails", "deathDetailsRelative", "deathDetailsParent"]
    //  document.getElementById("coworkerInjuryDetails").style.display="none"
    //  document.getElementById("coworkerInjuryDetails").style.display="none"
    //  document.getElementById("coworkerInjuryDetails").style.display="none"
    //  document.getElementById("coworkerInjuryDetails").style.display="none"
     for(var i=0; i<idsForHiddenElements.length; i++){
      document.getElementById(idsForHiddenElements[i]).style.display="none"
     }
    //  var el = document.getElementById("employmentDetails")
    //  var uel = document.getElementById("unemploymentDetails")
    //  el.style.display="none"
    //  uel.style.display="none"
    var ids= ['fatherDetails','motherDetails','siblingsDetails','childrenDetails','relativeDetails']
    var cntIds = ['siblingsCnt','childrenCnt','relativeCnt']

    for(var i = 0; i<ids.length; i++)
    {
        var items = document.querySelectorAll('[id='+ids[i]+']')
        familyCnt[i] =  items.length
        console.log(ids[i]+' '+items.length+'---------')
        $('#'+cntIds[i]).html('Total number: '+ familyCnt[i])

        for(var j=0; j<items.length; j++){
            items[j].id = ids[i] + j.toString()
            $('#'+items[j].id+' > .extend > p:eq(0) > a:eq(0)').attr('id', 'seeMore' + items[j].id)
        }   
    }
}