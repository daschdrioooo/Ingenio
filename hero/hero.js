lucide.createIcons();

//demo questions
const QUESTIONS=[
    {
        topic:"Fractional indices",
        grade:6,
        text:"Work out $8^{\\frac{2}{3}}$",
        steps:["4"],
        calculator:false
    },
    {
        topic:"Surds",
        grade:7,
        text:"Simplify $\\sqrt{50}$",
        steps:["5","5\\sqrt{}","5\\sqrt{2}"],
        calculator:false
    },
    {
        topic:"Percentages",
        grade:4,
        text:"Find $15\\%$ of $240$",
        steps:["3","36"],
        calculator:true
    },
    {
        topic:"Linear equations",
        grade:3,
        text:"Solve $3x + 7 = 22$",
        steps:["x","x =","x = 5"],
        calculator:false
    },
    {
        topic:"Pythagoras",
        grade:5,
        text:"Work out $\\sqrt{3.2^2 + 4.5^2}$ to 1 d.p.",
        steps:["5","5.","5.5"],
        calculator:true
    },
];

const FEATURES=[
    {
        name:"Lessons",
        text:"PowerPoint lessons for every topic.",
        icon:"book-open",
        c:"#f76b15",
        ink:"#fff"
    },
    {
        name:"Practice questions",
        text:"Exam-style questions, marked as soon as you answer.",
        icon:"pencil-line",
        c:"#ffe8d6",
        ink:"#7c2d12",
    },
    {
        name:"Practice papers",
        text:"Practice papers expertly curated for optimal performance.",
        icon:"file-text",
        c:"#f75b15",
        ink:"#fff"
    },
    {
        name:"AI tutor",
        text:"Get step-by-step personalised marking and help on any question.",
        icon:"sparkles",
        c:"#ffe8d6",
        ink:"#7c2d12"
    },
    {
        name:"Grade tracking",
        text:"See how close you are to your target grade.",
        icon:"trending-up",
        c:"#f76b15",
        ink:"#fff"
    },
    {
        name:"All revision content, for free",
        text:"No catches!",
        icon:"heart",
        c:"#ffe8d6",
        ink:"#7c2d12"
    }
]

const topicsTrack=document.getElementById("topicsTrack");
const featureCard=(f,hidden)=>`
<div class="feature" style="--c:${f.c};--ink:${f.ink}"${hidden?' aria-hidden="true"':""}>
    <i data-lucide="${f.icon}" class="feature__icon"></i>
    <span class="feature__badge"><i data-lucide="${f.icon}"></i></span>
    <div class="feature__body">
        <div class="feature__name">${f.name}</div>
        <p class="feature__text">${f.text}</p>
    </div>
</div>`;

topicsTrack.innerHTML=FEATURES.map((f)=>featureCard(f,false)).join("")+FEATURES.map((f)=>featureCard(f,true)).join("");
lucide.createIcons();

const demo=document.getElementById("demo");
const demoBody=document.getElementById("demoBody");
const demoBox=document.getElementById("demoBox");
const demoCheck=document.getElementById("demoCheck");
const wait=(ms)=>new Promise((done)=>setTimeout(done,ms));

function withMaths(text) {
    return text.replace(/\$(.+?)\$/g,(_,tex)=>katex.renderToString(tex,{throwOnError:false}));
}

function showAnswer(tex) {
    katex.render(tex,demoBox,{throwOnError:false});
}

function showQuestion(q,number) {
    document.getElementById("demoTitle").textContent=`Question ${number}`,
    document.getElementById("demoGrade").textContent=`Grade ${q.grade}`,
    document.getElementById("demoTopic").textContent=q.topic;
    document.getElementById("demoCalc").classList.toggle("is-allowed",q.calculator);
    document.getElementById("demoCalc").title=q.calculator?"Calculator allowed":"No calculator";
    document.getElementById("demoText").innerHTML=withMaths(q.text);
    demoBox.textContent="";
    demo.classList.remove("is-marked");
}

async function playDemo() {
    for (let i=0; ; i=(i+1) % QUESTIONS.length) {
        const q=QUESTIONS[i];
        showQuestion(q,i+1);
        demoBody.classList.remove("is-hidden");
        await wait(900);
        for (const step of q.steps) {
            showAnswer(step);
            await wait(220);
        }
        await wait(500);
        demoCheck.classList.add("is-pressed");
        await wait(150);
        demoCheck.classList.remove("is-pressed");
        demo.classList.add("is-marked");
        await wait(2200);
        demoBody.classList.add("is-hidden")
        await wait(350);
    }
}

playDemo();
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
    if (!e.target.closest(".menu")) closeDrops();
});

document.addEventListener("keydown",(e)=>{
    if (e.key==="Escape") closeDrops();
});