var loading_show = true;
var selectedStudent = "none";

const firebaseConfig = {
    apiKey: "AIzaSyDE4LcGILX1TGmxT2zFkgsC_1Mh5FwmKzQ",
    authDomain: "assembly-presenter-chooser.firebaseapp.com",
    projectId: "assembly-presenter-chooser",
    storageBucket: "assembly-presenter-chooser.appspot.com",
    messagingSenderId: "965749017601",
    appId: "1:965749017601:web:7324243b2d3b0c5cc2c400",
    measurementId: "G-GWN104CL5R"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var auth = firebase.auth();

var randomCaseNames = ["AARUSH SHIVALE", "AAYANA SARFARE", "Aayush Sawant", "ANSCHEL SANANDA", "Anviti Yadav", "ARYAVEER DESAI", "Ashmit Thete", "ATHARV KUMAR", "AVANI J KODAGI", "Avishi Dhiman", "AYAAN KAPOOR", "Diya Parihar", "Hamza Chaudhary", "ISHAAN Devendra SAWANT", "JINAY CHORDIA", "Lohitaksha Sharma", "MAIRA SHAIKH", "Mayank Marathe", "PARTH RAHUL BHARDWAJ", "PEEYUSH DEEPAKKUMAR AGARWAL", "PREM BHOSALE", "Raaga Praveen Hottigimath", "Ryan Mohapatra", "SAANVI TOMAR", "Saarth Veerkar", "SAKSHI FALAK", "SAMIT SHETTY", "SANJANA HAZRA", "SHAARAV PATWARDHAN", "SHANTANU KHEDKAR", "SHRAVANI KOLHE", "SHREEJAY PATIL", "Shreeya Roshan Kumar", "SOHAM GATTANI", "VAANYA SAXENA", "VIDHI JAIN", "Vishakh Sawalakhe"]

var studentNames = [];
var leftOutStudentNames = [];

for (const m in randomCaseNames) studentNames.push(randomCaseNames[m].toLowerCase());

var leftOutStudentsData = {};
var studentsData = {};
var leftOutStudentNamesSet = false;

setStudentNames();

function setStudentNames() {
    for (const i in studentNames) {
        const studentName = studentNames[i].toLowerCase();
        var li = document.createElement("li");
        li.innerHTML = `
            <label for="checkbox-` + i + `">` + studentName + `</label>
            <input type="checkbox" id="checkbox-` + i + `"></input>
        `;
        document.getElementById("student-list").appendChild(li);
        li.id = "student-" + (parseInt(i) + 1);

        document.getElementById("checkbox-" + parseInt(i)).onclick = function (e) {
            e.preventDefault();
        };
    }
}

setInterval(getStudentData, 100);

function setStudentData(no, studentName) {
    const studentData = {
        done: document.getElementById("checkbox-" + no).checked,
        studentNo: no + 1,
        name: studentName
    };
    studentsData[studentName] = studentData;
    return studentData;
}

function setLeftOutStudentData(studentName) {
    const studentData = studentsData[studentName];
    if (!studentData.done) {
        leftOutStudentsData[studentName] = studentData;
    }
}

var nextStudentEltSet = false;

function getStudentData() {
    database.ref("Students").get().then((data) => {
        if (data.exists()) {
            studentsData = data.val();
            for (var j = 0; j < studentNames.length; j++) {
                const studentName = studentNames[j];
                const studentData = studentsData[studentName];
                if (studentData.done) {
                    document.getElementById("student-" + studentData.studentNo).style.color = "red";
                    document.getElementById("student-" + studentData.studentNo).style.textDecoration = "line-through";
                    var chkbxNo = parseInt(studentData.studentNo) - 1
                    document.getElementById("checkbox-" + chkbxNo).checked = true;
                    if (studentData.next) {
                        studentData.next = false;
                        updateStudentData();
                    }
                }
                if (studentData.next) {
                    document.getElementById("student-" + studentData.studentNo).style.color = "blue";
                    if (!nextStudentEltSet) {
                        var chkbxNo = parseInt(studentData.studentNo) - 1
                        document.getElementById("student-" + studentData.studentNo).innerHTML += `  
                            <label for="checkbox-` + chkbxNo + `"> (next participant) </label>
                        `;
                        nextStudentEltSet = true;
                    }
                }
                setLeftOutStudentData(studentName);
            }
            if (!leftOutStudentNamesSet) {
                for (const p in leftOutStudentsData) {
                    leftOutStudentNames.push(leftOutStudentsData[p].name);
                    console.log("push");
                }
                console.log(leftOutStudentNames);
                leftOutStudentNamesSet = true;
            }
        }
        else {
            updateStudentData();
        }
    });
}

function updateStudentData(reload) {
    database.ref("/").update({
        Students: studentsData
    }).then(() => {
        for (let l = 0; l < studentNames.length; l++) {
            const studentName = studentNames[l];
            setStudentData(l, studentName);
            setLeftOutStudentData(studentName);
        }
        if (reload) location.reload();
    });
}

/* We could also have used auth.onStateChanged, but that doesn't get called in disconnections
*/
checkConnectionEveryHalfSeconds();
function checkConnectionEveryHalfSeconds() {
    setTimeout(function () {
        var connectedRef = database.ref(".info/connected");
        connectedRef.on("value", function (snap) {
            if (snap.val()) {
                loading_show = false;
                document.getElementById("content-for-connected-users").style.display = "block";
            }
            else {
                loading_show = true;
                document.getElementById("content-for-connected-users").style.display = "none";
            }
        });
        checkConnectionEveryHalfSeconds();
    }, 500);
}

function downloadDataAsTxt() {
    var data = `Done students:\n`;
    var nextParticipant;
    for (const i in studentsData) {
        const student = studentsData[i];
        if (student.done) data += ` - ` + student.name + `\n`;
        if (student.next) nextParticipant = student.name;
    }
    data = data.slice(0, data.length - 1);
    data += `\n\nNext participant: ` + nextParticipant + "\n\nRemaining people:\n";
    var remainingPeople = [];
    for (const i in studentsData) {
        const student = studentsData[i];
        if (!student.done && !student.next) data += ` - ` + student.name + `\n`;
    }
    data = data.slice(0, data.length - 1);

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    fileName = months[new Date().getMonth()] + " " + new Date().getDate() + ", " + new Date().getFullYear() + " - Presenter Data";

    var c = document.createElement("a");
    c.download = fileName + ".txt";
    var t = new Blob([data], {
        type: "text/plain"
    });
    c.href = window.URL.createObjectURL(t);
    c.click();
}

function downloadDataAsHTML() {
    var data = `<h1> Done students:<br>`;
    var nextParticipant;
    for (const i in studentsData) {
        const student = studentsData[i];
        if (student.done) data += ` - ` + student.name + "<br>";
        if (student.next) nextParticipant = student.name;
    }
    data = data.slice(0, data.length - 1);
    data += `<br><br>Next participant: ` + nextParticipant + `<br><br>Remaining people: <br>`;
    var remainingPeople = [];
    for (const i in studentsData) {
        const student = studentsData[i];
        if (!student.done && !student.next) data += ` - ` + student.name + `<br>`;
    }
    data = data.slice(0, data.length - 1);
    data += `</h1>`;

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    fileName = months[new Date().getMonth()] + " " + new Date().getDate() + ", " + new Date().getFullYear() + " - Presenter Data";

    var c = document.createElement("a");
    c.download = fileName + ".html";
    var t = new Blob([data], {
        type: "text/html"
    });
    c.href = window.URL.createObjectURL(t);
    c.click();
}