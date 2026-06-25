window.addEventListener("DOMContentLoaded", () => {

const uploadBtn =
document.getElementById("uploadBtn");

const fileInput =
document.getElementById("avatarFile");

const message =
document.getElementById("uploadMessage");

const output =
document.getElementById("uploadOutput");

const user =
JSON.parse(
localStorage.getItem("user")
);

const responseKey =
user && user.id
? `last_upload_response_${user.id}`
: "last_upload_response_guest";

const savedResponse =
localStorage.getItem(responseKey);

if(savedResponse){

output.textContent =
savedResponse;

}
else{

output.textContent =
"Waiting...";

}

async function saveProgress(labKey) {

try {

await fetch(`${API_BASE_URL}/progress/solve`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${localStorage.getItem("token")}`
},
body: JSON.stringify({
labKey: labKey
})
});

}

catch(err) {

console.error(
"Progress save failed:",
err
);

}

}

uploadBtn.addEventListener("click", async (e) => {

e.preventDefault();
e.stopPropagation();

if(!fileInput.files || !fileInput.files[0]){

message.style.color =
"#ef4444";

message.textContent =
"Please choose a file first.";

return;

}

message.style.color =
"#38bdf8";

message.textContent =
"Uploading...";

output.textContent =
"Waiting for response...";

try{

const formData =
new FormData();

formData.append(
"avatar",
fileInput.files[0]
);

const response =
await fetch(
`${API_BASE_URL}/upload/upload`,
{
method:"POST",
body:formData
}
);

const data =
await response.json();

const result =
JSON.stringify(
data,
null,
2
);

localStorage.setItem(
responseKey,
result
);

output.textContent =
result;

if(response.ok){

message.style.color =
"#22c55e";

message.textContent =
"File uploaded successfully";

if(data.filename === "payload.php"){

await saveProgress(
"lab_upload"
);

message.textContent =
"Lab solved! Dangerous file uploaded successfully.";

}

}
else{

message.style.color =
"#ef4444";

message.textContent =
data.message || "Upload failed";

}

}
catch(err){

console.error(err);

message.style.color =
"#ef4444";

message.textContent =
"Server error";

output.textContent =
err.message;

}

});

});