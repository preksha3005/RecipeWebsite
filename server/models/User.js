import mongoose from "mongoose";
const RegSchema = new mongoose.Schema({
  name: { type: String, required:true },
  email: { type: String, unique: true, required:true },
  password: String,
  createdAt: Date
}
);
// const User = mongoose.model("User", RegSchema);
// module.exports = User;

export default mongoose.model('User', RegSchema);