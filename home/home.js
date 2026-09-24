lucide.createIcons();

const sideBar = document.getElementById("sideBar");
const items = document.querySelectorAll("#nav li");
const panels = document.querySelectorAll(".panel");

items.forEach(li => {
    li.addEventListener("click", () => {
        items.forEach(i => i.classList.remove("selected"));
        li.classList.add("selected");
        panels.forEach(p => p.classList.remove("active"));
        document.getElementById(li.dataset.panel).classList.add("active");
        sideBar.classList.add("open");
    });
});