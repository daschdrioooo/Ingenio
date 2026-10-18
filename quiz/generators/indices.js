registerTopic({
    id:"fractional-indices",
    title:"Fractional Indices",
    group:"Indices",
    blurb:"Evaluate powers like 27 to the power of two thirds.",
    grade:6,
    icon:"superscript",
    generate() {
        const root=pick([2,2,2,3,3,4]);
        const base=root===2?randInt(2,12):root===3?randInt(2,5):randInt(2,3);
        const number=base**root;
        const hint="The bottom of the fraction is the root, the top is the power.";
        if (chance(0.33)) {
            return inputQuestion({
                prompt:`Evaluate $${number}^{-\\frac{${root}}$`,
                n:1,
                d:answer,
                hint:"Deal with the minus sign last: it means one over (reciprocal)",
                solution:[
                    `Ignore the minus for now: $${rootTex(number,root)} = ${base}$`,
                    power>1?`Raise it to the power ${power}: $${base}^{${power}} = ${answer}$`:`That gives $${answer}$`,
                    `The minus sign means "one over", so the answer is $\\dfrac{1}{${answer}$$`,
                ],
            });
        }
        const solution=[
            `The bottom of the power tells you which root to take: $${rootTex(number,root)} = ${base}$`,
        ];
        if (power>1) {
            solution.push(`The top of the power tells you what to raise it to: $${base}^{${power}} = ${answer}$`);
        }
        solution.push(`So $${number}^{\\frac{${power}}{${root}}} = ${answer}$`);
        return inputQuestion({
            prompt:`Evaluate $${number}^{\\frac{${power}}{${root}}}$`,
            n:answer,
            hint,
            solution,
        });
    },
});

registerTopic({
    id:"negative-indices",
    title:"Negative Indices",
    group:"Indices",
    blurb:"Turn negative powers into fractions.",
    grade:5,
    icon:"superscript",
    generate() {
        if (chance(0.5)) {
            const base=randInt(2,9);
            const power=base<=5?randInt(1,3):randInt(1,2);
            const bottom=base**power;
            return inputQuestion({
                prompt:`Evaluate $${base}^{-${power}}$. Give your action as a fraction.`,
                n:1,
                d:bottom,
                hint:"A negative power means one over the positive power.",
                solution:[
                    `A negative power means "one over": $${base}^{-${power}} = \\dfrac{1}{${powTex(base,power)}}$`,
                    `$${powTex(base,power)}=${bottom}$, so the answer is $\\dfrac{1}{${bottom}}$`,
                ],
            });
        }
        let top=randInt(1,5);
        let bottom=randInt(2,6);
        while (top===bottom||gcd(top,bottom)!==1) {
            top=randInt(1,5);
            bottom=randInt(2,6);
        }
        const power=randInt(1,2);
        const newTop=bottom**power;
        const newBottom=top**power;
        const solution=[
            `A negative power flips the fraction: $\\left(\\dfrac{${top}}{${bottom}}\\right)^{-${power}} = ${powTex(`\\left(\\dfrac{${bottom}}{${top}}\\right)`,power)}$`,
        ];
        if (power>1) {
            solution.push(`Raise the top and the bottom to the power ${power}: $\\dfrac{${bottom}^{${power}}}{${top}^{${power}}} = \\dfrac{${newTop}}{${newBottom}}$`);
        }
        solution.push(`So the answer is $${fracTex(newTop,newBottom)}$`);
        return inputQuestion({
            prompt:`Evaluate $\\left(\\dfrac{${top}}{${bottom}}\\right)^{-${power}}$`,
            n:newTop,
            d:newBottom,
            hint:"With a fraction, a negative power flips it upside down",
            solution,
        });
    },
});

