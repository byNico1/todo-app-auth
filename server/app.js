const PORT = process.env.PORT ?? 8000;
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db/pool.js";
import asyncHandler from "express-async-handler";

const app = express();

app.use(cors());
app.use(express.json());

// add new todo
app.post(
  "/todos",
  asyncHandler(async (req, res) => {
    const { user_email, title, progress, date } = req.body;
    const newToDo = await pool.query(
      `INSERT INTO todos (user_email, title, progress, date) VALUES($1, $2, $3, $4)`,
      [user_email, title, progress, date]
    );
    res.json(newToDo);
  })
);

// get all todos for user by userEmail
app.get(
  "/todos/:userEmail",
  asyncHandler(async (req, res) => {
    const { userEmail } = req.params;
    const todos = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [userEmail]
    );
    res.json(todos.rows);
  })
);

// delete a todo
app.delete(
  "/todos/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleteToDo = await pool.query("DELETE FROM todos WHERE id = $1;", [
      id,
    ]);
    res.json(deleteToDo);
  })
);

// edit a todo
app.put(
  "/todos/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;
    const editToDo = await pool.query(
      "UPDATE todos SET user_email =$1, title = $2, progress = $3, date = $4 WHERE id = $5;",
      [user_email, title, progress, date, id]
    );
    res.json(editToDo);
  })
);

//sign up
app.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const signUp = await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
      [email, hashedPassword]
    );

    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });

    const error = signUp.name === "error";

    if (!error) {
      res.json({ email, token });
    } else {
      res.json({ detail: signUp.detail });
    }
  })
);

//login
app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const users = await pool.query("SELECT * FROM users WHERE email = $1;", [
      email,
    ]);

    if (!users.rows.length) return res.json({ detail: "User does not exist" });

    const success = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );
    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });

    if (success) {
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});

app.listen(PORT, () => `Server running on PORT ${PORT}`);
