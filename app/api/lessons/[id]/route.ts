import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/lib/models/Lesson';
import Course from '@/lib/models/Course';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const lesson = await Lesson.findById(params.id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this lesson
    const course = await Course.findById(lesson.courseId);
    if (session.user.role !== 'admin' && course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await req.json();
    delete updates._id;
    delete updates.courseId;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    );

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const lesson = await Lesson.findById(params.id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this lesson
    const course = await Course.findById(lesson.courseId);
    if (session.user.role !== 'admin' && course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await Lesson.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}