registerTopic({
    id:"laws-of-indices",
    title:"Laws of Indices",
    group:"Indices",
    blurb:"Multiply, divide and raise powers of the same letter.",
    grade:4,
    icon:"superscript",
    generate() {
        const x=pick(["x","y","a","m","p"]);
        const kind=pick(["multiply","divide","power"]);
        const withNumbers=chance(0.5);
        if (kind==="multiply") {
            const a=randInt(2,9);
            const b=randInt(2,9);
            const p=withNumbers?randInt(2,6):1;
            const q=withNumbers?randInt(2,6):1;
            const front=p*q===1?"":p*q;
            const correct=`${front}${powTex(x,a+b)}`;
            return choiceQuestion({
                prompt:`Simply $${p===1?"":p}${powTex(x,a)} \\times ${q===1?"":q}${powTex(x,b)}$`,
                correct,
                wrong:[
                    `${front}${powTex(x,a*b)}`,
                    `${withNumbers?p+q:""}${powTex(x,a+b)}`,
                    `${front}${powTex(x,a+b+1)}`,
                    `${front}${powTex(x,Math.abs(a-b)+1)}`,
                    `${front}${powTex(x,a+b-1)}`,
                ],
                hint:"Multiply the numbers, add the powers.",
                solution:[
                    withNumbers?`Multiply the numbers in front: $${p} \\times ${q} = ${p * q}$`:"There are no numbers in front, so just deal with the powers.",
                    `When you multiply powers of the same letter, add the powers: $${a} + ${b} = ${a+b}$`,
                    `So the answer is $${correct}$`,
                ],
            });
        }
        if (kind==="divide") {
            const b=randInt(2,6);
            const a=b+randInt(2,6);
            const q=withNumbers?randInt(2,5):1;
            const p=q*(withNumbers?randInt(2,5):1);
            const front=p/q===1?"":p/q;
            const correct=`${front}${powTex(x,a-b)}`;
            return choiceQuestion({
                prompt:`Simplify $${p===1?"":p}${powTex(x,a)} \\div ${q===1?"":q}${powTex(x,b)}$`,
                correct,
                wrong:[
                    `${front}${powTex(x,a+b)}`,
                    `${front}${powTex(x,a*b)}`,
                    `${withNumbers?p-q:""}${powTex(x,a-b)}`,
                    `${front}${powTex(x,a-b+1)}`,
                    `${front}${powTex(x,b-a)}`,
                    `${front}${powTex(x,a-b-1)}`,
                ],
                hint:"Divide the numbers, subtract the powers.",
                solution:[
                    withNumbers?`Divide the numbers in front: $${p} \\div ${q} = ${p/q}$`:"There are no numbers in front, so just deal with the powers.",
                    `When you divide powers of the same letter, subtract the powers: $${a}-${b}=${a-b}$`,
                    `So the answer is $${correct}$`,
                ],
            });
        }
        const a=randInt(2,6);
        const b=randInt(2,4);
        const p=withNumbers?randInt(2,3):1;
        const front=p**b===1?"":p**b;
        const correct=`${front}${powTex(x,a*b)}`;
        return choiceQuestion({
            prompt:`Simplify $\\left(${p===1?"":p}${powTex(x,a)}\\right)^{${b}}$`,
            correct,
            wrong:[
                `${front}${powTex(x,a+b)}`,
                `${withNumbers?p*b:""}${powTex(x,a*b)}`,
                `${withNumbers?p:""}${powTex(x,a*b)}`,
                `${front}${powTex(x,a**b)}`,
                `${front}${powTex(x,a*b+1)}`,
                `${front}${powTex(x,a*b-1)}`,
                `${b}${powTex(x,a)}`,
            ],
            hint:"Everything inside the bracket gets raised to the power.",
            solution:[
                withNumbers?`The number gets raised to the power too: $${p}^{${b}} = ${p**b}$`:"There's no number in front, so just deal with the powers.",
                `When you raise a power to another power, multiply the powers: $${a} \\times ${b} = ${a*b}$`,
                `So the answer is $${correct}$`,
            ]
        });
    },
});

registerTopic({
    id:"zero-powers",
    title:"Powers of 0 and 1",
    group:"Indices",
    blurb:"Anything to the power of 0 is 1. Anything to the power of 1 is itself.",
    grade:3,
    icon:"superscript",
    generate() {
        const a=randInt(2,15);
        const b=randInt(2,15);
        const kind=pick(["zero-plus-one","zero-times","one-minus-zero"]);
        if (kind==="zero-plus-one") {
            return inputQuestion({
                prompt:`Work out $${a}^{0} + ${b}^{1}$`,
                n:1+b,
                hint:"Any number to the power of 0 is 1.",
                solution:[
                    `Any number to the power 0 is 1: $${a}^{0} = 1$`,
                    `Any number to the power 1 is itself: $${b}^{1} = ${b}$`,
                    `$1 + ${b} = ${1+b}$`,
                ],
            });
        }
        if (kind==="zero-times") {
            return inputQuestion({
                prompt:`Work out $${a} \\times ${b}^{0}$`,
                n:a,
                hint:"Work out the power first.",
                solution:[
                    `Any number to the power of 0 is 1: $${b}^{0} = 1$`,
                    `$${a} \\times 1 = ${a}$`,
                ],
            });
        }
        return inputQuestion({
            prompt:`Work out $${a}^{1} - ${b}^{0}$`,
            n:a-1,
            hint:"Power 1 leaves a number alone. Power 0 makes it 1.",
            solution:[
                `$${a}^{1} = ${a}$ and $${b}^{0} = 1$`,
                `$${a} - 1 = ${a-1}$`,
            ],
        });
    },
});