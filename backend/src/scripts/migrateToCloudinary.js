require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Models
const Animal = require('../models/Animal.model');
const Event = require('../models/Event.model');
const Photo = require('../models/Photo.model');
const Product = require('../models/Product.model');
const GroupBookingRequest = require('../models/GroupBookingRequest.model');
const Inquiry = require('../models/Inquiry.model');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

async function uploadToCloudinary(localPath, folder) {
  if (!fs.existsSync(localPath)) {
    console.warn(`File not found: ${localPath}`);
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: `zoo-management/${folder}`,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Failed to upload ${localPath}:`, err.message);
    return null;
  }
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Animals
    const animals = await Animal.find({ imageUrl: /^\/uploads/ });
    console.log(`Found ${animals.length} animals to migrate`);
    for (const animal of animals) {
      const localPath = path.join(UPLOADS_DIR, animal.imageUrl.replace('/uploads/', ''));
      const url = await uploadToCloudinary(localPath, 'animals');
      if (url) {
        animal.imageUrl = url;
        await animal.save();
        console.log(`Migrated animal: ${animal.name}`);
      }
    }

    // 2. Events
    const events = await Event.find({ imageUrl: /^\/uploads/ });
    console.log(`Found ${events.length} events to migrate`);
    for (const event of events) {
      const localPath = path.join(UPLOADS_DIR, event.imageUrl.replace('/uploads/', ''));
      const url = await uploadToCloudinary(localPath, 'events');
      if (url) {
        event.imageUrl = url;
        await event.save();
        console.log(`Migrated event: ${event.title}`);
      }
    }

    // 3. Photos
    const photos = await Photo.find({ imageUrl: /^\/uploads/ });
    console.log(`Found ${photos.length} photos to migrate`);
    for (const photo of photos) {
      const localPath = path.join(UPLOADS_DIR, photo.imageUrl.replace('/uploads/', ''));
      const url = await uploadToCloudinary(localPath, 'photos');
      if (url) {
        photo.imageUrl = url;
        await photo.save();
        console.log(`Migrated photo: ${photo._id}`);
      }
    }

    // 4. Products
    const products = await Product.find({ images: /^\/uploads/ });
    console.log(`Found ${products.length} products to migrate`);
    for (const product of products) {
      const newImages = [];
      for (const img of product.images) {
        if (img.startsWith('/uploads/')) {
          const localPath = path.join(UPLOADS_DIR, img.replace('/uploads/', ''));
          const url = await uploadToCloudinary(localPath, 'products');
          newImages.push(url || img);
        } else {
          newImages.push(img);
        }
      }
      product.images = newImages;
      await product.save();
      console.log(`Migrated product: ${product.name}`);
    }

    // 5. Inquiries
    const inquiries = await Inquiry.find({ imageUrl: /^\/uploads/ });
    console.log(`Found ${inquiries.length} inquiries to migrate`);
    for (const inquiry of inquiries) {
      const localPath = path.join(UPLOADS_DIR, inquiry.imageUrl.replace('/uploads/', ''));
      const url = await uploadToCloudinary(localPath, 'feedback');
      if (url) {
        inquiry.imageUrl = url;
        await inquiry.save();
        console.log(`Migrated inquiry: ${inquiry._id}`);
      }
    }

    // 6. Group Booking Documents
    const groupRequests = await GroupBookingRequest.find({ 'supportingDocument.storedPath': /^\/uploads/ });
    console.log(`Found ${groupRequests.length} group booking requests to migrate`);
    for (const req of groupRequests) {
      const localPath = path.join(UPLOADS_DIR, req.supportingDocument.storedPath.replace('/uploads/', ''));
      const url = await uploadToCloudinary(localPath, 'ticket-show-group-letters');
      if (url) {
        req.supportingDocument.storedPath = url;
        await req.save();
        console.log(`Migrated group request: ${req.requestCode}`);
      }
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
