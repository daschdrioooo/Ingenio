const SQUARE_FREE=[2,3,5,6,7,10,11];

registerTopic({
    id:"simplifying-surds",
    title:"Simplifying Surds",
    group:"Surds",
    blurb:"Take square factors out of a square root.",
    grade:7,
    icon:"radical",
    generate() {
        const outside=randInt(2,6);
        const inside=pick(SQUARE_FREE);
        const square=outside*outside;
        const number=square*inside;
        const solution=[
            `Find the biggest square number that goes into ${number}: $${number} = ${square} \\times ${inside}$`,
            `Split the root: $\\sqrt{${number}} = \\sqrt{${square}} = \\sqrt{${square}} \\times \\sqrt{${inside}}$`,
            `$\\sqrt{${square}} = ${outside}$, so the answer is $${surdTex(outside,inside)}$`,
        ];
        const hint="Look for the biggest square number that divides it.";
        if (chance(0.5)) {
            return surdQuestion({
                prompt:`Simplify $\\sqrt{${number}}$`,
                coef:outside,
                radicand:inside,
                hint,
                solution,
            });
        }
        return choiceQuestion({
            prompt:`Simplify $\\sqrt{${number}}$`,
            correct:surdTex(outside,inside),
            wrong:[
                surdTex(square,inside),
                surdTex(inside,outside),
                surdTex(outside,outside*inside),
                surdTex(outside+1,inside),
                surdTex(outside-1,inside),
            ],
            hint,
            solution,
        });
    },
});

registerTopic({
    id:"adding-surds",
    title:"Adding and Subtracting Surds",
    group:"surds",
    blurb:"Simplify each surd first, then collect them like terms.",
    grade:7,
    icon:"radical",
    generate() {
        const inside=pick([2,3,5]);
        const a=randInt(1,5);
        let b=randInt(1,5);
        while (b===a) b=randInt(1,5);
        const first=a*a*inside;
        const second=b*b*inside;
        const subtract=chance(0.4);
        const [big,small,bigOut,smallOut]=a>=b?[first,second,a,b]:[second,first,b,a];
        const coef=subtract?bigOut-smallOut:a+b;
        const sign=subtract?"-":"+";
        const left=subtract?big:first;
        const right=subtract?small:second;
        const leftOut=subtract?bigOut:a;
        const rightOut=subtract?smallOut:b;
        const simplifyStep=(number,out)=>(out===1?`$\\sqrt{${number}}$ is already simplified`:`$\\sqrt{${number}} = \\sqrt{${out*out}} \\times \\sqrt{${inside}} = ${surdTex(out,inside)}$`);
        return surdQuestion({
            prompt:`Simplify $\\sqrt{${left}} ${sign} \\sqrt{${right}}$`,
            coef,
            radicand:inside,
            hint:"You can only add or subtract surds once the numbers under the root match.",
            solution:[
                simplifyStep(left,leftOut),
                simplifyStep(right,rightOut),
                `Now they're like terms: $${turdTex(leftOut,inside)} ${sign} ${surdTex(rightOut,inside)} = ${surdTex(coef,inside)}$`,
            ],
        });
    },
});

registerTopic({
    id:"rationalising-denominators",
    title:"Rationalising Denominators",
    group:"Surds",
    blurb:"Remove the surd from a bottom of a fraction.",
    grade:8,
    icon:"radical",
    generate() {
        const root=pick([2,3,5,6,7]);
        const top=randInt(1,12);
        const f=simplify(top,root);
        const correct=surdTex(f.n,root,f.d);
        const solution=[
            `Multiply the top and bottom by $\\sqrt{${root}}$: $\\dfrac{${top}}{\\sqrt{${root}}} \\times \\dfrac{\\sqrt{${root}}}{\\sqrt{${root}}}$`,
            `$\\sqrt{${root}} \\times \\sqrt{${root}} = ${root}$, which gives $${surdTex(top,root,root)}$`,
        ];
        if (f.d!==root) {
            solution.push(`Cancel the common factor of ${root/f.d}: $${correct}$`);
        }
        return choiceQuestion({
            prompt:`Rationalise the denominator of $\\dfrac{${top}}{\\sqrt${root}}}$`,
            correct,
            wrong:[
                fracTex(top,root),
                surdTex(top,root,root*root),
                surdTex(top*root,root),
                surdTex(1,root,top===1?root+1:top),
                surdTex(top+1,root,root),
            ].filter((option)=>option!==correct),
            hint:"Multiply the top and the bottom by the surd on the bottom",
            solution,
        });
    },
});