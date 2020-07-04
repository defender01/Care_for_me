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

function changeButtonText(id)
{
    // console.log(id)
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



function displayConditionalSectionCheckbox(id, conditionalSectionId){

  var elem = document.getElementById(id)
  var el = document.getElementById(conditionalSectionId)
  if(elem!=null && el!=null){
    if(elem.checked){
      el.style.display = "block"
    }
    else {
      el.style.display = "none"
    }
  }
}

function onStart()
{
     // keep occupation details of step4 hidden at the beginning
     let idsForHiddenElements=["coworkerInjuryDetails","substanceRashDetails", "offForIllnessDetails", "occuredBreathingProblemDetails", 
                            "jobChangeForInjuryDetails", "backProblemDetails", "employmentDetails", "unemploymentDetails", "cancerTypeContainerFamilyMember",
                          "cancerTypeContainerRelative", "cancerTypeContainerParent", "deathDetails", "deathDetailsRelative", "deathDetailsParent", 
                        ]
   
     for(var i=0; i<idsForHiddenElements.length; i++){
       var el=document.getElementById(idsForHiddenElements[i])
       if(el!=null){
          el.style.display="none";
       }
     }

    // var ids= ['fatherDetails','motherDetails','siblingsDetails','childrenDetails','relativeDetails']

    // for(var i = 0; i<ids.length; i++)
    // {
    //     var items = document.querySelectorAll('[id='+ids[i]+']')
    //     console.log(ids[i]+' '+items.length+'---------')

    //     for(var j=0; j<items.length; j++){
    //         items[j].id = ids[i] + j.toString()
    //         $('#'+items[j].id+' > .extend > p:eq(0) > a:eq(0)').attr('id', 'seeMore' + items[j].id)
    //     }   
    // }
}
