import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  friend_email: { type: String, default: '' },
  parent_email: { type: String, default: '' },
  friend_whatsapp: { type: String, default: '' },
  parent_whatsapp: { type: String, default: '' },

  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: String, default: 'Beginner' },
  badges: [{ type: String }],
  totalCompleted: { type: Number, default: 0 },
  totalMissed: { type: Number, default: 0 },

  // Streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLevel = function () {
  if (this.xp >= 500) this.level = 'Legend';
  else if (this.xp >= 200) this.level = 'Warrior';
  else this.level = 'Beginner';
};

userSchema.methods.checkBadges = function () {
  const newBadges = [];
  if (this.totalCompleted >= 1 && !this.badges.includes('first_task')) newBadges.push('first_task');
  if (this.totalCompleted >= 10 && !this.badges.includes('ten_tasks')) newBadges.push('ten_tasks');
  if (this.totalCompleted >= 50 && !this.badges.includes('fifty_tasks')) newBadges.push('fifty_tasks');
  if (this.currentStreak >= 7 && !this.badges.includes('week_streak')) newBadges.push('week_streak');
  if (this.currentStreak >= 21 && !this.badges.includes('legend_streak')) newBadges.push('legend_streak');
  if (this.xp >= 200 && !this.badges.includes('warrior')) newBadges.push('warrior');
  if (this.xp >= 500 && !this.badges.includes('legend')) newBadges.push('legend');
  this.badges.push(...newBadges);
  return newBadges;
};

export default mongoose.model('User', userSchema);
