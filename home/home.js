lucide.createIcons();

const sideBar = document.getElementById("sideBar");
const items = document.querySelectorAll("#nav li");
const panels = document.querySelectorAll(".panel");

items.forEach(li => {
    li.addEventListener("click", () => {
        items.forEach(i => i.classList.remove("selected"));
        li.classList.add("selected");
        panels.forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".background").forEach(background => {
            background.classList.remove("open");
        });

        const panel = document.getElementById(li.dataset.panel);
        const background = document.getElementById(`${li.dataset.panel}Background`);

        panel.classList.add("active");
        background?.classList.add("open");
        sideBar.classList.add("open");
    });
});

document.querySelectorAll(".tabs").forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll(".tab");
    const contents = tabGroup.parentElement.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            contents.forEach(c => c.classList.remove("active"));
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
});