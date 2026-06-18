const Character = require('../models/Character');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get all characters
exports.getAllCharacters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const characters = await Character.find()
      .populate('createdBy', 'username email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Character.countDocuments();

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      characters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single character
exports.getCharacterById = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    res.json({
      success: true,
      character
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create character
exports.createCharacter = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      species,
      status,
      gender,
      origin,
      location,
      description,
      episodes,
      traits
    } = req.body;

    // Check if character already exists
    const existingCharacter = await Character.findOne({ name });
    if (existingCharacter) {
      return res.status(409).json({
        success: false,
        message: 'Character with this name already exists'
      });
    }

    const character = new Character({
      name,
      species,
      status,
      gender,
      origin: origin ? JSON.parse(origin) : {},
      location: location ? JSON.parse(location) : {},
      description,
      episodes: episodes ? JSON.parse(episodes) : [],
      traits: traits ? JSON.parse(traits) : [],
      createdBy: req.user._id
    });

    await character.save();

    res.status(201).json({
      success: true,
      message: 'Character created successfully',
      character
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update character
exports.updateCharacter = async (req, res) => {
  try {
    let character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if user is the creator or admin
    if (character.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this character'
      });
    }

    const allowedFields = ['name', 'species', 'status', 'gender', 'origin', 'location', 'description', 'episodes', 'traits'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    character = await Character.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Character updated successfully',
      character
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete character
exports.deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if user is the creator or admin
    if (character.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this character'
      });
    }

    // Delete image if exists
    if (character.image && character.image.filename) {
      const imagePath = path.join(process.env.UPLOAD_PATH || './uploads/characters', character.image.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Character.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload character image
exports.uploadCharacterImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const character = await Character.findById(req.params.id);

    if (!character) {
      // Delete uploaded file if character not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if user is the creator or admin
    if (character.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this character'
      });
    }

    // Delete old image if exists
    if (character.image && character.image.filename) {
      const oldImagePath = path.join(process.env.UPLOAD_PATH || './uploads/characters', character.image.filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update character with new image
    character.image = {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await character.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      character
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
