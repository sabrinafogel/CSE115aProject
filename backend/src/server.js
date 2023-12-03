const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const sql = neon(
  "postgresql://admin:cD9gTOm0oSGZ@ep-round-star-10362038.us-west-2.aws.neon.tech/cards-db?sslmode=require"
);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/newcourse", async (req, res) => {
  const { name, description, tags, email, editors, privacy } = req.body;
  if (!editors.includes(email)) {
    editors.push(email);
  }
  if (!name) {
    return res.status(400).send({ error: "Please enter a name." });
  }

  const chapters = JSON.stringify([
    {
      name: "Default Chapter",
      sets: [],
      chapterindex: 1,
    },
  ]);

  try {
    console.log("/newcourse post");
    await sql(
      "INSERT INTO courses(name, description, tags, email, chapters, editors, privacy) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [name, description, tags, email, chapters, editors, privacy]
    );
    return res.status(200).send({ message: "Course added successfully." });
  } catch (error) {
    console.error("Error adding document: ", error);
    return res.status(500).send({ error: "Failed to add course." });
  }
});

app.get("/mycourses", async (req, res) => {
  try {
    console.log("/mycourses fetch");
    const email = req.query.email;
    const result = JSON.stringify(
      await sql("SELECT * FROM courses WHERE email = $1", [email])
    );
    return res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return res.status(500).send({ error: "Failed to fetch courses." });
  }
});

app.get("/courses", async (req, res) => {
  const email = req.query.email;
  try {
    console.log("/course fetch");
    const result = JSON.stringify(await sql("SELECT * FROM courses WHERE privacy = false OR $1 = ANY(editors)", [email]));

    return res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching data: ", error);
    return res.status(500).send({ error: "Failed to fetch courses." });
  }
});

app.get("/courseinfo", async (req, res) => {
  const id = req.query.courseid;
  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [id]);

    return res.status(200).send(result[0]);
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return res.status(500).send({ error: "Failed to fetch course info." });
  }
});

app.post("/newchapter", async (req, res) => {
  const { courseid, name, description, tags} = req.body;

  if (!name) {
    return res.status(400).send({ error: "Please enter a name." });
  }

  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [courseid]);
    const chapter_field = result[0].chapters;

    const new_chapter = {
      name: name,
      description: description,
      sets: [],
      tags: tags,
      chapterindex: chapter_field.length + 1,
    };

    chapter_field.push(new_chapter);
    await sql("UPDATE courses SET chapters = $1 WHERE id = $2", [
      JSON.stringify(chapter_field),
      courseid,
    ]);
    return res.status(200).send({ message: "Chapter added successfully." });
  } catch (error) {
    console.error("Error adding field: ", error);
    return res.status(500).send({ error: "Failed to add chapter." });
  }
});

app.post("/newSet", async (req, res) => {
  const { id, index, name, description, cards } = req.body;
  const newSet = { name: name, description: description, cards: cards };

  if (!id) {
    return res.status(400).send({ error: "Please provide a document ID." });
  }
  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [id]);
    const chapter_field = result[0].chapters;
    const sets = chapter_field[index].sets;
    sets.push(newSet);
    await sql("UPDATE courses set chapters = $1 WHERE id = $2", [
      JSON.stringify(chapter_field),
      id,
    ]);
    return res.status(200).send({ message: "Course updated successfully." });
  } catch (error) {
    console.error("Error updating document: ", error);
    return res.status(500).send({ error: "Failed to update course." });
  }
});

// This handles the saving of an edited set by reading and overwriting the set that was changed
app.post("/editSet", async (req, res) => {
  const { id, index, setindex, name, description, cards } = req.body;
  const newSet = { name: name, description: description, cards: cards };
  console.log("/editSet fetch");
  if (!id) {
    return res.status(400).send({ error: "Please provide a document ID." });
  }

  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [id]);
    const chapter_field = result[0].chapters;
    chapter_field[index].sets[setindex] = newSet;
    await sql("UPDATE courses set chapters = $1 WHERE id = $2", [
      JSON.stringify(chapter_field),
      id,
    ]);
    return res.status(200).send({ message: "Course updated successfully." });
  } catch (error) {
    console.error("Error updating document: ", error);
    return res.status(500).send({ error: "Failed to update course." });
  }
});

