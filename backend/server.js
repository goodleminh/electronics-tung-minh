import app from "./src/app.js";
import "dotenv/config";
import sequelize from "./src/config/dbConnection.js";

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Connected database success");
  } catch (error) {
    console.log("Connected fail", error);
  }
});
