const pasteService = require('../services/paste.service');

exports.createPaste = async (req, res) => {
    const result = await pasteService.create(req.body);
    res.status(201).json(result);
};

exports.getPaste = async (req, res) => {
    const paste = await pasteService.get(req.params.id);
    res.json(paste);
};