// This deletes a specified set from the specified chapter by reading and returning a new array without the element to the db
app.post("/deleteSet", async (req, res) => {
  const { id, index, setindex } = req.body;
  console.log("/deleteSet fetch");
  if (!id) {
    return res.status(400).send({ error: "Please provide a document ID." });
  }

  try {
    // Reads in data from the db
    const result = await sql("SELECT * FROM courses WHERE id = $1", [id]);
    // Removes the set specified from the chapters set array
    result[0].chapters[index].sets.splice(setindex, 1);
    // Updates the course changes in the db
    await sql("UPDATE courses SET chapters = $1 WHERE id = $2", [
      JSON.stringify(result[0].chapters),
      id,
    ]);
    // Return an ok status
    return res.status(200).send({ message: "Course updated successfully." });
  } catch (error) {
    // Display error in console
    console.error("Error updating document: ", error);
    // Return error status
    return res.status(500).send({ error: "Failed to update course." });
  }
});

app.post("/editCourse", async (req, res) => {
  const { id, name, description, course_tags } = req.body;
  console.log("/editCourse fetch");

  try {
    await sql("UPDATE courses SET name = $1, description = $2 WHERE id = $3", [
      name,
      description || "",
      id,
    ]);
    return res.status(200).send({ message: "course edited successfully" });
  } catch (err) {
    console.log("Error writing or reading file:", err);
  }
});

app.post("/editChapter", async (req, res) => {
  const { id, index, name, description } = req.body;
  console.log("/editChapter fetch");

  if (!id) {
    return res.status(400).send({ error: "Please provide a document ID." });
  }

  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [id]);

    const newChapter = {
      name: name,
      description: description,
      sets: result[0].chapters[index].sets,
    };
    result[0].chapters[index] = newChapter;

    await sql("UPDATE courses SET chapters = $1 WHERE id = $2", [
      JSON.stringify(result[0].chapters),
      id,
    ]);

    return res.status(200).send({ message: "Course updated successfully." });
  } catch (error) {
    console.error("Error updating document: ", error);
    return res.status(500).send({ error: "Failed to update course." });
  }
});

app.get("/searchchapter", async (req, res) => {
  const id = req.query.courseid;
  const search = req.query.search;

  try {
    const chapters_query = await sql("SELECT chapters FROM courses WHERE id = $1", [id]);
    const chapters = chapters_query[0].chapters;
    const searchChapters = [];
    
    for (let i = 0; i < chapters.length; i++){
      if (((chapters[i].name).toLowerCase()).startsWith(search.toLowerCase())){
        searchChapters.push(chapters[i]);
      }

      if (typeof chapters[i].tags !== 'undefined'){
        const chapter_tags = (chapters[i].tags).map(element => {
          return element.toLowerCase();
        });

        const stat = chapter_tags.find(entry => entry.startsWith(search.toLowerCase()));
        if (stat !== undefined && searchChapters.indexOf(chapters[i]) === -1){
          searchChapters.push(chapters[i]);
        }

      }
      else {
        //console.log("tags array does not exist in chapter");
      }


    }
    console.log("/searchchapter fetch");
    return res
      .status(200)
      .send({ chapters: searchChapters });
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return res.status(500).send({ error: "Failed to fetch chapter info." });
  }
});

app.post("/editPrivacy", async(req, res) => {
  const {id, privacy} = req.body;
  console.log("/editPrivacy fetch");

  try {
    await sql("UPDATE courses SET privacy = $1 WHERE id = $2", [
      privacy,
      id,
    ]);
    return res.status(200).send({ message: "privacy updated successfully" });
  } catch (err) {
    console.log("Error writing or reading file:", err);
  }

});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));
