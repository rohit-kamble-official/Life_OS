import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['coding', 'study', 'fitness', 'personal_growth'],
    default: 'personal_growth'
  },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  date: { type: String, required: true }, // YYYY-MM-DD
  xpEarned: { type: Number, default: 0 },
  proofFile: {
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String }
  },
  // For coding category
  codingHours: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

taskSchema.index({ user: 1, date: 1 });

export default mongoose.model('Task', taskSchema);
