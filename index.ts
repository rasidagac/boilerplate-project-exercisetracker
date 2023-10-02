import express, { Request, Response } from "express";
import cors from "cors";
import { AddressInfo } from "net";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import users from "./server/routes/users";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/users", users);

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  const addressInfo = listener.address();

  function isAddressInfo(
    addressInfo: string | AddressInfo | null,
  ): addressInfo is AddressInfo {
    return (addressInfo as AddressInfo).port !== undefined;
  }

  if (isAddressInfo(addressInfo)) {
    console.log("Your app is listening on port ", addressInfo.port);
  }
});
