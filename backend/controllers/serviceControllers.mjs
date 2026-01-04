import Service from "../models/service.mjs";

export default {
  getAllServices: async (req, res) => {
    try {
      const services = await Service.find();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to get services", error });
    }
  },
  createService: async (req, res) => {
    try {
      const service = new Service(req.body);
      await service.save();
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service", error });
    }
  },
  getService: async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to get service", error });
    }
  },
  updateService: async (req, res) => {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service", error });
    }
  },
  deleteService: async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json({ message: "Service deleted" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service", error });
    }
  }
};
