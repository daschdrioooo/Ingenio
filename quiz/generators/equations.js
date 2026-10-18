const LETTERS=["x","y","n","a","m"];

registerTopic({
    id:"two-step-equations",
    title:"Two-Step Equations",
    group:"Equations",
    blurb:"Undo the adding or subtracting, then undo the multiplying.",
    grade:3,
    icon:"equal",
    generate() {
        const x=pick(LETTERS);
        const answer=randInt(-6,12);
        const a=randInt(2,9);
        const b=randNonZero(-15,15);
        const c=a*answer+b;
        return inputQuestion({
            prompt:`Solve $${linearTex(a,b,x)} = ${c}$`,
            n:answer,
            hint:`Get the ${x} term on its own first, then divide.`,
            solution:[
                `${b>0?"Subtract":"Add"} $${Math.abs(b)}$ on both sides: $${a}${x} = ${c-b}$`,
                `Divide both sides by $${a}$: $${x} = ${answer}$`,
            ],
        });
    },
});

registerTopic({
    id:"unknowns-both-sides",
    title:"Unknowns on Both Sides",
    group:"Equations",
    blurb:"Collect the letters on one side and the numbers on the other.",
    grade:4,
    icon:"equal",
    generate() {
        const x=pick(LETTERS);
        const answer=randInt(-5,10);
        const c=randInt(1,6);
        const a=c+randInt(1,5);
        const b=randNonZero(-12,12);
        const d=(a-c)*answer+b;
        const diff=a-c;
        const solution=[
            `Subtract $${c===1?x:`${c}${x}`}$ from both sides: $${linearTex(diff,b,x)} = ${d}$`,,
            `${b>0?"Subtract":"Add"} $${Math.abs(b)}$ on both sides: $${diff===1?"":diff}${x}= = ${d-b}$`,
        ];
        if (diff!==1) solution.push(`Divide both sides by $${diff}$: $${x} = ${answer}$`);
        else solution.push(`So $${x} = ${answer}$`);
        return inputQuestion({
            prompt:`Solve $${linearTex(a,b,x)} = ${linearTex(c,d,x)}$`,
            n:answer,
            hint:`Take the smaller number of ${x}'s away from both sides first.`,
            solution,
        });
    },
});

registerTopic({
    id:"equations-with-brackets",
    title:"Equations with Brackets",
    group:"Equations",
    blurb:"Expand the brackets, then solve as normal.",
    grade:5,
    icon:"equal",
    generate() {
        const x=pick(LETTERS);
        const answer=randInt(-4,10);
        const k=randInt(2,6);
        const b=randNonZero(-8,8);
        const total=k*(answer+b);
        if (chance(0.3)) {
            const a=randInt(2,5);
            const top=randInt(1,a-1);
            const rhs=k*(top+b);
            return inputQuestion({
                prompt:`Solve $${k}(${linearTex(a,b,x)}) = ${rhs}$`,
                n:top,
                d:a,
                hint:"The answer doesn't have to be a whole number.",
                solution:[
                    `Expand the bracket: $${linearTex(k*a,k*b,x)} = ${rhs}$`,
                    `${k*b>0?"Subtract":"Add"} $${Math.abs(k*b)}$ on both sides: $${k*a}${x} = ${rhs-k*b}$`,
                    `Divide both sides by $${k*a}$: $${x} = ${fracTex(rhs-k*b,k*a)}$`,
                ],
            });
        }
        return inputQuestion({
            prompt:`Solve $${k}(${linearTex(1,b,x)}) = ${total}$`,
            n:answer,
            hint:"You can expand the bracket, or divide both sides by the number outside first.",
            solution:[
                `Divide both sides by $${k}$: $${linearTex(1,b,x)} = ${total/k}$`,
                `${b>0?"Subtract":"Add"} $${Math.abs(b)}$ on both sides: $${x} = ${answer}$`,
            ],
        });
    },
});