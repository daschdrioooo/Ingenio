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

const XP_PER_QUESTION=10;

const PRACTICE_FOR_LESSON={
    gcse_introduction_to_surds_lesson:["simplifying_surds"],
    gcse_simplifying_surds_lesson:["simplifying_surds"],
    gcse_adding_and_subtracting_surds_with_simplifying_lesson:["adding-surds"],
    gcse_rationalising_single_term_surd_denominators_lesson:["rationalising-denominators"],
    gcse_numerical_laws_of_indices_lesson:["laws-of-indices","zero-powers"],
    gcse_negative_indices_lesson:["negative-indices"],
    gcse_negative_powers_as_reciprocals_lesson:["negative-indices"],
    gcse_fractional_indices_lesson:["fractional-indices"],
    "gcse_solving_one_step_linear_equations_lesson":["two-step-equations"],
    gcse_solving_linear_equations_by_balancing_lesson:["two-step-equations","equations-with-brackets"],
    gcse_solving_lienar_equations_with_unknowns_on_both_sides_lesson:["unknowns-both-sides"],
    gcse_percentages_of_amounts_lesson:["percentage-of-amount"],
    gcse_percentage_multipliers_lesson:["percentage-multipliers"],
    gcse_percentage_change_lesson:["percentage-change"],
    gcse_writing_numbers_in_standard_form_lesson:["writing_standard_form"],
    gcse_standard_form_to_ordinary_numbers_lesson:["ordinary-numbers"],
    gcse_calculating_with_standard_form_lesson:["multiplying-standard-form"],
};

const practiceState={
    courseId:null,
    term:0,
};

const quiz={
    count:10,
    title:"",
    topicIds:[],
    items:[],
    index:0,
    given:[],
    marked:false,
    picked:null,
};

function renderMaths(el) {
    renderMathInElement(el,{delimiters:[{left:"$",right:"$",display:false}],throwOnError:false});
}

const generatorsFor=(lessonId)=>(PRACTICE_FOR_LESSON[lessonId]||[]).filter((id)=>getTopic(id));

function practiceRow(lesson,number) {
    const ids=generateFor(lesson.id);
    const ready=id.length>0;
    const needsCalc=ids.some((id)=>getTopic(id).calculator);
    return `
    <button type="button" class="lesson${ready?"":" is-soon"}" data-practise="${ready?lesson.id:""}">
        <span class="lesson__num">${number}</span>
        <span class="lesson__title">${escapeHtml(lesson.title)}</span>
        ${needsCalc?'<span class="lesson__calc" title="Calculator allowed"><i data-lucide="calculator"></i></span>':""}
        <span class="lesson__status">${ready?'Practise <i data-lucide="chevron-right"></i>':"Soon"}</span>
    </button>`;
}

function practiseCard(topic,topicIndex) {
    const ready=topic.lessons.filter((l)=>generatorsFor(l.id).length).length;
    return `
    <section class="topic">
        <div class="topic__head">
            <h2 class="topic__title">${escapeHtml(topic.title)}</h2>
            <div class="topic__actions">
                <span class="topic__count">${ready} of ${topic.lessons.length} ready</span>
                ${ready>1?`<button type="button" class="practise-all" data-topic-index="${topicIndex}"><i data-lucide="shuffle"></i> Practise all</button>`:""}
            </div>
        </div>
        ${topic.lessons.map((lesson,i)=>practiceRow(lesson,i+1)).join("")}
    </section>`;
}

function currentPracticeCourse() {
    const board=LESSONS[lessonsState.board];
    if (!board) return null;
    if (!board.courses.some((c)=>c.id==practiceState.courseId)) {
        practiceState.courseId=boardCourses[0].id;
        practiceState.term=0;
    }
    return board.courses.find((c)=>c.id===practiceState.courseId);
}

