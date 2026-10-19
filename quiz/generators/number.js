const SMALL_PRIMES=[2,3,5,7,11,13];

registerTopic({
    id:"order-of-operations",
    title:"Order of Operations",
    group:"Number",
    blurb:"Brackets, powers, then times and divide, then add and subtract",
    grade:2,
    icon:"list-ordered",
    generate() {
        const kind=pick(["add-times","brackets","times-minus-divide","square"]);
        const hint="Brackets first, then powers, then × and ÷, then + and -.";
        if (kind==="add-times") {
            const a=randInt(2,20);
            const b=randInt(2,9);
            const c=randInt(2,9);
            return inputQuestion({
                prompt:`Work out $${a} + ${b} \\times ${c}$`,
                n:a+b*c,
                hint,
                solution:[
                    `Multiply before you add: $${b} \\times ${c} = ${b * c}$`,
                    `$${a} + ${b *c}=${a+b*c}$`,
                ],
            });
        }
        if (kind==="brackets") {
            const a=randInt(2,12);
            const b=randInt(2,12);
            const c=randInt(2,6);
            return inputQuestion({
                prompt:`Work out $(${a} + ${b}) \\times ${c} = ${b * c}$`,
                n:a+b*c,
                hint,
                solution: [
                    `Multiply before you add: $${b} \\times ${c} = ${b * c}$`,
                    `$${a} + ${b*c} = ${a+b*c}$`,
                ],
            });
        }
        if (kind==="brackets") {
            const a=randInt(2,12);
            const b=randInt(2,12);
            const c=randInt(2,6);
            return inputQuestion({
                prompt:`Work out $(${a} + ${b}) \\times ${c}$`,
                n: (a+b)*c,
                hint,
                solution:[
                    `Brackets first, $${a} + ${b} = ${a +b}$`,
                    `$${a+b} \\times ${c} = ${(a+b)*c}$`,
                ],
            });
        }
        if (kind==="times-minus-divide") {
            const a=randInt(3,9);
            const b=randInt(3,9);
            const d=randInt(2,6);
            const c=d*randInt(2,6);
            return inputQuestion({
                prompt:`Work out $${a} \\times ${b} - ${c} \\div ${d}$`,
                n:a*b-c/d,
                hint,
                solution:[
                    `Do the times and the divide first: $${a} \\times ${b} = ${a * b}$ and $${c} \\div ${d} = ${c/d}$`,
                    `$${a*b} - ${c/d} = ${a*b-c/d}$`,
                ],
            });
        }
        const a=randInt(2,9);
        const b=randInt(2,5);
        const c=randInt(2,9);
        return inputQuestion({
            prompt:`Work out $${a}^2 - ${b} \\times ${c}$`,
            n:a*a-b*c,
            hint,
            solution:[
                `Powers first: $${a}^${2} = ${a*a}$`,
                `Then multiply: $${b} \\times ${c} = ${b*c}$`,
                `$${a*a} - ${b*c} = ${a*a-b*c}$`,
            ],
        });
    },
});

registerTopic({
    id:"factors-multiples-primes",
    title:"Factors, Multiples and Primes",
    group:"Number",
    blurb:"Spot primes, factors and multiples.",
    grade:1,
    icon:"hash",
    generate() {
        const isPrime=(n)=>{
            if (n<2) return false;
            for (let f=2;f*f<=n;f++) if (n%f===0) return false;
            return true;
        };
        const kind=pick(["prime","factor","multiple"]);
        if (kind==="prime") {
            const primes=[];
            for (let n=11;n<100;n++) if (isPrime(n)) primes.push(n);
            const tricky=[21,27,33,39,49,51,57,63,69,77,81,87,91,93];
            const correct=pick(primes);
            const wrong=shuffle(tricky).slice(0,3);
            return choiceQuestion({
                prompt:"Which of these is a prime number?",
                correct:String(correct),
                wrong:wrong.map(String),
                hint:"A prime has exactly two factors - 1, and itself. Try dividing by 3 and 7.",
                solution:[
                    ...wrong.map((n)=>{
                        const f=[3,7,11,13].find((p)=>n%p===0);
                        return `$${n} = ${f} \\times ${n/f}$, so it isn't prime.`;
                    }),
                    `$${correct}$ only divides by 1 and itself, so it is prime.`,
                ],
            });
        }
        if (kind==="factor") {
            const n=pick([24,36,40,48,60,72,84,90,96]);
            const factors=[];
            const others=[];
            for (let f=3;f<n;f++) (n%f===0?factors:others).push(f);
            const correct=pick(factors);
            return choiceQuestion({
                prompt:`Which of these is a factor of $${n}$?`,
                correct:String(correct),
                wrong:shuffle(others.filter((f)=>f<30)).slice(0,5).map(String),
                hint:"A factor divides into the number exactly, with nothing left over.",
                solution:[`$${n} \\div ${correct} = ${n/correct}$ exactly, so $${correct}$ is a factor of $${n}$.`],
            });
        }
        const n=randInt(6,15);
        const correct=n*randInt(4,12);
        return choiceQuestion({
            prompt:`Which of these is a multiple of $${n}$?`,
            correct:String(correct),
            wrong:[correct+1,correct-2,correct+n-1,correct+3,correct-n+1].map(String),
            solution:[`$${correct} = ${n} \\times ${correct/n}$, so it is in the ${n} times table.`],
        });
    },
});

