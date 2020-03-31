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
  console.log(activeId)
  $('.selected-nav-item').addClass('hrline').removeClass('selected-nav-item');
  $("#"+activeId).addClass('selected-nav-item').removeClass('hrline');
   
}
  
function onStart(){
    // Get the element with id="defaultOpen" and click on it
   
}
  