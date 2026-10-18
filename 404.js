lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
  const answerBox = document.querySelector(".questionInput") || document.querySelector("input");

  const answers = [
    "404 error - page not found",
    "that doesn't exist mate",
    "idk bro",
    "what are you tryna search",
    "undefined",
    "it's in the denominator",
    "see page 404"
  ];

  const pick = answers[Math.floor(Math.random() * answers.length)];
  answerBox.placeholder = pick;
  answerBox.value = "";
});