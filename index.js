import express from "express";
// handles HTTP requests
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// uses express to make my CSS file accessible
app.use(express.static("styles"));
// reads data and puts it in a form
app.use(express.urlencoded({ extended: true }));
// turns ejs into html
app.set("view engine", "ejs");

// Combines strIngredient1-15 and strMeasure1-15 into a clean list
function getIngredients(drink) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      // combines ingredients to a single string (thanks google)
      ingredients.push(`${measure ? measure.trim() : ""} ${ingredient}`.trim());
    }
  }
  return ingredients;
}

// Home page with the dropdown form
app.get("/", (req, res) => {
  // fills in ejs file and sends html
  res.render("index.ejs", { error: null });
});

// Handles the form submission
app.post("/pick", async (req, res) => {
  // reads the chosen type out of the two dropdown menus (alcoholic or non-alcoholic)
  const type = req.body.type;

  try {
    //list of drinks depending on alcolic or non-alcoholic
    const listResponse = await axios.get(`${API_URL}/filter.php`, {
      params: { a: type },
    });
    // data is JSON and drinks is an array of drink objects
    const drinks = listResponse.data.drinks;
    // check if the list of drinks is valid
    if (!Array.isArray(drinks) || drinks.length === 0) {
      return res.render("index.ejs", {
        error: "No cocktails found. Please try again.",
      });
    }

    // pick drink at random
    const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];

    // finds recipe using the chosen drink's ID
    const detailResponse = await axios.get(`${API_URL}/lookup.php`, {
      params: { i: randomDrink.idDrink },
    });
    // since the explanation is in the drinks array, it just picks the details
    const drink = detailResponse.data.drinks[0];
    // render the result page with the drink and its ingredients
    res.render("result.ejs", { drink, ingredients: getIngredients(drink) });
    // log any errors i.e network error, connection, etc.
  } catch (error) {
    console.error(error.message);
    res.render("index.ejs", {
      error: "Something went wrong. Please try again.",
    });
  }
});
// starts the server on local host!!!
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});