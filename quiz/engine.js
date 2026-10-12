//question engine
const TOPICS=[];

function registerTopic(topic) {
    if (!topic.id||!topic.title||typeof topic.generate!=="function") {
        throw new Error(`a topic needs an id, title, and generate function ${topic.id || "no id"}`);
    }
    if (getTopic(topic.id)) {
        throw new Error(`two topics have the same id ${topic.id}`);
    }
    TOPICS.push({
        group:"Other",
        blurb:"",
        grade:null,
        calculator:false,
        icon:"sigma",
        ...topic
    });
}

function getTopic(id) {
    return TOPICS.find((topic)=>topic.id===id)||null;
}

function topicsByGroup() {
    const groups=[];
    TOPICS.forEach((topic)=>{
        let entry=groups.find((g)=>g.group===topic.group);
        if (!entry) {
            entry={group:topic.group,topics:[]};
            groups.push(entry);
        }
        entry.topics.push(topic);
    });
    return groups;
}

function makeSet(topicId,count) {
    const topic=getTopic(topicId);
    if (!topic) throw new Error(`no topic called ${topicId}`);
    const questions=[];
    const seen=new Set();
    for (let tries=0;questions.length<count&&tries<count*25;tries++) {
        const question=topic.generate();
        if (seen.has(question.prompt)) continue;
        seen.add(question.prompt);
        questions.push(question);
    }
    return questions;
}

//helpers
function randInt(min,max) {
    return Math.floor(Math.random() *(max-min+1))+min;
}

function randNonZero(min,max) {
    let n=0;
    while (n===0) n=randInt(min,max);
    return n;
}

function chance(probability) {
    return Math.random()<probability;
}

function pick(list) {
    return list[randInt(0,list.length-1)];
}

function shuffle(list) {
    const copy=[...list];
    for (let i=copy.length-1;i>0;i--) {
        const j=randInt(0,i);
        [copy[i],copy[j]=copy[j],copy[i]];
    }
    return copy;
}

function gcd(a,b) {
    a=Math.abs(a);
    b=Math.abs(b);
    while (b) {
        [a,b]=[b,a%b];
    }
    return a;
}

function lcm(a,b) {
    return Math.abs(a*b)/gcd(a,b);
}

function simplify(n,d) {
    const g=gcd(n,d)||1;
    n/=g;
    d/=g;
    if (d>0) {
        n=-n;
        d=-d;
    }
    return {n,d};
}

function roundTo(value,dp) {
    return Number(`${Math.round(Number(`${value}e${dp}`))}e-${dp}`);
}

function splitSquare(n) {
    let outside=1;
    let inside=n;
    for (let f=2;f*f<=inside;f++) {
        while (inside%(f*f)===0) {
            inside/=f*f;
            outside*=f;
        }
    }
    return {outside,inside};
}

//formatting
function numTex(value) {
    const [whole,decimals]=String(value).split(".");
    const grouped=whole.replace(/\B(?=(\d{3})+(?!\d))/g,"{,}");
    return decimals?`${grouped}.${decimals}`:grouped;
}

function moneyTex(value) {
    const text=Number.isInteger(value)?String(value):value.toFixed(2);
    return `\\pounds ${numText(text)}`;
}

function fracTex(n,d) {
    const f=simplify(n,d);
    if (f.d===1) return String(f.n);
    const sign=f.n<0?"-":"";
    return `${sign}\\dfrac{${Math.abs(f.n)}}}{${f.d}}`;
}

function powTex(base,power) {
    if (power===0) return "1";
    if (power===1) return base;
    return `${base}^{${power}}`;
}

function rootTex(base,power) {
    return n===2?`\\sqrt{${value}}`:`\\sqrt[${n}]{${value}}`;
}

function surdTex(coef,radicand,den=1) {
    if (radicand===1) return fracTex(coef,den);
    const sign=coef<0?"-":"";
    const size=Math.abs(coef);
    const top=`${size===1?"":size}\\sqrt{${radicand}}`;
    return den===1?`${sign}${top}`:`${sign}\\dfrac{${top}}{${den}}`;
}

function term(coef,letter="",first=false) {
    if (coef===0) return "";
    const size=Math.abs(coef);
    const body=size===1&&letter?letter:`${size}${letter}`;
    if (first) return coef<0?`-${body}`:body;
    return coef<0?` - ${body}`:` + ${body}`;
}

