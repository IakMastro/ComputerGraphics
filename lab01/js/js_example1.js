var times = 0;

function addButton() {
    var pid, neon;

    if (times === 0) {
        pid = "p0";
        neon = " bla";
    } else {
        pid = "p1";
        neon = " bli";
    }

    var pp = document.getElementById(pid);

    pp.innerHTML = pp.innerHTML + neon;

    times = (times + 1) % 2;
}

function resetButton() {
    times = 0;
    var pp1 = document.getElementById("p0");
    var pp2 = document.getElementById("p1");

    pp1.innerHTML = "Bla: ";
    pp2.innerHTML = "Bli: ";
}