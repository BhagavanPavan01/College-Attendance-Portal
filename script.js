function doPost(e) {
    var sheetName = e.parameter.branch + "_" + e.parameter.section;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) return ContentService.createTextOutput("Sheet Not Found").setMimeType(ContentService.MimeType.TEXT);
    
    sheet.appendRow([new Date(), e.parameter.name, e.parameter.roll, e.parameter.status]);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
  

  document.getElementById("attendanceForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    let formData = {
        branch: document.getElementById("branch").value,
        section: document.getElementById("section").value,
        name: document.getElementById("name").value,
        roll: document.getElementById("roll").value,
        status: document.getElementById("status").value
    };

    fetch("YOUR_GOOGLE_APPS_SCRIPT_URL", {
        method: "POST",
        body: new URLSearchParams(formData)
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("message").innerText = data === "Success" ? "Attendance Recorded!" : "Error!";
    })
    .catch(error => console.error("Error:", error));
});

//  Attendance excel sheet ------------------------


document.addEventListener("DOMContentLoaded", function () {
    const branchSelect = document.getElementById("branch");
    const sectionSelect = document.getElementById("section");
    const rollSelect = document.getElementById("roll");

    async function fetchRollNumbers(branch, section) {
        const sheetID = "https://docs.google.com/spreadsheets/d/1gbjd9DgU19w4IKm5kiI8MmhEl8E0zWUC/edit?usp=sharing&ouid=103564657463461977015&rtpof=true&sd=true"; // Replace with your Google Sheet ID
        const sheetName = "Sheet1"; // Change if needed
        const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq&sheet=${sheetName}`;

        try {
            const response = await fetch(apiUrl);
            const text = await response.text();
            const json = JSON.parse(text.substring(70, text.length - 2));

            rollSelect.innerHTML = ""; // Clear previous options
            json.table.rows.forEach(row => {
                let [rollNum, branchCol, sectionCol] = row.c.map(cell => cell?.v);
                if (branchCol === branch && sectionCol === section) {
                    let option = document.createElement("option");
                    option.value = rollNum;
                    option.textContent = rollNum;
                    rollSelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    branchSelect.addEventListener("change", () => {
        fetchRollNumbers(branchSelect.value, sectionSelect.value);
    });

    sectionSelect.addEventListener("change", () => {
        fetchRollNumbers(branchSelect.value, sectionSelect.value);
    });
});

