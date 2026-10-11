const user={
    id:null,
    username:"",
    email:"",
    avatarUrl:null,
    yearGroup:null,
    level:"gcse",
    subject:"maths",
    examBoard:"Edexcel",
    streak:0,
    xp:0
};

const $=(id)=>document.getElementById(id);
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
});

document.addEventListener("click",(e)=>{
    if (!e.target.closest(".menu")) closeDrops();
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="Escape") closeDrops();
});

function markSelected(drop,value) {
    drop.querySelectorAll("[data-value]").forEach((item)=>{
        item.classList.toggle("selected",item.dataset.value===value);
    });
}

$("levelDrop").querySelectorAll("[data-value]").forEach((item)=>{
    item.addEventListener("click",()=>{
        $("levelName").textContent=item.dataset.value;
        markSelected($("levelDrop"),item.dataset.value);
        closeDrops();
    });
});

function renderBoard() {
    $("boardName").textContent=user.examBoard;
    markSelected($("boardDrop"),user.examBoard);
}

async function saveBoard() {
    const {error}=await sb.from("profiles").update({exam_board:user.examBoard}).eq("id",user.id);
    if (error) console.warn("Couldn't save exam board:",error.message);
}

$("boardDrop").querySelectorAll("[data-value]").forEach((item)=>{
    item.addEventListener("click",()=>{
        user.examBoard=item.dataset.value;
        renderBoard();
        closeDrops();
        saveBoard();
    });
});

function renderAccount() {
    const level=user.level==="alevel"?"A-level":"GCSE";
    const subject=user.subject==="further"?"Further Maths":"Maths";
    $("levelName").textContent=level;
    markSelected($("levelDrop"),level);
    $("menuName").textContent=user.username;
    $("menuCourse").textContent=`Year ${user.yearGroup} · ${level} ${subject}`;
    $("menuEmail").textContent=user.email;
    const avatar=$("avatar");
    if (user.avatarUrl) {
        const img=document.createElement("img");
        img.src=user.avatarUrl;
        img.alt="";
        avatar.replaceChildren(img);
    } else {
        avatar.textContent=user.username.charAt(0).toUpperCase();
    }
    $("streak").textContent=user.streak;
    $("xp").textContent=user.xp.toLocaleString("en-GB");
}

$("logOutBtn").addEventListener("click",async ()=>{
    await sb.auth.signOut();
    go("hero");
});

document.querySelectorAll("#nav a").forEach((link)=>{
    link.addEventListener("click",(e)=>{
        e.preventDefault();
        document.querySelectorAll("#nav a").forEach((a)=>a.classList.remove("active"));
        link.classList.add("active");
    });
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="/"&&document.activeElement.tagName!=="INPUT") {
        e.preventDefault();
        $("search").focus();
    }
});

(async ()=>{
    const {data}=await sb.auth.getSession();
    if (!data.session) {
        go("login");
        return;
    }
    const profile=await getProfile(data.session.user.id).catch(()=>null);
    if (!profile) {
        go("setup");
        return;
    }
    user.id=profile.id;
    user.username=profile.username;
    user.email=data.session.user.email;
    user.avatarUrl=profile.avatar_url;
    user.yearGroup=profile.year_group;
    user.level=profile.level;
    user.subject=profile.subject;
    user.examBoard=profile.exam_board||"Edexcel";
    renderBoard();
    renderAccount();
    lucide.createIcons();
    document.body.classList.remove("checking");
})();