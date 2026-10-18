function sfTex(mantissa,power) {
    return `${mantissa} \\times 10^{${power}}`;
}

function randomMantissa() {
    const digits=chance(0.5)?randInt(11,99):randInt(101,999);
    const places=digits<100?1:2;
    let mantissa=digits/10**places;
    if (digits%10===0) mantissa=roundTo(mantissa,places-1);
    return mantissa;
}

function sfToOrdinary(mantissa,power) {
    const [whole,decimals=""]=String(mantissa).split(".");
    const digits=whole+decimals;
    const point=whole.length+power;
    if (power<=0) return `0.${"0".repeat(-point)}${digits}`;
    if (point>=digits.length) return digits+"0".repeat(point-digits.length);
    return `${digits.slice(0,point)}.${digits.slice(point)}`;
}

registerTopic({
    id:"writing-standard-form",
    title:"Writing in Standard Form",
    group:"Standard Form",
    blurb:"Multiply the numbers, add the powers, then tidy up.",
    grade:6,
    icon:"x",
    generate() {
        const a=randInt(2,9);
        const b=randInt(2,9);
        const p=randInt(2,8);
        const q=randInt(-4,8);
        const product=a*b;
        const power=p+q;
        const needsTidy=power>=10;
        const mantissa=needsTidy?product/10:product;
        const finalPower=needsTidy?power+1:power;
        const correct=sfTex(mantissa,finalPower);
        const solution=[
            `Multiply the numbers: $${a} \\times ${b} = ${product}$`,
            `Add the powers: $10^{${p}} \\times 10^{${q}} = 10^{${power}}$`,
        ];
        if (needsTidy) {
            solution.push(`$${product}$ isn't between 1 and 10, so write it as $${mantissa} \\times 10$. That adds 1 to the power: $${correct}$`);
        } else {
            solution.push(`So the answer is $${correct}$`);
        }
        return choiceQuestion({
            prompt:`Work out $(${sfTex(a,p)}) \\times (${sfTex(b,q)})$. Give your answer in standard form.`,
            correct,
            wrong:[
                sfTex(product,power),
                sfTex(mantissa,p*q),
                sfTex(mantissa,finalPower+1),
                sfTex(mantissa,finalPower-1),
                sfTex(a+b,power),
            ].filter((option)=>option!==correct),
            hint:"Multiply the front numbers and add the powers, then make sure the front number is between 1 and 10.",
            solution,
        });
    }
});