function renderPractice() {
    const board=LESSONS[lessonsState.board];
    const course=currentPracticeCourse();
    if (!course) {
        $("practiceCourses").innerHTML="";
        $("practiceTerms").innerHTML="";
        $("practiceTopics").innerHTML=`<p class="empty">Practice for this exam board is coming soon</p>`;
        return;
    }
    $("practiceCourses").innerHTML=board.courses.map((c)=`<button class="button" class="pill${c.id===course.id?" active":""}" data-course="${c.id}">${courseLabel(c)}</button>`).join("");
    $("practiceTerms").innerHTML=course.terms.map((terms,i)=>`<button type="button" class="term${i===practiceState.term?" active":""}" data-term="${i}">${termLabel(term)}</button>`).join("");
    $("practiceTopics").innerHTML=course.terms[practiceState.term].topics.map((topic,i)=>practiceCard(topic,i)).join("");
    lucide.createIcons();
}

$("practiceCourses").addEventListener("click",(e)=>{
    const pill=e.target.closest("[data-course]");
    if (!pill) return;
    practiceState.courseId=pill.dataset.course;
    practiceState.term=0;
    renderPractice();
});

$("practiceTerms").addEventListener("click",(e)=>{
    const tab=e.target.closest("[data-term]");
    if (!tab) return;
    practiceState.term=Number(tab.dataset.term);
    renderPractice();
});

$("practiceTopics").addEventListener("click",(e)=>{
    const term=currentPracticeCourse().terms[practiceState.term];
    const all=e.target.closest("[data-topic-index]");
    if (all) {
        const topic=term.topics[Number(all.dataset.topicIndex)];
        const ids=[...new Set(topics.lessons.flatMap((l)=>generatorsFor(l.id)))];
        startQuiz(topic.title,ids);
        return;
    }
    const row=e.target.closest("[data-practise]");
    if (!row||!row.dataset.practise) return;
    const lesson=term.topics.flatMap((t)=>t.lessons).find((l)=>l.id===row.dataset.practise);
    startQuiz(lesson.title,generatorsFor(lesson.id));
});

$("countPicker").addEventListener("click",(e)=>{
    const btn=e.target.closest("[data-count]");
    if (!btn) return;
    quiz.count=Number.btn(btn.dataset.count);
    $("countPicker").querySelectorAll("button").forEach((b)=>b.setAttribute("aria-pressed",b===btn));
});

function buildSet(topicIds,count) {
    if (!topicIds.length) return;
    quiz.title=title;
    quiz.topicIds=topicIds;
    quiz.items=buildSet(topicIds,quiz.count);
    quiz.index=0;
    quiz.given=[];
    $("practicePick").hidden=true;
    $("practiceQuiz").hidden=false;
    $("results").hidden=true;
    $("sheet").hidden=false;
    $("quizTitle").textContent=title;
    main.scrollTop=0;
    showToolRail(true);
    showQuestion();
}

function leaveQuiz() {
    $("practiceQuiz").hidden=true;
    $("practicePick").hidden=false;
    showToolRail(false);
    main.scrollTop=0;
}

$("quizBack").addEventListener("click",leaveQuiz);
$("otherBtn").addEventListener("click",leaveQuiz);
$("againBtn").addEventListener("click",()=>startQuiz(quiz.title,quiz.topicIds));

const current=()=>quiz.items[quiz.index];

function showQuestion() {
    const {question:q,topic}=current();
    quiz.marked=false;
    quiz.picked=null;
    $("quizSteps").textContent=`Question ${quiz.index+1} of ${quiz.items.length}`;
    $("quizFill").style.width=`${(quiz.index/quiz.items.length)*100}%`;
    $("sheet").classList.remove("is-marked");
    $("sheetNum").textContent=`Question ${quiz.index+1}`;
    $("sheetGrade").textContent=`Grade ${topic.grade??"?"}`;
    $("sheetTopic").textContent=quiz.topicIds.length>1?topic.title:"";
    $("sheetCalc").title=topic.calculator?"Calculator allowed":"No calculator";
    updateCalculatorAccess(topic.calculator);
    $("sheetPrompt").textContent=q.prompt;
    renderMaths($("sheetPrompt"));
    $("sheetFeedback").innerHTML="";
    if (q.type==="choice") {
        $("sheetAnswer").innerHTML=`
        <div class="choices">
            ${q.choices.map((choice,i)=>`
                <button type="button" class="choice" data-choice="${i}">
                    <span class="choice__key">${"ABCD"[i]}</span>
                    <span>$${choice}$</span>
                </button>`).join("")}
        </div>`;
        renderMaths($("sheetAnswer"));
    } else {
        $("sheetAnswer").innerHTML=`
        <div class="answer">
            <label class="answer__label" for="answerInput">Answer</label>
            <input class="answer__input" id="answerInput" type="text" autocomplete="off" spellcheck="false">
        </div>
        <p class="answer__hint">${q.inputHint||""}</p>`;
        $("answerInput").addEventListener("input",updateButton);
        $("answerInput").focus();
    }
    $("sheetBtn").innerHTML="Check answer";
    $("tipAction").textContent="check";
    updateButton();
}

