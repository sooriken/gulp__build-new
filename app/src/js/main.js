document.getElementById("sidenavOpen").addEventListener('click',function (){
    document.getElementById("sidenav").classList.remove("side-nav--hidden");
    document.getElementById("sidenavPlaceholder").classList.remove("side-nav__placeholder--hidden");
}); 

document.getElementById("sidenavClose").addEventListener('click',function (){
    document.getElementById("sidenav").classList.add("side-nav--hidden");
    document.getElementById("sidenavPlaceholder").classList.add("side-nav__placeholder--hidden");
}); 