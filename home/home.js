lucide.createIcons();

const sideBar = document.getElementById("sideBar");
const items = document.querySelectorAll("#nav li");
const panels = document.querySelectorAll(".panel");

items.forEach(li => {
    li.addEventListener("click", () => {
        items.forEach(i => i.classList.remove("selected"));
        li.classList.add("selected");
        panels.forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".background").forEach(background => {
            background.classList.remove("open");
        });

        const panel = document.getElementById(li.dataset.panel);
        const background = document.getElementById(`${li.dataset.panel}Background`);

        panel.classList.add("active");
        background?.classList.add("open");
        sideBar.classList.add("open");
    });
});

document.querySelectorAll(".tabs").forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll(".tab");
    const contents = tabGroup.parentElement.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            contents.forEach(c => c.classList.remove("active"));
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
});

document.getElementById("retractBtn").addEventListener("click", () => {
    sideBar.classList.add("retracted");
    document.body.classList.add("retracted");
});

document.getElementById("expandBtn").addEventListener("click", () => {
    sideBar.classList.remove("retracted");
    document.body.classList.remove("retracted");
});

document.querySelectorAll(".lessonLink").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        document.getElementById("pptViewer").src =
            `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link.dataset.ppt)}`;

        sideBar.classList.add("retracted");
        document.body.classList.add("retracted");
    });
});

(async () => {
    const { data } = await sb.auth.getSession();
    if (!data.session) {
        go("login");
        return;
    }
    const profile=await getProfile(data.session.user.id).catch(()=>null);
    if (!profile) {
        go("setup");
        return;
    }
    document.getElementById("username").textContent=profile.username;
    document.getElementById("userEmail").textContent=data.session.user.email;
    const level = profile.level==="alevel"?"A-level":"GCSE";
    const subject = profile.subject==="further"?"Further Maths":"Maths";
    document.getElementById("userMeta").textContent=`Year ${profile.year_group} | ${level} ${subject}`;
    const avatarBox=document.getElementById("avatarBox");
    if (profile.avatar_url) {
        const img=document.createElement("img");
        img.src=profile.avatar_url;
        img.alt="";
        avatarBox.replaceChildren(img);
    } else {
        avatarBox.textContent=profile.username.charAt(0).toUpperCase();
    }
})();

const userFoot = document.getElementById("userFoot");
const profileMenu = document.getElementById("profileMenu");
const logOutBtn = document.getElementById("logOutBtn");

function setMenu(open) {
    profileMenu.hidden=!open;
    userFoot.classList.toggle("active",open);
}

userFoot.addEventListener("click",(e)=>{
    e.stopPropagation();
    setMenu(profileMenu.hidden);
});

userFoot.addEventListener("keydown",(e)=>{
    if (e.key==="Enter" || e.key === "") {
        e.preventDefault();
        setMenu(profileMenu.hidden);
    }
});

document.addEventListener("click",(e)=>{
    if (!profileMenu.contains(e.target)) setMenu(false);
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="Escape") setMenu(false);
});

logOutBtn.addEventListener("click",async()=>{
    logOutBtn.disabled=true;
    logOutBtn.querySelector("span").textContent="Logging out...";
    await sb.auth.signOut();
    go("hero");
});