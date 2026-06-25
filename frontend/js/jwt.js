let currentJwtToken = "";

const jwtLoginForm =
document.getElementById(
"jwtLoginForm"
);

const jwtTokenBox =
document.getElementById(
"jwtTokenBox"
);

const jwtLoginMessage =
document.getElementById(
"jwtLoginMessage"
);

const jwtPayrollMessage =
document.getElementById(
"jwtPayrollMessage"
);

const jwtOutput =
document.getElementById(
"jwtOutput"
);

const accessPayrollBtn =
document.getElementById(
"accessPayrollBtn"
);

const accessWithCustomTokenBtn =
document.getElementById(
"accessWithCustomTokenBtn"
);

const customJwt =
document.getElementById(
"customJwt"
);

async function saveProgress(labKey){

try{

await fetch(

`${API_BASE_URL}/progress/solve`,

{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${localStorage.getItem("token")}`
},

body:
JSON.stringify({
labKey:labKey
})
}

);

}

catch(err){

console.error(
"Progress save failed:",
err
);

}

}



// employee login

jwtLoginForm.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

const username =
document.getElementById(
"jwtUsername"
).value;

const password =
document.getElementById(
"jwtPassword"
).value;


try{

const response =
await fetch(

`${API_BASE_URL}/jwt/employee-login`,

{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({
username,
password
})

}

);

const data =
await response.json();

jwtOutput.textContent =
JSON.stringify(
data,
null,
2
);


if(response.ok){

currentJwtToken =
data.token;

jwtTokenBox.textContent =
data.token;

jwtLoginMessage.style.color =
"#22c55e";

jwtLoginMessage.textContent =
"Employee login successful.";

}

else{

jwtLoginMessage.style.color =
"#ef4444";

jwtLoginMessage.textContent =
data.message ||
"Login failed";

}

}

catch{

jwtLoginMessage.style.color =
"#ef4444";

jwtLoginMessage.textContent =
"Unable to connect";

}

});




// original token

accessPayrollBtn
.addEventListener(

"click",

async()=>{

if(!currentJwtToken){

jwtPayrollMessage.style.color =
"#ef4444";

jwtPayrollMessage.textContent =
"Login first.";

return;

}

await accessPayroll(
currentJwtToken
);

});




// modified token

accessWithCustomTokenBtn
.addEventListener(

"click",

async()=>{

const token =
customJwt.value.trim();

if(!token){

jwtPayrollMessage.style.color =
"#ef4444";

jwtPayrollMessage.textContent =
"Paste modified JWT";

return;

}

await accessPayroll(
token
);

});




// payroll access

async function accessPayroll(
token
){

try{

const response =
await fetch(

`${API_BASE_URL}/jwt/payroll`,

{
method:"GET",

headers:{
Authorization:
`Bearer ${token}`
}

}

);

const data =
await response.json();

jwtOutput.textContent =
JSON.stringify(
data,
null,
2
);


if(response.ok){

await saveProgress(
"lab_jwt"
);

jwtPayrollMessage.style.color =
"#22c55e";

jwtPayrollMessage.textContent =
"Payroll access granted.";

}

else{

jwtPayrollMessage.style.color =
"#ef4444";

jwtPayrollMessage.textContent =
data.message ||
"Access denied";

}

}

catch{

jwtPayrollMessage.style.color =
"#ef4444";

jwtPayrollMessage.textContent =
"Unable to connect";

}

}