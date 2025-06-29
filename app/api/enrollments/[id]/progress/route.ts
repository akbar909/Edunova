import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/lib/models/Enrollment';
import Lesson from '@/lib/models/Lesson';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { lessonId, completed } = await req.json();

    if (!lessonId || completed === undefined) {
      return NextResponse.json(
        { error: 'Lesson ID and completion status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const enrollment = await Enrollment.findById(params.id);

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if user owns this enrollment
    if (enrollment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all lessons for this course to calculate progress
    const allLessons = await Lesson.find({ courseId: enrollment.courseId });
    const totalLessons = allLessons.length;

    let updatedCompletedLessons = [...enrollment.completedLessons];

    if (completed && !updatedCompletedLessons.includes(lessonId)) {
      // Add lesson to completed list
      updatedCompletedLessons.push(lessonId);
    } else if (!completed && updatedCompletedLessons.includes(lessonId)) {
      // Remove lesson from completed list
      updatedCompletedLessons = updatedCompletedLessons.filter(id => id !== lessonId);
    }

    // Calculate new progress percentage
    const newProgress = totalLessons > 0 ? Math.round((updatedCompletedLessons.length / totalLessons) * 100) : 0;

    // Update enrollment
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      params.id,
      {
        completedLessons: updatedCompletedLessons,
        progress: newProgress,
        completedAt: newProgress === 100 ? new Date() : null,
      },
      { new: true }
    );

    return NextResponse.json({ enrollment: updatedEnrollment });
  } catch (error) {
    console.error('Failed to update progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}