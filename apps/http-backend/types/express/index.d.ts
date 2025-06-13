// types/express/index.d.ts

import { Request } from "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}
