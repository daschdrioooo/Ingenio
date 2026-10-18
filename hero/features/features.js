lucide.createIcons();

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

function withMaths(text) {
    return text.replace(/\$(.+?)\$/g, (_, tex) =>
        katex.renderToString(tex, { throwOnError: false })
    );
}

function whenVisible(el, start) {
    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                observer.disconnect();
                start();
            }
        },
        { threshold: 0.4 }
    );
    observer.observe(el);
}

const QUESTIONS = [
    {
        topic: "Fractional indices",
        grade: 6,
        text: "Work out $8^{\\frac{2}{3}}$",
        steps: ["4"],
        calculator: false,
    },
    {
        topic: "Surds",
        grade: 7,
        text: "Simplify $\\sqrt{50}$",
        steps: ["5", "5\\sqrt{}", "5\\sqrt{2}"],
        calculator: false,
    },
    {
        topic: "Percentages",
        grade: 4,
        text: "Find $15\\%$ of $240$",
        steps: ["3", "36"],
        calculator: true,
    },
    {
        topic: "Linear equations",
        grade: 3,
        text: "Solve $3x + 7 = 22$",
        steps: ["x", "x =", "x = 5"],
        calculator: false,
    },
];

const demo = document.getElementById("demo");
const demoBody = document.getElementById("demoBody");
const demoBox = document.getElementById("demoBox");
const demoCheck = document.getElementById("demoCheck");

function showQuestion(q, number) {
    document.getElementById("demoTitle").textContent = `Question ${number}`;
    document.getElementById("demoGrade").textContent = `Grade ${q.grade}`;
    document.getElementById("demoTopic").textContent = q.topic;
    document.getElementById("demoCalc").classList.toggle("is-allowed", q.calculator);
    document.getElementById("demoText").innerHTML = withMaths(q.text);
    demoBox.textContent = "";
    demo.classList.remove("is-marked");
}

async function playQuestions() {
    for (let i = 0; ; i = (i + 1) % QUESTIONS.length) {
        const q = QUESTIONS[i];

        showQuestion(q, i + 1);
        demoBody.classList.remove("is-hidden");
        await wait(900);

        for (const step of q.steps) {
            katex.render(step, demoBox, { throwOnError: false });
            await wait(220);
        }
        await wait(500);

        demoCheck.classList.add("is-pressed");
        await wait(150);
        demoCheck.classList.remove("is-pressed");
        demo.classList.add("is-marked");
        await wait(2200);

        demoBody.classList.add("is-hidden");
        await wait(350);
    }
}

if (demo) whenVisible(demo, playQuestions);

const CHAT = [
    { from: "student", text: "I got x = 29/3 but it says I'm wrong" },
    { from: "tutor", text: "Nearly! Check your second line. You added 7 to both sides, but you need to subtract it." },
    { from: "student", text: "Ohh so is it $3x = 15$?" },
    { from: "tutor", text: "Exactly. Now divide both sides by 3. What do you get?" },
    { from: "student", text: "$x = 5$" },
    { from: "tutor", text: "Correct, nice work. That's the full 2 marks." },
];

const chatLog = document.getElementById("chatLog");

function scrollChat() {
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addBubble(from) {
    const bubble = document.createElement("div");
    bubble.className = `bubble bubble--${from}`;
    chatLog.appendChild(bubble);
    scrollChat();
    return bubble;
}

function addTyping() {
    const bubble = addBubble("tutor");
    bubble.classList.add("bubble--typing");
    bubble.innerHTML = "<span></span><span></span><span></span>";
    return bubble;
}

async function playChat() {
    while (true) {
        chatLog.innerHTML = "";
        await wait(800);

        for (const m of CHAT) {
            if (m.from === "tutor") {
                const dots = addTyping();
                await wait(1100);
                dots.remove();
            }

            const bubble = addBubble(m.from);

            if (m.text.includes("$")) {
                bubble.innerHTML = withMaths(m.text);
            } else if (m.from === "tutor") {
                for (const word of m.text.split(" ")) {
                    bubble.textContent += word + " ";
                    scrollChat();
                    await wait(55);
                }
            } else {
                bubble.textContent = m.text;
            }

            scrollChat();
            await wait(1200);
        }

        await wait(3500);
    }
}

if (chatLog) whenVisible(chatLog, playChat);