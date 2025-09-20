const express = require('express');
const app = express();
const port = 4000;
app.get('/user',(req,res)=>{
    res.end("getting data");
})
app.post('/user',(req,res)=>{
    res.end("adding new data");
})
app.put('/user/:id',(req,res)=>{
    console.log(req.params.id)
    res.end("updation");
})
app.delete('/user/:id',(req,res)=>{
    
    res.end("Deletion");
})
app.listen(port,()=>console.log(`server running on ${port}`));
