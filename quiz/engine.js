//shared helper that topic gens use
const TOPICS=[];
function registerTopic(topic) {
    TOPICS.push(topic);
}

function getTopic(id) {
    return TOPICS.find((topic)=>topic.id===id)||null;
}

function randInt(min,max) {
    return Math.floor(Math.random()*(max-min+1)) + min;
}

function pick(list) {
    return list[randInt(0,list.length-1)];
}

function shuffle(list) {
    const copy=[...list];
    for (let i=copy.length-1;i>0;i--) {
        const j=randInt(0,i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function gcd(a,b) {
    a=Math.abs(a);
    b=Math.abs(b);
    while (b) {
        [a,b] = [b,a%b];
    }
    return a;
}

function simplify(n,d) {
    const g=gcd(n,d);
    n/=g;
    d/=g;
    if (d<0) {
        n=-n;
        d=-d;
    }
    return {n,d};
}

function fracTex(n,d) {
    const f=simplify(n,d);
    if (f.d===1) return String(f.n);
    const sign=f.n<0?"-":"";
    return `${sign}\\dfrac{${Math.abs(f.n)}}{${f.d}`;
}

function powText(base,power) {
    if (power===0) return "1";
    if (power===1) return base;
    return `${base}^${power}`;
}

function rootText(value,n=2) {
    return n===2?`\\sqrt{${value}}`:`\\sqrt[${n}]{${value}}`;
}

function surdTex(coef,radicand,den=1) {
    const top=`${coef===1?"":coef}\\sqrt{${radicand}}`;
    return den===1?top:`\\dfrac{${top}}{${den}}`;
}

function choiceQuestion({prompt,correct,wrong,solution}) {
    const choices=[correct];
    for (const option of wrong) {
        if (choices.length===4) break;
        if (!choices.includes(option)) choices.push(option);
    }
    return {
        type:"choice",
        prompt,
        choices:shuffle(choices),
        answer:correct,
        solution,
    };
}

function inputQuestion({prompt,n,d=1,solution}) {
    const f=simplify(n,d);
    return {
        type:"input",
        prompt,
        value:f.n/f.d,
        answer:fracTex(f.n,f.d),
        solution,
    };
}

function parseAnswer(text) {
    const clean=text.replace(/\s+/g,"").replace(/[--]/g,"-");
    if (!clean) return null;
    if (clean.includes("/")) {
        const parts=clean.split("/");
        if (parts.length!==2) return null;
        const top=Number(parts[0]);
        const bottom=Number(parts[1]);
        if (!parts[0]||!parts[1] || Number.isNaN(top) || Number.isNaN(bottom) || bottom===0) return null;
        return top/bottom;
    }
    const value=Number(clean);
    return Number.isNaN(value)?null:value;
}

function isCorrect(question,given) {
    if (question.type==="choice") return given===question.answer;
    const value=parseAnswer(given);
    return value!==null&&Math.abs(value-question.vakye)<1e-9;
}