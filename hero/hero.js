lucide.createIcons();

const countryBtn=document.getElementById("countryBtn");
const countryMenu=document.getElementById("countryMenu");

function setCountryMenu(open) {
    countryMenu.hidden=!open;
    countryBtn.setAttribute("aria-expanded",open);
}

countryBtn.addEventListener("click",(e)=>{
    e.stopPropagation();
    setCountryMenu(countryMenu.hidden);
});

document.addEventListener("click",(e)=>{
    if (!countryMenu.contains(e.target)) setCountryMenu(false);
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="Escape") setCountryMenu(false);
});

countryMenu.querySelector(".menu__item").addEventListener("click",()=>setCountryMenu(false));