const app = require("./app");
const { PORT } = require("./config/config");

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
const express = require("express");
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.static(
  path.join(__dirname, "../../frontend")
));