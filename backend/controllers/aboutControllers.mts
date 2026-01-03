import About from "../models/about.mjs";
import { Request, Response } from "express";
export default {
  getAllAbouts: async (req: Request, res: Response) => {
    try {
      const abouts = await About.find();
      res.json(abouts);
    } catch (error) {
      console.error("Error fetching abouts:", error);
      res.status(500).json({ message: "Failed to get about entries", error });
    }
  },
  createAbout: async (req: Request, res: Response) => {
    try {
      const about = new About(req.body);
      await about.save();
      res.status(201).json(about);
    } catch (error) {
      console.error("Error creating about:", error);
      res.status(500).json({ message: "Failed to create about entry", error });
    }
  },
  getAbout: async (req: Request, res: Response) => {
    try {
      const about = await About.findById(req.params.id);
      if (!about) {
        return res.status(404).json({ message: "About entry not found" });
      }
      res.json(about);
    } catch (error) {
      console.error("Error fetching about entry:", error);
      res.status(500).json({ message: "Failed to get about entry", error });
    }
  },
  updateAbout: async (req: Request, res: Response) => {
    try {
      const about = await About.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!about) {
        return res.status(404).json({ message: "About entry not found" });
      }
      res.json(about);
    } catch (error) {
      console.error("Error updating about entry:", error);
      res.status(500).json({ message: "Failed to update about entry", error });
    }
  },
  deleteAbout: async (req: Request, res: Response) => {
    try {
      const about = await About.findByIdAndDelete(req.params.id);
      if (!about) {
        return res.status(404).json({ message: "About entry not found" });
      }
      res.json({ message: "About entry deleted" });
    } catch (error) {
      console.error("Error deleting about entry:", error);
      res.status(500).json({ message: "Failed to delete about entry", error });
    }
  }
};