const xssForm = document.getElementById("xssForm");
const commentsBox = document.getElementById("commentsBox");

async function saveProgress(labKey) {
    try {
        await fetch(${API_BASE_URL}/progress/solve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                labKey: labKey
            })
        });
    } catch (err) {
        console.error("Progress save failed:", err);
    }
}

async function loadComments() {

    try {

        const response = await fetch(
            ${API_BASE_URL}/xss/comments`
        );

        const data =
        await response.json();

        commentsBox.innerHTML = "";

        data.comments.forEach((item) => {

            const commentCard =
            document.createElement("div");

            commentCard.style.marginBottom =
            "15px";

            commentCard.style.padding =
            "18px";

            commentCard.style.borderRadius =
            "14px";

            commentCard.style.background =
            "rgba(255,255,255,0.06)";

            commentCard.style.border =
            "1px solid rgba(255,255,255,0.1)";

            // vulnerable rendering

            commentCard.innerHTML = `
                <strong>${item.name}</strong>
                <p>${item.comment}</p>
            `;

            commentsBox.appendChild(
                commentCard
            );

        });

    }

    catch(error){

        commentsBox.innerHTML =
        "Unable to load comments";

    }
}



if(xssForm){

xssForm.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

const name =
document.getElementById(
"xssName"
).value;

const comment =
document.getElementById(
"xssComment"
).value;

const message =
document.getElementById(
"xssMessage"
);

try{

const response =
await fetch(

${API_BASE_URL}/xss/comment`,

{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({
name,
comment
})

}

);



if(response.ok){

if(

comment.includes(
"onerror"
)

||

comment.includes(
"<script"
)

){

await saveProgress(
"lab_xss"
);

}



message.style.color =
"#22c55e";

message.textContent =
"Comment posted successfully";

xssForm.reset();

loadComments();

}

else{

message.style.color =
"#ef4444";

message.textContent =
"Failed to post comment";

}

}

catch(error){

message.style.color =
"#ef4444";

message.textContent =
"Unable to connect";

}

});

}



loadComments();