function primeFactorsTex(powers) {
    return Object.keys(powers)
    .map(Number)
    .sort((a,b)=>a-b)
    .filter((p)=>powers[p]>0)
    .map((p)=>powTex(String(p),powers[p]))
    .join(" \\times ");
}

registerTopic({
    id:"prime-factorisation",
    title:"Prime Factorisation",
    group:"Number",
    blurb:"Write a number as a product of its prime factors.",  
    grade:4,
    icon:"git-fork",
    generate() {
        let powers;
        let n;
        do {
            powers={2:randInt(1,4),3:randInt(0,2),5:randInt(0,2),7:randInt(0,1)};
            n=Object.entries(powers).reduce((total,[p,k])=>total*Number(p)**k,1);
        } while (n<30||n>1000||Object.values(powers).filter((k)=>k>0).length<2);
        const correct=primePowersTex(powers);
        const wrong=[];
        const used=Object.keys(powers).map(Number).filter((p)=>powers[p]>0);
        used.forEach((p)=>{
            wrong.push(primePowersTex({...powers,[p]:powers[p]+1}));
            if (powers[p]>1) wrong.push(primePowersTex({...powers,[p]:powers[p]-1}));
        });
        if (powers[2]>=2) {
            wrong.unshift(`4 \\times ${primePowersTex({...powers,2:powers[2] - 2})||"1"}`);
        }
        const missing=[3,5,7,11].find((p)=>!powers[p]);
        wrong.push(primePowersTex({...powers,[missing]:1,[used[used.length-1]]:0}));
        const steps=[];
        let left=n;
        [2,3,5,7].forEach((p)=>{
            while (left % p ===0) {
                steps.push(`$${left} = ${p} \\times ${left/p}$`);
                left /= p;
            }
        });
        return choiceQuestion({
            prompt:`Write $${numTex(n)}$ as a product of its prime factors.`,
            correct,
            wrong:shuffle(wrong),
            hint:"Keep dividing by the smallest prime that goes in: 2, then 3, then 5...",
            solution:[
                "Keep splitting off the smallest prime:",
                ...steps,
                `Collect them up with powers: $${numTex(n)} = ${correct}$`,
            ],
        });
    },
});

registerTopic({
    id:"hcf-lcm",
    title:"HCF and LCM",
    group:"Number",
    blurb:"Find the highest common factor and the lowest common multiple",
    grade:4,
    icon:"git-merge",
    generate() {
        const g=randInt(2,12);
        let p=randInt(2,9);
        let q=randInt(2,9);
        while (p===q||gcd(p,q)!==1) {
            p=randInt(2,9);
            q=randInt(2,9);
        }
        const a=g*Math.min(p,q);
        const b=g*Math.min(p,q);
        const findHcf=chance(0.5);
        if (findHcf) {
            return inputQuestion({
                prompt:`Find the highest common factor (HCF) of $${a} and $${b}$.`,
                n:g,
                hint:"The HCF is the biggest number that divides into both.",
                solution:[
                    `$${a} = ${g} \\times ${a/g}$ and $${b} = ${g} \\times ${b/g}$`,
                    `$${a/g}$ and $${b/g}$ have no common factors, so nothing bigger than $${g}$ goes into both.`,
                    `HCF $= ${g}$`,
                ],
            });
        }
        const answer=lcm(a,b);
        return inputQuestion({
            prompt:`Find the lowest common multiple (LCM) of $${a} and $${b}$.`,
            n:answer,
            hint:"List the multiples of the bigger number until one is in the other times table too.",
            solution:[
                `The HCF of $${a}$ and $${b}$ is $${g}$.`,
                `LCM $= \\dfrac{${a} \\times ${b}{${g}} = ${answer}$`,
                `Check: $${answer} = ${a} \\times ${answer/a}$ and $${answer} = ${b} \\times ${answer/b}$`,
            ],
        });
    },
});