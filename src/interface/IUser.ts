import mongoose, { Document } from "mongoose";

export interface IUser extends Document<mongoose.Types.ObjectId> {
  name: string;
  email: string;
  user_ID: string;
  password: string;
  avatar?: string;
  refreshToken?: string | null;
  created_AT: Date;
  updated_AT: Date;
}

export interface IUserInputDTO {
  user_ID: string;
  name?: string;
  email: string;
  password: string;
  avatar?: string;
  team?: string;
  refreshToken?: string;
  created_AT?: Date;
  updated_AT?: Date;
}

// export interface userUniqueSearchInput {
//   email: string;
// }