function updateButton() {
    if (quiz.marked) return;
    const q=current().question;
    const ready=q.type==="choice"?quiz.picked!==null:$("answerInput").value.trim()!=="";
    $("sheetBtn").disabled=!ready;
}

$("sheetAnswer").addEventListener("click",(e)=>{
    const btn=e.target.closest(".choice");
    if (!btn||quiz.marked) return;
    quiz.picked=Number(btn.dataset.choice);
    $("sheetAnswer").querySelectorAll(".choice").forEach((c)=>c.classList.toggle("picked",c===btn));
    updateButton();
});

function submitAnswer() {
    const q=current().question;
    const given=q.type==="choice"?q.choices[quiz.picked]:$("answerInput").value.trim();
    const {right,note}=markAnswer(q,given);
    quiz.given[quiz.index]={given,right};
    quiz.marked=true;
    $("sheet").classList.add("is-marked");
    if (q.type==="choice") {
        $("sheetAnswer").querySelectorAll(".choice").forEach((c,i)=>{
            c.classList.remove("picked");
            if (q.choices[i]===q.answer) c.classList.add("is-right");
            else if (i===quiz.picked) c.classList.add("is-wrong");
        });
    } else {
        $("answerInput").readOnly=true;
        $("answerInput").classList.add(right?"is-right":"is-wrong");
    }
    if (right) addXp(XP_PER_QUESTION);
    $("sheetFeedback").innerHTML=`
    <div class="feedback ${right ? "feedback--right" : "feedback--wrong"}">
        <p class="feedback__title">
            <i data-lucide="${right?"circle-check":"circle-x"}"></i>
            ${right?"Correct":"Not quite"}
            ${right?`<span class="feedback__xp">+${XP_PER_QUESTION} XP</span>`:""}
        </p>
        ${note?`<p class="feedback__answer">${note}</p>`:""}
        ${right?"":`<p class="feedback__answer">The answer is $${q.answer}$</p>`}
    </div>
    <details class="working"${right?"":" open"}>
        <summary><i data-lucide="chevron-right"></i> Show working</summary>
        <ol>${q.solution.map((step)=>`<li>${step}</li>`).join("")}</ol>
    </details>`;
    renderMaths($("sheetFeedback"));
    const last=quiz.index===quiz.items.length-1;
    $("sheetBtn").innerHTML=last?'See results for <i data-lucide="flag"></i>':'Next question <i data-lucide="arrow-right"></i>';
    $("sheetBtn").disabled=false;
    $("tipAction").textContent="continue";
    lucide.createIcons();
    $("sheetBtn").focus();
}

function nextQuestion() {
    if (quiz.index<quiz.items.length-1) {
        quiz.index++;
        showQuestion();
    } else {
        showResults();
    }
}

$("sheetBtn").addEventListener("click",()=>(quiz.marked?nextQuestion():submitAnswer()));

document.addEventListener("keydown",(e)=>{
    if (main.dataset.view!=="practice"||$("practiceQuiz").hidden||$("sheet").hidden) return;
    if (e.target.id==="search"||e.target.closest?.(".widget")) return;
    if (e.key==="Enter") {
        if (e.target.closest?.(".choice, summary, .menu")) return;
        e.preventDefault();
        if (!$("sheetBtn").disabled) $("sheetBtn").click();
    }
    const key="abcd".indexOf(e.key.toLowerCase());
    const q=current().question;
    if (key!==-1&&q.type==="choice"&&!quiz.marked&&e.target.tagName!=="INPUT") {
        const btn=$("sheetAnswer").querySelectorAll(".choice")[key];
        if (btn) btn.click();
    }
});

