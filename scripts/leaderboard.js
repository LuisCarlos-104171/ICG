window.onload = function() {
    const data = localStorage.getItem("game");
    const lbTable = document.getElementById("leaderboard");

    if (data !== null) {
        const parsed = JSON.parse(data);
        const runHistory = parsed.runHistory;
        const highestScore = parsed.highestScore;
        const cash = parsed.cash;

        document.getElementById("highscore").innerText = highestScore;
        document.getElementById("cash").innerText = cash.toFixed(2) + "€";

        runHistory.forEach((run, idx) => {
            const row = document.createElement("tr");
            const runNumber = document.createElement("td");
            const score = document.createElement("td");
            const date = document.createElement("td");

            runNumber.innerText = "#" + (runHistory.length - idx).toString();
            score.innerText = run.score;
            date.innerText = new Date(run.ts).toLocaleDateString();

            row.appendChild(runNumber);
            row.appendChild(score);
            row.appendChild(date);

            row.classList.add("text-black");

            lbTable.appendChild(row);
        });
    }
}