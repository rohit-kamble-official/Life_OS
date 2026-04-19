import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['7day_coding', '21day_discipline', '30day_transformation'],
    required: true
  },
  name: { type: String, required: true },
  durationDays: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  strictMode: { type: Boolean, default: true },
  completedDays: [{ type: String }], // Array of YYYY-MM-DD strings
  missedDays: [{ type: String }],
  totalDaysCompleted: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Challenge', challengeSchema);