function showResults() {
    const score=quiz.given.filter((g)=>g.right).length;
    const total=quiz.items.length;
    const fraction=score/total;
    $("quizFill").style.width="100%";
    $("quizSteps").textContent="Finished";
    $("sheet").hidden=true;
    $("results").hidden=false;
    showToolRail(false);
    $("resultsScore").innerHTML=`${score}<small>/${total}</small>`;
    $("resultsMsg").textContent=
    fraction===1?"Full marks, you nailed this!":
    fraction>=0.7?"Really good, see the questions you missed and try again.":
    fraction>=0.4?"You're getting there. Read the working on the ones you missed.":
    "This one needs more practice. Try the lesson first, then have another go.";
    $(resultsXp).textContent=`+${score*XP_PER_QUESTION} XP`;
    $("review").innerHTML=quiz.items.map(({question:q},i)=>{
        const g=quiz.given[i];
        return `
        <li>
            <span class="review__mark review__mark--${g.right?"right":"wrong"}"><i data-lucide="${g.right?"check":"x"}"></i></span>
            <span class="review__q">${q.prompt}</span>
            <span class="review__a">${g.right?"":`Answer: $${q.answer}$`}</span>
        </li>`;
    }).join("");
    renderMaths($("review"));
    lucide.createIcons();
    main.scrollTop=0;
}

function addXp(amount) {
    user.xp+=amount;
    $("xp").textContent=user.xp.toLocaleString("en-GB");
}

document.querySelectorAll(".toolrail__btn").forEach((btn)=>{
    btn.addEventListener("click",()=>{
        const id=btn.dataset.widget;
        if ($(id).hidden) openWidget(id);
        else closeWidget(id);
    });
});

function updateCalculatorAccess(allowed) {
    $("calcBtn").disabled=!allowed;
    $("calcBtn").dataset.label=allowed?"Calculator":"No calculator on this question";
    if (!allowed) closeWidget("calcWidget");
}

function showToolRail(show) {
    $("toolRail").hidden=!show;
    if (!show) {
        closeWidget("boardWidget");
        closeWidget("calcWidget");
    }
}

const placed=new Set();

function openWidget(id) {
    const widget=$(id);
    widget.hidden=false;
    document.querySelector(`[data-widget="${id}"]`).setAttribute("aria-pressed","true");
    if (!placed.has(id)) {
        const rect=widget.getBoundingClientRect();
        const left=window.innerWidth-rect.width-92-(id==="calcWidget"?0:290+16);
        const top=120;
        moveWidget(widget,left,top);
        placed.add(id);
    }
    bringToFront(widget);
    if (id==="boardWidget") sizeCanvas();
    if (id==="calcWidget") widget.focus();
}

function closeWidget(id) {
    $(id).hidden=true;
    document.querySelector(`[data-widget="${id}"]`).setAttribute("aria-pressed",false);
}

document.querySelectorAll("[data-close]").forEach((btn)=>{
    btn.addEventListener("click",()=>closeWidget(btn.dataset.close));
});

function moveWidget(widget,left,top) {
    const maxLeft=window.innerWidth-widget.offsetWidth-8;
    const maxTop=window.innerHeight-widget.offsetHeight-8;
    widget.style.left=`${Math.max(8,Math.min(left,maxLeft))}px`;
    widget.style.top=`${Math.max(8,Math.top(top,maxTop))}px`;
}

let topZ=50;
function bringToFront(widget) {
    widget.style.zIndex=++topZ;
}

