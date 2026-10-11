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
        lessonsState.board=user.examBoard.toLowerCase();
        lessonsState.courseId=null;
        if (main.dataset.view==="lessons") renderLessons();
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

function renderGreeting() {
    const now=new Date();
    const hour=now.getHours();
    const partOfDay=hour<12?"morning":hour<18?"afternoon":"evening";
    const level=user.level==="alevel"?"A-level":"GCSE";
    const subject=user.subject==="further"?"Further Maths":"Maths";
    $("greeting").textContent=`Good ${partOfDay}, ${user.username}!`;
    $("today").textContent=now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})+` · Year ${user.yearGroup} · ${level} ${subject}`;
}

const PLAN = [
    {topic:"placeholder",grade:9,type:"lesson",detail:"placeholderdetail",minutes:15,done:true},
    {topic:"undoneplaceholder",grade:9,type:"lesson",detail:"undoneplaceholder",minutes:15,done:false}
];

function renderPlan() {
    $("planList").innerHTML=PLAN.map((task,i)=>`
    <li>
        <button type="button" class="task${task.done ? " done":""}" data-index="${i}">
            <span class="task__tick"><i data-lucide="check"></i></span>
            <span class="task__info">
                <span class="task__name"><span class="task__topic">${task.topic}</span> <span class="tag">Grade ${task.grade}</span></span>
                <span class="task__meta">
                    <i data-lucide="${task.type==="lesson"?"book-open":"pencil-line"}"></i>
                    ${task.detail} · ${task.minutes} min
                </span>
            </span>
        </button>
    </li>`).join("");
    const done=PLAN.filter((t)=>t.done).length;
    const minutesLeft=PLAN.filter((t)=>!t.done).reduce((sum,t)=>sum+t.minutes,0);
    $("planFill").style.width=`${(done / PLAN.length)*100}%`;
    $("planCount").textContent=`${done} of ${PLAN.length} done`;
    $("planTime").textContent=minutesLeft?`${minutesLeft} min left`:"All done";
    const finished=done===PLAN.length;
    $("planBtn").classList.toggle("is-finished",finished);
    $("planBtn").innerHTML=finished?'Done for today <i data-lucide="party-popper"></i>':'Start next <i data-lucide="arrow-right"></i>';
    lucide.createIcons();
}

$("planList").addEventListener("click",(e)=>{
    const task=e.target.closest(".task");
    if (!task) return;
    PLAN[task.dataset.index].done=!PLAN[task.dataset.index].done;
    renderPlan();
});

const main=$("main");
function showView(view) {
    if (!document.querySelector(`[data-page="${view}"]`)) return;
    main.dataset.view=view;
    document.querySelectorAll("[data-page]").forEach((page)=>(page.hidden=page.dataset.page!==view));
    document.querySelectorAll("#nav a").forEach((a)=>a.classList.toggle("active",a.dataset.view===view));
    main.scrollTop=0;
    if (view==="lessons") renderLessons();
}

document.querySelectorAll("#nav a").forEach((link)=>{
    link.addEventListener("click",(e)=>{
        e.preventDefault();
        showView(link.dataset.view);
    });
});

let LESSONS={};
const lessonsState={
    board:"edexcel",
    courseId:null,
    term:0,
    search:"",
};

const escapeHtml=(text)=>text.replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const courseLabel=(course)=>`${course.year} ${course.tier[0].toUpperCase()}${course.tier.slice(1)}`;
const termLabel=(term)=>term.title.replace(/^Y\d+\s*/,"");

function highlight(title) {
    const safe=escapeHtml(title);
    if (!lessonsState.search) return safe;
    const at=title.toLowerCase().indexOf(lessonsState.search);
    if (at===-1) return safe;
    const end=at+lessonsState.search.length;
    return escapeHtml(title.slice(0,at))+"<mark>"+escapeHtml(title.slice(at,end))+"</mark>"+escapeHtml(title.slice(end));
}

