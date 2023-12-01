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
  const { name, description, tags, email, editors } = req.body;
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
    },
  ]);

  try {
    console.log("/newcourse post");
    await sql(
      "INSERT INTO courses(name, description, tags, email, chapters, editors) VALUES($1, $2, $3, $4, $5, $6)",
      [name, description, tags, email, chapters, editors]
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
  try {
    console.log("/course fetch");
    const result = JSON.stringify(await sql("SELECT * FROM courses"));
    //console.log(result);
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
    //console.log(result);
    return res.status(200).send(result[0]);
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return res.status(500).send({ error: "Failed to fetch course info." });
  }
});

app.post("/newchapter", async (req, res) => {
  const { courseid, name, description } = req.body;

  if (!name) {
    return res.status(400).send({ error: "Please enter a name." });
  }

  const new_chapter = {
    name: name,
    description: description,
    sets: [],
  };

  try {
    const result = await sql("SELECT * FROM courses WHERE id = $1", [courseid]);
    const chapter_field = result[0].chapters;
    console.log(chapter_field);
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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));

// ... rest of your routes ...

// app.get("/mycourses", async (req, res) => {
//   try {
//     console.log("/mycourses fetch");
//     const email = req.query.email;
//     const snapshot = await db
//       .collection("courses")
//       .where("email", "==", email)
//       .get();
//     const courses = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     return res.status(200).send(courses);
//   } catch (error) {
//     console.error("Error fetching documents: ", error);
//     return res.status(500).send({ error: "Failed to fetch courses." });
//   }
// });

// app.get("/courses", async (req, res) => {
//   try {
//     console.log("/courses fetch");
//     const snapshot = await db.collection("courses").get();
//     const courses = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     return res.status(200).send(courses);
//   } catch (error) {
//     console.error("Error fetching documents: ", error);
//     return res.status(500).send({ error: "Failed to fetch courses." });
//   }
// });

// app.get("/courseinfo", async (req, res) => {
//   try {
//     const ref = db.collection("courses").doc(req.query.courseid);
//     const doc = await ref.get();
//     console.log("/courseinfo fetch");
//     //console.log(doc.data().chapters[1].name);
//     return res
//       .status(200)
//       .send({ name: doc.data().name, chapters: doc.data().chapters });
//   } catch (error) {
//     console.error("Error fetching documents: ", error);
//     return res.status(500).send({ error: "Failed to fetch course info." });
//   }
// });

// app.post("/newchapter", async (req, res) => {
//   const { courseid, name, description } = req.body;

//   if (!name) {
//     return res.status(400).send({ error: "Please enter a name." });
//   }

//   const new_chapter = {
//     name: name,
//     description: description,
//     sets: [],
//   };

//   try {
//     const ref = db.collection("courses").doc(courseid);
//     const doc = await ref.get();
//     const chapter_field = doc.data().chapters;
//     chapter_field.push(new_chapter);
//     await db
//       .collection("courses")
//       .doc(courseid)
//       .update({ chapters: chapter_field });
//     return res.status(200).send({ message: "Chapter added successfully." });
//   } catch (error) {
//     console.error("Error adding field: ", error);
//     return res.status(500).send({ error: "Failed to add chapter." });
//   }
// });

// app.post("/newSet", async (req, res) => {
//   const { id, index, name, description, cards } = req.body;
//   const newSet = { name: name, description: description, cards: cards };

//   if (!id) {
//     return res.status(400).send({ error: "Please provide a document ID." });
//   }

//   try {
//     const courseRef = db.collection("courses").doc(id);
//     const doc = await courseRef.get();
//     const courseData = doc.data();
//     courseData.chapters[index].sets.push(newSet);
//     await courseRef.update(courseData);
//     return res.status(200).send({ message: "Course updated successfully." });
//   } catch (error) {
//     console.error("Error updating document: ", error);
//     return res.status(500).send({ error: "Failed to update course." });
//   }
// });

// // This handles the saving of an edited set by reading and overwriting the set that was changed
// app.post("/editSet", async (req, res) => {
//   const { id, index, setindex, name, description, cards } = req.body;
//   const newSet = { name: name, description: description, cards: cards };
//   console.log("/editSet fetch");
//   if (!id) {
//     return res.status(400).send({ error: "Please provide a document ID." });
//   }

//   try {
//     const courseRef = db.collection("courses").doc(id);
//     const doc = await courseRef.get();
//     const courseData = doc.data();
//     courseData.chapters[index].sets[setindex] = newSet;
//     await courseRef.update(courseData);
//     return res.status(200).send({ message: "Course updated successfully." });
//   } catch (error) {
//     console.error("Error updating document: ", error);
//     return res.status(500).send({ error: "Failed to update course." });
//   }
// });

// // This deletes a specified set from the specified chapter by reading and returning a new array without the element to the db
// app.post("/deleteSet", async (req, res) => {
//   const { id, index, setindex } = req.body;
//   console.log("/deleteSet fetch");
//   if (!id) {
//     return res.status(400).send({ error: "Please provide a document ID." });
//   }

//   try {
//     // Reads in data from the db
//     const courseRef = db.collection("courses").doc(id);
//     const doc = await courseRef.get();
//     const courseData = doc.data();
//     // Removes the set specified from the chapters set array
//     courseData.chapters[index].sets.splice(setindex, 1);
//     // Updates the course changes in the db
//     await courseRef.update(courseData);
//     // Return an ok status
//     return res.status(200).send({ message: "Course updated successfully." });
//   } catch (error) {
//     // Display error in console
//     console.error("Error updating document: ", error);
//     // Return error status
//     return res.status(500).send({ error: "Failed to update course." });
//   }
// });

// app.post("/editChapter", async (req, res) => {
//   const { id, index, name, description } = req.body;
//   console.log("/editChapter fetch");

//   if (!id) {
//     return res.status(400).send({ error: "Please provide a document ID." });
//   }

//   try {
//     const courseRef = db.collection("courses").doc(id);
//     const doc = await courseRef.get();
//     const courseData = doc.data();
//     const newChapter = {
//       name: name,
//       description: description,
//       sets: courseData.chapters[index].sets,
//     };

//     courseData.chapters[index] = newChapter;
//     await courseRef.update(courseData);
//     return res.status(200).send({ message: "Course updated successfully." });
//   } catch (error) {
//     console.error("Error updating document: ", error);
//     return res.status(500).send({ error: "Failed to update course." });
//   }
// });

// const port = process.env.PORT || 8080;
// app.listen(port, () => console.log(`Server is running on port ${port}`));