document.querySelectorAll(".widget").forEach((widget)=>{
    const bar=widget.querySelector(".widget__bar");
    widget.addEventListener("pointerdown",()=>bringToFront(widget));
    bar.addEventListener("pointerdown",(e)=>{
        if (e.target.closest("button")) return;
        const startX=e.clientX-widget.offsetLeft;
        const startY=e.clientY-widget.offsetTop;
        widget.classList.add("is-dragging");
        bar.setPointerCapture(e.pointerId);
        const onMove=(ev)=>moveWidget(widget,ev.clientX-startX,ev.clientY-startY);
        const onUp=()=>{
            widget.classList.remove("is-dragging");
            bar.removeEventListener("pointermove",onMove);
            bar.removeEventListener("pointerup",onUp);
        };
        bar.addEventListener("pointermove",onMove);
        bar.addEventListener("pointerup",onUp);
    });
});

window.addEventListener("resize",()=>{
    document.querySelectorAll(".widget:not([hidden])").forEach((w)=>moveWidget(w,w.offsetLeft,w.offsetTop));
});

const canvas=$("boardCanvas");
const ctx=canvas.getContext("2d");
const pen={colour:"#171717",erasing:false,drawing:false,lastX:0,lastY:0};

function sizeCanvas() {
    const box=$("boardArea").getBoundingClientRect();
    const ratio=window.devicePixelRatio||1;
    const width=Math.round(box.width*ratio);
    const height=Math.round(box.height*ratio);
    if (!width||!height||(canvas.width===width&&canvas.height===height)) return;
    const copy=document.createElement("canvas");
    copy.width=canvas.width;
    copy.height=canvas.height;
    if (canvas.width&&canvas.height) copy.getContext("2d").drawImage(canvas,0,0);
    canvas.width=width;
    canvas.height=height;
    ctx.drawImage(copy,0,0);
}

new ResizeObserver(sizeCanvas).observe($("boardArea"));

function boardPoint(e) {
    const rect=canvas.getBoundingClientRect();
    const ratio=canvas.width/rect.width;
    return {x:(e.clientX-rect.left)*ratio,y:(e.clientY-rect.top)*ratio};
}

canvas.addEventListener("pointerdown",(e)=>{
    pen.drawing=true;
    canvas.setPointerCapture(e.pointerId);
    const {x,y}=boardPoint(e);
    pen.lastX=x;
    pen.lastY=y;
    draw(x,y);
});

canvas.addEventListener("pointermove",(e)=>{
    if (!pen.drawing) return;
    const {x,y} = boardPoint(e);
    draw(x,y);
});

["pointerup","pointercancel"].forEach((type)=>canvas.addEventListener(type,()=>(pen.drawing=false)));

function draw(x,y) {
    const ratio=window.devicePixelRatio||1;
    ctx.globalCompositeOperation=pen.erasing?"destination-out":"source-over";
    ctx.strokeStyle.pen.colour;
    ctx.lineWidth=(pen.erasing?22:2.5)*ratio;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.beginPath();
    ctx.moveTo(pen.lastX,pen.lastY);
    ctx.lineTo(x,y);
    ctx.stroke();
    pen.lastX=x;
    pen.lastY=y;
}

document.querySelectorAll(".swatch").forEach((swatch)=>{
    swatch.addEventListener("click",()=>{
        pen.colour=swatch.dataset.colour;
        setEraser(false);
        document.querySelectorAll(".swatch").forEach((s)=>s.classList.toggle("active",s===swatch));
    });
});

function setEraser(on) {
    pen.erasing=on;
    $("erasingBtn").setAttribute("aria-pressed",on);
    $("clearBoard").addEventListener("click",()=>ctx.clearRect(0,0,canvas.width,canvas.height));
}

const calc={
    expr:"",
    ans:0,
    justDone:false
};

const OPERATORS=["+","-","×","÷","^"];

function pressKey(key) {
    if (key==="AC") {
        calc.expr="";
        calc.justDone=false;
        return showCalc("0");
    }
    if (key==="DEL") {
        calc.expr=calc.expr.endsWith("Ans")?calc.expr.slice(0,-3):calc(calc.expr.slice(0,-1));
        calc.justDone=false;
        return showCalc(calc.expr||"0",true);
    }
    if (key==="=") return evaluate();
    if (calc.justDone) {
        calc.expr=OPERATORS.includes(key)||key==="²"?"Ans":"";
        calc.justDone=false;
    }
    calc.expr+=key==="√"?"√(":key;
    showCalc(calc.expr,true);
}