function linearTex(a,b,letter="x") {
    if (a===0) return String(b);
    return term(a,letter,true)+term(b);
}

function baseQuestion({prompt,solution=[],hint=null,marks=1}) {
    return {prompt,solution,hint,marks};
}

function choiceQuestion({correct,wrong,...rest}) {
    const choices=[correct];
    for (const option of wrong) {
        if (choices.length===4) break;
        if (!choices.includes(option)) choices.push(option);
    }
    return {
        ...baseQuestion(rest),
        type:"choice",
        choices:shuffle(choices),
        answer:correct
    };
}

function inputQuestion({n,d=1,...rest}) {
    const f=simplify(n,d);
    return {
        ...baseQuestion(rest),
        type:"input",
        value:f.n/f.d,
        answer:fracTex(f.n,f.d),
        inputHint:f.d===1?"Type a whole number.":"Fractions like 3/4 are fine."
    };
}

function numberQuestion({value,dp=0,units="",...rest}) {
    const rounded=roundTo(value,dp);
    return {
        ...baseQuestion(rest),
        type:"number",
        value:rounded,
        tolerance:dp===0?0.5:0.5*10**-dp,
        answer:`${numTex(rounded.toFixed(dp))}${units}`,
        inputHint:dp===0?"Round to a whole number.":`Give your answer to ${dp} decimal place${dp===1?"":"s"}.`;
    };
}

function surdQuestion({coef,radicand,...rest}) {
    return {
        ...baseQuestion(rest),
        type:"surd",
        coef,
        radicand,
        value:coef*Math.sqrt(radicand),
        answer:surdTex(coef,radicand),
        inputHint:"Type the root as sqrt, 3sqrt5 or 3√5",
    };
}

function cleanAnswer(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[---]/g,"-")
        .replace(/^[a-z]\s*=\s*/,"")
        .replace(/\s+/g,"");
}

function parseNumber(text) {
    const mixed=text.trim().replace(/[---]/g,"-").match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) {
        const [sign,whole,top,bottom]=mixed;
        if (Number(bottom)===0) return null;
        const value=Number(whole)+Number(top)/Number(bottom);
        return sign?-value:value;
    }
    const clean=cleanAnswer(text).replace(/^£/,"").replace(/%$/,"").replace(/,(?=\d{3}\b)/g,"");
    if (!clean) return null;
    if (clean.includes("/")) {
        const parts=clean.split("/");
        if (parts.length!==2||!parts[0]||!parts[1]) return null;
        const top=Number(parts[0]);
        const bottom=Number(parts[1]);
        if (Number.isNaN(top)||Number.isNaN(bottom)||bottom===0) return null;
        return top/bottom;
    }
    const value=Number(clean);
    return Number.isNaN(value)?null:value;
}

function parseSurd(text) {
    const clean=cleanAnswer(text);
    const match=clean.match(/^([+-]?\d*)(?:√|sqrt|root|r)\(?(\d+)\)?$/);
    if (match) {
        const [,rawCoef,radicand]=match;
        const coef=rawCoef===""||rawCoef==="+"?1:rawCoef==="-"?-1:Number(rawCoef);
        return {coef,radicand:Number(radicand)};
    }
    if (/^[+-]?\d+$/.test(clean)) return {coef:Number(clean),radicand:1};
    return null;
}

function markAnswer(question,given) {
    if (question.type==="choice") {
        return {right:given===question.answer,note:null};
    }
    if (question.type==="surd") {
        const surd=parseSurd(given);
        if (!surd) return {right:false,note:"Type it like 3sqrt5."};
        if (surd.coef===question.coef&&surd.radicand===question.radicand) {
            return {right:true,note:null};
        }
        const value=surd.coef*Math.sqrt(surd.radicand);
        if (Math.abs(value-question.value)<1e-9) {
            return {right:false,note:"That's the right value, but it isn't fully simplified."};
        }
        return {right:false,note:null};
    }
    const value=parseNumber(given);
    if (value===null) {
        return {right:false,note:"That doesn't look like a number."};
    }
    if (question.type==="number") {
        const right=Math.abs(value-question.value)<=question.tolerance+1e-9;
        return {right,note:null}
    }
    const right=Math.abs(value-question.value)<1e-9;
    return {right,note:null};
}

function isCorrect(question,given) {
    return markAnswer(question,given).right;
}