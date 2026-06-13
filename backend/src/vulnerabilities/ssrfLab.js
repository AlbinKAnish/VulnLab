const express = require("express");
const axios = require("axios");

const router = express.Router();


// =====================
// Internal Admin Service
// =====================

router.get(
"/internal/admin",

(req,res)=>{

res.json({

message:
"Internal service",

apiKey:
"vulnlab_admin_2026",

note:
"Do not expose externally"

});

}

);




// =====================
// Vulnerable URL Fetcher
// SSRF
// =====================

router.post(

"/fetch",

async(req,res)=>{

const { url } =
req.body;


if(!url){

return res.status(400)
.json({

message:
"URL required"

});

}


try{

const response =
await axios.get(url);


res.json({

message:
"Resource fetched",

fetchedUrl:
url,

data:
response.data

});

}

catch(err){

res.status(500)
.json({

message:
"Unable to fetch resource",

error:
err.message

});

}

}

);


module.exports =
router;