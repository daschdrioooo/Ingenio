lucide.createIcons();

const PRICES={
    monthly:{amount:"£3.99",per:"/ month",note:"You can cancel at any time."},
    yearly:{amount:"£29.99",per:"/ year",note:"That's £2.50 a month!"}
};

document.querySelectorAll("[data-billing]").forEach((btn)=>{
    btn.addEventListener("click",()=>{
        const price=PRICES[btn.dataset.billing];
        document.getElementById("premiumAmount").textContent=price.amount;
        document.getElementById("premiumPer").textContent=price.per;
        document.getElementById("premiumNote").textContent=price.note;
        document.querySelectorAll("[data-billing]").forEach((b)=>b.setAttribute("aria-pressed",b===btn));
    });
});

const drops=[...document.querySelectorAll(".drop")];
function setDrop(drop,open) {
    drop.querySelector(".menu").hidden=!open;
    drop.querySelector(".drop__btn").setAttribute("aria-expanded",open);
}

function closeDrops() {
    drops.forEach((drop)=>setDrop(drop,false));
}

drops.forEach((drop)=>{
    drop.querySelector(".drop__btn").addEventListener("click",(e)=>{
        e.stopPropagation();
        const wasOpen=!drop.querySelector(".menu").hidden;
        closeDrops();
        setDrop(drop,!wasOpen);
    });
    drop.querySelectorAll("[data-value]").forEach((item)=>{
        item.addEventListener("click",()=>{
            const value=drop.querySelector(".drop__value");
            value.textContent=item.dataset.value;
            value.classList.remove("placeholder");
            drop.querySelectorAll("[data-value]").forEach((i)=>i.classList.toggle("selected",i===item));
            closeDrops();
        });
    });
});

document.addEventListener("click",(e)=>{
    if (!e.target.closest("menu")) closeDrops();
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="Escape") closeDrops();
});