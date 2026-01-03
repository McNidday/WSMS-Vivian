const Service = require('../models/Service');

exports.getAllServices = async (req, res) => {
    const services = await Service.find();
    res.json(services);
};

exports.createService = async (req, res) => {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
};

exports.deleteService = async (req, res) => {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
};
