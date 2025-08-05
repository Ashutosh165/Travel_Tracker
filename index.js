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

  const input=req.body["country"];
  try{
    const result=await db.query("SELECT country_code FROM countries WHERE country_name ILIKE $1",[input]);
    
      const data=result.rows[0];
      const countryCode=data.country_code;
      
      try {
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countryCode]);
        res.redirect("/");
      } catch (err) {
        const countries=await checkVisited();
        console.log(err);
        res.render("index.ejs",{
          error:"Country already added",
          countries:countries,
          total:countries.length,
        });
      }
  }catch(err){
      console.log(err);
      const countries=await checkVisited();
      res.render("index.ejs",{
      error:"Country not found",
      total:countries.length,
      countries:countries,
    });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
