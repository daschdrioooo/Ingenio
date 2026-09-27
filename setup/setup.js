const GRADES={
    gcse:["1","2","3","4","5","6","7","8","9"],
    alevel:["E","D","C","B","A","A*"],
};

const form=document.getElementById("setupForm");
const username=document.getElementById("username");
const counter=document.getElementById("counter");
const avatar=document.getElementById("avatar");
const avatarInitial=document.getElementById("avatarInitial");
const pfpInput=document.getElementById("pfp");
const removePfp=document.getElementById("removePfp");
const uploadLabel=document.getElementById("uploadLabel");
const submitBtn=document.getElementById("submitBtn");

let pfpUrl=null;

const icons=()=>lucide.createIcons();
const value=(name)=>form.querySelector(`input[name="${name}"]:checked`)?.value||null;

function setError(sectionId,message) {
    const section=document.getElementById(sectionId);
    section.classList.toggle("has-error",Boolean(message));
    section.querySelector(".error span").textContent=message||"";
}

function level() {
    const year=Number(value("year"));
    if (!year) return null;
    return year >=12?"alevel":"gcse";
}

function updateInitial() {
    if (pfpUrl) return;
    const first=username.value.trim().charAt(0).toUpperCase();
    avatarInitial.innerHTML=first||'<i data-lucide="user"></i>';
    if (!first) icons();
}

username.addEventListener("input",()=>{
    username.value=username.value.replace(/[^a-zA-Z0-9_]/g,"");
    counter.textContent=`${username.value.length}/20`;
    updateInitial();
    setError("usernameSection","");
});

pfpInput.addEventListener("change",()=>{
    const file=pfpInput.files[0];
    if (!file) return;
    if (file.size>5*1024*1024) {
        setError("usernameSection","That image is over 5MB, use a smaller one");
        pfpInput.value="";
        return;
    }
    if (pfpUrl) URL.revokeObjectURL(pfpUrl);
    pfpUrl=URL.createObjectURL(file);
    avatar.querySelector("img")?.remove();
    const img=document.createElement("img");
    img.src=pfpUrl;
    img.alt="";
    avatar.appendChild(img);
    uploadLabel.textContent="Change photo";
    removePfp.hidden=false;
    setError("usernameSection","");
});

removePfp.addEventListener("click",()=>{
    if (pfpUrl) URL.revokeObjectURL(pfpUrl);
    pfpUrl=null;
    pfpInput.value="";
    avatar.querySelector("img")?.remove();
    uploadLabel.textContent="Upload photo";
    removePfp.hidden=true;
    updateInitial();
});

function renderGrades() {
    const lvl=level();
    const prevCurrent=value("current");
    const prevTarget=value("target");
    document.querySelectorAll("[data-grades]").forEach((box)=>{
        const name=box.dataset.grades;
        if (!lvl) {
            box.innerHTML='<div class="placeholder-note"><i data-lucide="info"></i> Pick your year group first</div>';
            return;
        }
        const grades=GRADES[lvl];
        const extra=name==="current"?'<label class="chip chip--wide"><input type="radio" name="current" value="unsure"><span>Not sure</span></label>':"";
        box.innerHTML=grades.map((g)=>`<label class="chip"><input type="radio" name="${name}" value="${g}"><span>${g}</span></label>`).join("")+extra;
    });
    if (prevCurrent) form.querySelector(`input[name="current"][value="${CSS.escape(prevCurrent)}"]`)?.click();
    if (prevTarget) form.querySelector(`input[name="target"][value="${CSS.escape(prevTarget)}"]`)?.click();
    lockTargets();
    icons();
}

function lockTargets() {
    const lvl=level();
    if (!lvl) return;
    const scale=GRADES[lvl];
    const current=value("current");
    const floor=scale.indexOf(current);
    form.querySelectorAll('input[name="target"]').forEach((input)=>{
        const tooLow=floor>-1&&scale.indexOf(input.value)<floor;
        input.disabled=tooLow;
        if (tooLow&&input.checked) input.checked=false;
    });
}

function updateSubjectText() {
    const lvl=level();
    document.getElementById("mathsDesc").textContent=lvl==="alevel"?"A level maths idk":"GCSE maths idk";
    document.getElementById("furtherDesc").textContent=lvl==="alevel"?"a level fm":"l2 fm a level";
}

