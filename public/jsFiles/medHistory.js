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

function togglePopUp(name) {
    var btn = document.getElementById('collapse-button');
    if (document.getElementById('popup').style.display == "flex") {
      document.getElementById('popup').style.display = "none";
    } else {
      document.getElementById('popup').style.display = "flex";
      btn.innerText = name;
    }
  }

  function togglePopUpFamilyHistory(from) {
    if(from === "parents")
        document.getElementById('conditional').style.display = 'none'
    else if(from === 'ok'){
            
        document.getElementById('conditional').style.display = 'inline'
    }
    if (document.getElementById('popup').style.display == "flex") {
        document.getElementById('popup').style.display = "none";
    } else {
        document.getElementById('popup').style.display = "flex";
    }
}
  
function changeButtonText(id)
{
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
    var items = document.querySelectorAll('[id="seeMore"]')
    // keep occupation details of step4 hidden at the beginning
    var el = document.getElementById("employmentDetails")
    var uel = document.getElementById("unemploymentDetails")
    el.style.display="none"
    uel.style.display="none"
   
 
    for(var i=0; i<items.length; i++){
        items[i].id='seeMore'+i.toString()
    }
}
