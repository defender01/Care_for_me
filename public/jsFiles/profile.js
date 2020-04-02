function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  
function changeAppearance(activeId){
  $('.selected-nav-item').addClass('hrline').removeClass('selected-nav-item');
  $("#"+activeId).addClass('selected-nav-item').removeClass('hrline');
   
}

function changeTab(activeId){
  console.log(activeId)
  $(".family-tab").css("display", "none");
  $("#"+activeId).css("display", "block");
  console.log("active id="+activeId)
}
function changeButtonText(id)
{
    // console.log(id)
    var elem = document.getElementById(id)
    if (elem.innerText=="See more") elem.innerText = "See less";
    else elem.innerText = "See more";
}

function onStart(){
    // Get the element with id="defaultOpen" and click on it
    $("#about-tab").addClass('selected-nav-item').removeClass('hrline');
   changeTab("parentsId");
}
  