const steps=[...document.querySelectorAll(".step")];
const segs=[...document.querySelectorAll(".progress__seg")];
const stepCount=document.getElementById("stepCount");
const backBtn=document.getElementById("backBtn");
const submitText=document.getElementById("submitText");
let current=0;
const checks=[
    ()=>{
        const u=username.value.trim();
        if (!u) return "Choose a username";
        if (u.length<3) return "Usernames need at least 3 characters";
        return "";
    },
    ()=>(value("year")?"":"Pick your year group"),
    ()=>(value("subject")?"":"Pick maths or further maths"),
    ()=>(value("current")?"":"Pick your current grade, or choose not sure"),
    ()=>(value("target")?"":"Pick a target grade"),
];

function showStep(index,goingBack=false) {
    steps[current].classList.remove("active","back");
    current=index;
    const step=steps[current];
    step.classList.toggle("back",goingBack);
    step.classList.add("active");
    segs.forEach((seg,i)=>seg.classList.toggle("done",i<=current));
    stepCount.textContent=`Step ${current + 1} of ${steps.length}`;
    backBtn.toggleAttribute("data-invisible",current===0);
    submitText.textContent=current===steps.length-1?"Finish setup":"Continue";
    const first=step.querySelector('input[type="text"], input:checked');
    first?.focus({preventScroll:true});
}

backBtn.addEventListener("click",()=>{
    if (current>0) showStep(current-1,true);
});

form.addEventListener("change",(e)=>{
    const name=e.target.name;
    if (name==="year") {
        renderGrades();
        updateSubjectText();
        setError("yearSection","");
    }
    if (name==="subject") setError("subjectSection","");
    if (name==="current") {
        lockTargets();
        setError("currentSection","");
    }
    if (name==="target") {
        setError("targetSection","");
    }
});

const formAlert=document.getElementById("formAlert");
let user=null;

function setAlert(message) {
    formAlert.classList.toggle("show",Boolean(message));
    formAlert.querySelector("span").textContent=message||"";
}

function setBusy(on) {
    submitBtn.classList.toggle("loading",on);
    submitBtn.disabled=on;
    backBtn.disabled=on;
}

async function usernameFree(name) {
    const {data,error}=await sb.rpc("username_available",{name});
    if (error) {
        console.warn("username check skipped",error.message);
        return true;
    }
    return data===true;
}

async function uploadAvatar(file) {
    const ext={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"}[file.type]||"png";
    const path=`${user.id}/avatar.${ext}`;
    const {error}=await sb.storage.from("avatars").upload(path,file,{
        upsert:true,
        contentType:file.type,
        cacheControl:"3600",
    });
    if (error) throw error;
    const {data}=sb.storage.from("avatars").getPublicUrl(path);
    return `${data.publicUrl}?v=${Date.now()}`;
}

async function saveProfile() {
    const file=pfpInput.files[0];
    const avatarUrl=file?await uploadAvatar(file):null;
    const {error}=await sb.from("profiles").upsert({
        id:user.id,
        username:username.value.trim(),
        avatar_url:avatarUrl,
        year_group:Number(value("year")),
        level:level(),
        subject:value("subject"),
        current_grade:value("current"),
        target_grade:value("target"),
    });
    if (error) throw error;
}

form.addEventListener("submit",async (e)=>{
    e.preventDefault();
    setAlert("");
    const message=checks[current]();
    setError(steps[current].id,message);
    if (message) return;
    if (current===0) {
        setBusy(true);
        const free=await usernameFree(username.value.trim());
        setBusy(false);
        if (!free) {
            setError("usernameSection","That username is taken, try another.");
            username.focus();
            return;
        }
    }
    if (current<steps.length-1) {
        showStep(current+1);
        return;
    }
    setBusy(true);
    try {
        await saveProfile();
        go("home");
    } catch (error) {
        setBusy(false);
        console.error(error);
        if (error.code==="23505") {
            //someone sniped in the meantime
            showStep(0,true);
            setError("usernameSection","Sorry, that username JUST got taken. Try another.");
            username.focus();
        } else {
            setAlert("Couldn't save your answers, check your connection");
        }
    }
});

document.getElementById("signOut").addEventListener("click",async()=>{
    await sb.auth.signOut();
    go("login");
});

form.addEventListener("keydown",(e)=>{
    if (e.key==="Enter"&&e.target.type==="radio") {
        e.preventDefault();
        form.requestSubmit();
    }
});

renderGrades();
updateSubjectText();
showStep(0);
icons();

(async ()=>{
    const {data}=await sb.auth.getSession();
    if (!data.session) {
        go("login");
        return;
    }
    user=data.session.user;
    try {
        if (await getProfile(user.id)) {
            go("home");
            return;
        }
    } catch (error) {
        console.error(error);
    }
    document.body.classList.remove("checking");
    username.focus();
})();