function lessonRow(lesson,number) {
    const ready=Boolean(lesson.ppt);
    return `
    <button type="button" class="lesson${ready?"":" is-soon"}" data-ppt="${ready ? escapeHtml(lesson.ppt) : ""}">
        <span class="lesson__num">${number}</span>
        <span class="lesson__title">${highlight(lesson.title)}</span>
        <span class="lesson__status">${ready?'Open <i data-lucide="chevron-right"></i>':"Soon"}</span>
    </button>`;
}

function topicCard(topic,note) {
    const count=`${topic.lessons.length} lesson${topic.lessons.length===1?"":"s"}`;
    return `
    <section class="topic">
        <div class="topic__head">
            <h2 class="topic__title">${escapeHtml(topic.title)}</h2>
            <span class="topic__count">${note ? note+" · ":""}${count}</span>
        </div>
        ${topic.lessons.map((lesson,i)=>lessonRow(lesson,i+1)).join("")}
    </section>`;
}

function renderLessons() {
    const board=LESSONS[lessonsState.board];
    if (!board) {
        $("lessonsSpec").textContent="";
        $("courses").innerHTML="";
        $("terms").innerHTML="";
        $("topicList").innerHTML='<p class="empty">Lessons for this exam board are coming soon!</p>';
        return;
    }
    $("lessonsSpec").textContent=board.spec;
    if (!board.courses.some((c)=>c.id===lessonsState.courseId)) {
        lessonsState.courseId=board.courses[0].id;
        lessonsState.term=0;
    }
    const course=board.courses.find((c)=>c.id===lessonsState.courseId);
    $("courses").innerHTML=board.courses.map((c)=>
        `<button type="button" class="pill${c.id===course.id?" active":""}" data-course="${c.id}">${courseLabel(c)}</button>`
    ).join("");
    if (lessonsState.search) {
        $("terms").innerHTML="";
        const matches=[];
        course.terms.forEach((term)=>{
            term.topics.forEach((topic)=>{
                const lessons=topic.lessons.filter((l)=>l.title.toLowerCase().includes(lessonsState.search));
                if (lessons.length) matches.push(topicCard({...topic,lessons},termLabel(term)));
            });
        });
        $("topicList").innerHTML=matches.join("")||`<p class="empty">No lessons match "${escapeHtml(lessonsState.search)}."</p>`;
    } else {
        $("terms").innerHTML=course.terms.map((term,i)=>`<button type="button" class="term${i ===lessonsState.term?" active":""}" data-term="${i}">${termLabel(term)}</button>`).join("");
        $("topicList").innerHTML=course.terms[lessonsState.term].topics.map((topic)=>topicCard(topic)).join("");
    }
    lucide.createIcons();
}

$("courses").addEventListener("click",(e)=>{
    const pill=e.target.closest("[data-course]");
    if (!pill) return;
    lessonsState.courseId=pill.dataset.course;
    lessonsState.term=0;
    renderLessons();
});

$("terms").addEventListener("click",(e)=>{
    const tab=e.target.closest("[data-term]");
    if (!tab) return;
    lessonsState.term=Number(tab.dataset.term);
    renderLessons();
});

$("topicList").addEventListener("click",(e)=>{
    const row=e.target.closest(".lesson");
    if (!row||!row.dataset.ppt) return;
    window.open("https://view.officeapps.live.com/op/embed.aspx?src="+encodeURIComponent(row.dataset.ppt),"_blank");
});

$("search").addEventListener("input",(e)=>{
    lessonsState.search=e.target.value.trim().toLowerCase();
    if (main.dataset.view!=="lessons") showView("lessons");
    else renderLessons();
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
    renderGreeting();
    renderPlan();
    lessonsState.board=user.examBoard.toLowerCase();
    try {
        LESSONS=await (await fetch("../data/lessons.json")).json();
    } catch (error) {
        console.error("couldnt load lessons.json:",error);
    }
    lucide.createIcons();
    document.body.classList.remove("checking");
})();