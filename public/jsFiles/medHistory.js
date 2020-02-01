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

function togglePopUp() {

    var i;
    for (i = 1; i < arguments.length; i++) {
        var str1,str2, htmlForCollapse;

        var htmlForCollapsePart1 = ' <div class="card"> ' +
                            ' <div class="card-header" id="heading-' + i +'"  data-toggle="collapse" data-target="#collapse-' + i +'" > ' +
                            '<h5 class="mb-0">';

        var htmlForCollapsePart2 = arguments[i] +
                                '</a>' +
                            '</h5>' +
                            '</div>';

        var htmlForCollapsePart3 = '<div class="collapse-card-body">' + 
                                '<label class="fieldlabels" for="first_use-'+arguments[i] + '">Age when you first used this:</label>' +
                                '<input type="text" name="first_use-'+arguments[i] + '" id="first_use-'+arguments[i] + '" placeholder="" />' +

                                '<label class="fieldlabels" for="how_much_use-'+arguments[i] + '">How much & how often did you use this?</label>' +
                                '<input type="text" name="how_much_use-'+arguments[i] + '" id="how_much_use-'+arguments[i] + '" placeholder="" />' +

                                '<label class="fieldlabels" for="how_many_year-'+arguments[i] + '">How many years did you use this?</label>' +
                                '<input type="text" name="how_many_year-'+arguments[i] + '" id="how_many_year-'+arguments[i] + '" placeholder="" />' +
                                
                                '<label class="fieldlabels" for="last_use-'+arguments[i] + '">When did you last use this?</label>' +
                                '<input type="text" name="last_use-'+arguments[i] + '" id="last_use-'+arguments[i] + '" placeholder="" />' +

                                '<label class="fieldlabels" for="currently_use">Do you currently use this?</label>' +
                                '<div>' +
                                '<div class="custom-control custom-radio">' +
                                    '<input type="radio" id="radio_yes-'+arguments[i] + '" name="currently_use-'+arguments[i] + '" class="custom-control-input" value="yes">' +
                                    '<label class="custom-control-label" for="radio_yes-'+arguments[i] + '">Yes</label>' +
                                '</div>' +
                                '<div class="custom-control custom-radio">' +
                                    '<input type="radio" id="radio_no-'+arguments[i] + '" name="currently_use-'+arguments[i] + '" class="custom-control-input" value="no">' +
                                    '<label class="custom-control-label" for="radio_no-'+arguments[i] + '">No</label>' +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                            '</div>' +

                        '</div>';
        
        if(i==1){
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
    
    if(arguments[0]=='h6'){
        $("#accordion :input").attr("disabled", true);
    }

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

}


function displayWhereInputField(id){

}

function togglePopUpFamilyHistory(from) {
    var fieldNames =["name","gender","birthDate","healthAndPsychiaty"]
    var popupElmIds = ["famimilyMemberName","famimilyMemberGender","famimilyMemberBirthDate","famimilyMemberHealthAndPsychiatric"]
    var tabTypes = ["father", "mother", "siblings", "children"]
    var collapseIds = ["collapseExampleFather", "collaplseExampleMother", "collaplseExampleSiblings", "collaplseExampleChildren"]
    var detailIds = ["fatherDetails", "motherDetails", "siblingsDetails", "childrenDetails"]
    var inputValues = {

    }

    $('[id="popupOk"]').attr('onclick','togglePopUpFamilyHistory("ok")')
    $('[id="popupCancel"]').attr('onclick','togglePopUpFamilyHistory("cancel")')

    if(from !== 'ok' && from !== 'cancel')
        $('p[id = "calledFrom"]').html(from)

    var parentID = $('p[id = "calledFrom"]').html();
    
    console.log(parentID)

    if(parentID.indexOf("fatherDetails") != -1  || parentID.indexOf("motherDetails") != -1)
    {
        $('[class= "conditional"]').hide()
    }
    else {
        $('[class= "conditional"]').show()
    }

    if(from === 'ok')
    {
        var ind =0,typeNo;
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
              '<div class="collapse" id="'+collapseIds[typeNo]+currentItemNo+1+'">'+
                  '<hr>'+
                  '<div class="conditional">'+
                    '<p class="title">'+
                      'Gender'+
                    '</p>'+
                    '<div class="sub-sub-part">'+
                      '<p>'+
                      inputValues[fieldNames[ind++]]+
                      '</p>'+
                    '</div>'+
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
                  'Health & Psychiatric'+
                '</p>'+
                '<div class="sub-sub-part">'+
                  '<p>'+
                    inputValues[fieldNames[ind++]]+
                  '</p>'+
                '</div> '+
              '</div>'+
              '<div class="extend">'+
                '<p>'+
                  '<a class="btn btn-light" data-toggle="collapse" href="#'+collapseIds[typeNo]+currentItemNo+1+'" id="seeMore'+ parentID +'" role="button" onclick="changeButtonText(this.id)" aria-expanded="false" aria-controls="collapseExample">'+
                    'See more'+
                  '</a>'+
                '</p>'+
              '</div>'
        )
        
        console.log(parentID)
        if(typeNo==0)
            $('#'+parentID+' > #collapseExampleFather > .conditional').hide()
        if(typeNo==1)
            $('#'+parentID+' > #collapseExampleMother > .conditional').hide()

        
    }

    if (document.getElementById('popupFamilyHistory').style.display == "flex") {
        document.getElementById('popupFamilyHistory').style.display = "none";
    } else {
        document.getElementById('popupFamilyHistory').style.display = "flex";
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

function addVaccineDetails(){
    var parent = document.getElementById("vaccineDetails")
    var newDiv = document.createElement("div")
    parent.appendChild(newDiv)
    newDiv.outerHTML = '<div class="row" id= "vaccine">'+
    '<div class="col-7">'+
      '<input type="text" name="vaccine" placeholder="Vaccine name" />'+
    '</div>'+
    '<div class="col-5">'+
      '<input type="text" name="date_taken" placeholder="Date" />'+
    '</div>'+
  '</div>'
  var el= document.querySelectorAll('vaccine')
}

function onStart()
{
     // keep occupation details of step4 hidden at the beginning
     var el = document.getElementById("employmentDetails")
     var uel = document.getElementById("unemploymentDetails")
     el.style.display="none"
     uel.style.display="none"

     $('#fatherDetails > #collapseExampleFather > .conditional').hide()
     $('#motherDetails > #collapseExampleMother > .conditional').hide()
 
    var ids= ['fatherDetails','motherDetails','siblingDetails','childrenDetails','relativeDetails']
    for(var i = 0; i<ids.length; i++)
    {
        var items = document.querySelectorAll('[id='+ids[i]+']')
        console.log(ids[i]+' '+items.length+'---------')

        for(var j=0; j<items.length; j++){
            items[j].id = ids[i] + j.toString()
            $('#'+items[j].id+' > .extend > p:eq(0) > a:eq(0)').attr('id', 'seeMore' + items[j].id)
        }   
    }
}