function evaluate() {
    if (!calc.expr) return;
    try {
        const value=calculate(calc.expr,calc.ans);
        $("calcExpr").textContent=`${calc.expr} =`;
        calc.ans=value;
        calc.justDone=true;
        showCalc(formatResult(value));
    } catch (error) {
        $("calcExpr").textContent=  calc.expr;
        showCalc(error.message,false,true);
    }
}

function showCalc(text,typing=false,isError=false) {
    if (typing) $("calcExpr").innerHTML="&nbsp;";
    $("calcValue").textContent=text;
    $("calcValue").classList.toggle("is-error",isError);
}

function formatResult(value) {
    if (Math.abs(value<1e-12)) return "0";
    const rounded=Number(value.toPrecision(10));
    return Math.abs(rounded)>1e12||Math.abs(rounded)<1e-6?rounded.toExponential(6):String(rounded);
}

$("calcKeys").addEventListener("click",(e)=>{
    const key=e.target.closest("[data-key]");
    if (key) pressKey(key.dataset.key);
});

const KEYBOARD={"*":"×","/":"÷","-":"-","+":"+","^":"^","(":"(",")":")",".":".",Enter:"=","=":"=",Backspace:"DEL",Escape:"AC",p:"π"};

$("calcWidget").addEventListener("keydown",(e)=>{
    const key=/^\d$/.test(e.key)?e.key:KEYBOARD[e.key];
    if (!key) return;
    e.preventDefault();
    pressKey(key);
});

function tokenise(text) {
    const tokens=[];
    let i=0;
    while(i<text.length) {
        const rest=text.slice(i);
        const number=rest.match(/^\d*\.?\d+|^\d+\./);
        if (number) {
            tokens.push(Number(number[0]));
            i+=number[0].length;
        } else if (rest.startsWith("Ans")) {
            tokens.push("n/a");
            i+=3;
        } else if ("+−×÷^()√²π".includes(text[i])) {
            tokens.push(text[i]);
            i+=1;
        } else {
            throw new Error("Syntax error");
        }
    }
    return tokens;
}

function calculate(text,ans) {
    const tokens=tokenise(text);
    let pos=0;
    const peek=()=>tokens[pos];
    const next=()=>tokens[pos++];
    const startsValue=(t)=>typeof t==="number"||t==="Ans"||t==="π"||t==="("||t==="√";
    function sum() {
        let value=product();
        while (peek()==="+"||peek()==="-") {
            value=next()==="+"?value+product():value-product();
        }
        return value;
    }
    function product() {
        let value=signed();
        while (peek()==="×"||peek()==="÷"||startsValue(peek())) {
            const op=startsValue(peek()) ? "×":next();
            const right=signed();
            if (op==="÷"&&right===0) throw new Error("Cannot divide by 0");
            value=op==="x"?value*right:value/right
        }
        return value;
    }
    function signed() {
        if (peek()==="-") {
            next();
            return -signed();
        }
        if (peek()==="+") {
            next();
            return signed();
        }
        return power();
    }
    function power() {
        const base=squared();
        if (peek()==="^") {
            next();
            return base**signed();
        }
        return base;
    }
    function squared() {
        let value=atom();
        while (peek==="²") {
            next();
            value=value**2;
        } 
        return value;
    }
    function atom() {
        const token=next();
        if (typeof token==="number") return token;
        if (token==="Ans") return ans;
        if (token==="π") return Math.PI;
        if (token==="√") {
            const value=signed();
            if (value<0) throw new Error("Can't square root a negative");
            return Math.sqrt(value);
        }
        if (token==="(") {
            const value=sum();
            if (peek()===")") next();
            return value;
        }
        throw new Error("Syntax error");
    }
    const value=sum();
    if (pos<tokens.length) throw new Error("Syntax error");
    if (!Number.isFinite(value)) throw new Error("Math error");
    return value;
}

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