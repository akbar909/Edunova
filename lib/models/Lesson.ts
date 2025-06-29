import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  videoUrl: string;
  notesUrl?: string;
  courseId: mongoose.Types.ObjectId;
  order: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  notesUrl: {
    type: String,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in seconds
  },
}, {
  timestamps: true,
});

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);