import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbpassword=process.env.DB_PASSWORD;

const db=new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: dbpassword,
  port: 5432,
});

db.connect();

async function checkVisited(){
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries=[];

  result.rows.forEach(country=>{
    countries.push(country.country_code);
  });
  return countries;
}

async function alreadyPresent(countryCode){
  
}

app.get("/", async (req, res) => {
  //Write your code here.

  //------------------------ USING async await -------------------
  
   const countries=await checkVisited(); 

   res.render("index.ejs",{total:countries.length,countries:countries});

   /* ------------------------- USING CALLBACK-----------------------*/

  // const response=db.query("SELECT country_code FROM visited_countries",(err,dbres)=>{
  //   if(err){
  //     console.log("error running query",err.stack);
  //     }else{
  //       let countries=dbres.rows.map(row=>row.country_code);
  //       res.render("index.ejs",{
  //         total:countries.length,
  //         countries:countries,
  //       });
  //     }
  // });
});


app.post("/add",async(req,res)=>{
  const countries=await checkVisited();

  const input=req.body["country"];

  const result=await db.query("SELECT country_code FROM countries WHERE country_name ILIKE $1",[input]);

  if(result.rows.length!==0){
    const data=result.rows[0];
    const countryCode=data.country_code;

    const visited=await db.query("SELECT * FROM visited_countries WHERE country_code ILIKE $1",[countryCode]);

    if(visited.rows.length>0){
      return res.render("index.ejs",{
      total:countries.length,
      countries:countries,
      error:"Already visited add another country",
    });
    }
    
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countryCode]);
    res.redirect("/");

  }else{
    res.render("index.ejs",{
      total:countries.length,
      countries:countries,
      error:"Country not found. Add another country",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
