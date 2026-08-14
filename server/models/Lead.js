import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      trim: true,
      default: 'Website'
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'converted'],
        message: 'Status must be either new, contacted, or converted'
      },
      default: 'new',
      lowercase: true
    },
    notes: [noteSchema]
  },
  {
    timestamps: true
  }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
