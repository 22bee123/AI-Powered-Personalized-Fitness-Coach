import mongoose from 'mongoose';

const coachAIChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userMessage: {
    type: String,
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CoachAIChat = mongoose.model('CoachAIChat', coachAIChatSchema);

export default CoachAIChat;