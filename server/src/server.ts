import "dotenv/config";
import chatRoutes from "./routes/chat.routes.js";

import app from "./app.js";

const port = Number(process.env.PORT) || 5000;

app.use("/api/chat", chatRoutes);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
