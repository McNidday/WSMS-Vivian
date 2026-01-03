import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
});
const About = mongoose.models.About || mongoose.model("About", aboutSchema);
export default About;

