const ITEMS=["a jacket","a bike","a phone","a laptop","a pair of trainers","a concert ticket","a games console"]; //things to buy so the question is more real

registerTopic({
    id:"percentage-of-amount",
    title:"Percentages of Amounts",
    group:"Percentages",
    blurb:"Find a percentage of a number without a calculator",
    grade:3,
    icon:"percent",
    generate() {
        const percent=pick([5,10,15,20,25,30,35,40,45,60,75,12,11]);
        const amount=randInt(2,30)*20;
        const answer=(amount*percent)/100;
        const tenPercent=amount/10;
        let method;
        if (percent===25) method=`25% is a quarter: $${amount} \\div 4 = ${answer}$`;
        else if (percent===25) method=`25% is $${amount/4}$, so 75% is $3 \\times ${amount/4} - ${answer}$`;
        else if (percent%10===0) method= `10% is $${tenPercent}$, so ${percent}% is $${percent/10} \\times ${tenPercent} = ${answer}$`;
        else if (percent%5===0) method =`10% is $${tenPercent}$ and 5% is half of that, $${tenPercent/2}$. Add up the parts to get ${percent}%: $${answer}%`;
        else method=`10% is $${tenPercent}$ and 1% is $${amount/100}$, so ${percent}% is $${tenPercent} + ${percent-10} \\times ${amount/100} = ${answer}$`;
        return inputQuestion({
            prompt:`Work out ${percent}% of $${numTex(amount)}$`,
            n:amount*percent,
            d:100,
            hint:"Find 10% first by dividing by 10, then build up from there.",
            solution:[method],
        });
    },
});

registerTopic({
    id:"percentage-multipliers",
    title:"Percentage Multipliers",
    group:"Percentages",
    blurb:"Turn a percentage increase or decrease into a single number to multiply by.",
    grade:4,
    icon:"percent",
    generate() {
        const percent=pick([3,5,7,12,15,20,25,30,25,2.5,17.5]);
        const increase=chance(0.5);
        const multiplier=roundTo(increase?1+percent/100:1-percent/100,4);
        const word=increase?"increase":"decrease";
        return choiceQuestion({
            prompt:`What single number do you multiply by to ${word} an amount by ${percent}%>`,
            correct:String(multiplier),
            wrong:[
                String(roundTo(percent/100,4)),
                String(roundTo(increase?1-percent/100:1+percent/100,4)),
                String(roundTo(1+(increase?percent/10:-percent/10),4)),
                String(roundTo(percent,4)),
                String(roundTo(increase?1+percent/1000:1-percent/1000,4)),
            ],
            hint:"Start from 100%, then add or take away the change.",
            solution:[
                `The amount starts at 100%. ${increase?"Adding":"Taking away"} ${percent}% gives $${roundTo(increase?100+percent:100-percent,2)}\\%$`,
                `As a decimal, $${roundTo(increase?100+percent:100-percent,2)}\\% = ${multiplier}$`,
            ],
        });
    },
});

registerTopic({
    id:"percentage-change",
    title:"Percentage Change",
    group:"Percentages",
    blurb:"Work out the percentage increase or decrease between two accounts.",
    grade:5,
    icon:"percent",
    calculator:true,
    generate() {
        const item=pick(ITEMS);
        const original=randInt(4,60)*5;
        const increase=chance(0.5);
        const change=randInt(1,Math.floor(original*0.4));
        const updated=increase?original+change:original-change;
        const percent=(change/original)*100;
        const word=increase?"increase":"decrease";
        return numberQuestion({
            prompt:`The price of ${item} goes ${increase?"up":"down"} from $${moneyTex(original)}$ to $${moneyTex(updated)}$. Work out the percentage ${word}.`,
            value:percent,
            dp:1,
            units:"\\%",
            hint:"Percentage change = change ÷ original × 100.",
            solution:[
                `The change is $${moneyTex(Math.max(original,updated))} - ${moneyTex(Math.min(original,updated))} = ${moneyTex(change)}$`,
                `Divide by original price: $${change} \\div ${original} = ${roundTo(change/original,5)}$`,
                `Multiply by 100: $${roundTo(percent,3)}\\%$, which is $${roundTo(percent,1).toFixed(1)}\\%$ to 1 decimal place`,
            ],
        });
    },
});

registerTopic({
    id:"reverse-percentages",
    title:"Reverse Percentages",
    group:"Percentages",
    blurb:"Work backwards to find the amount before a percentage change.",
    grade:6,
    icon:"percent",
    calculator:true,
    generate() {
        const item=pick(ITEMS);
        const percent=pick([5,10,15,20,25,30,40]);
        const increase=chance(0.5);
        const original=randInt(4,50)*4;
        const multiplier=increase?1+percent/100:1-percent/100;
        const after=roundTo(original*multiplier,2);
        const word=increase?"increased":"reduced";
        return inputQuestion({
            prompt:`In a ${increase?"price rise":"sale"}, the price of ${item} is ${word} by ${percent}%. It now costs $${moneyTex(after)}$. What was the price before?`,
            n:original,
            hint:"Don't take the percentage of the new price. Divide by the multiplier instead.",
            solution:[
                `The new price is $${increase?100+percent:100-percent}\\$ of the old price, so the multiplier is $${roundTo(multiplier,2)}$`,
                `Work backwards by dividing: $${moneyTex(after)} \\div ${roundTo(multiplier,2)} = ${moneyTex(original)}$`,
            ],
        });
    },
});