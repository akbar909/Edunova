import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';

export async function POST(
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

    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user can add lessons to this course
    if (session.user.role !== 'admin' && course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, videoUrl, notesUrl, order } = await req.json();

    if (!title || !videoUrl || order === undefined) {
      return NextResponse.json(
        { error: 'Title, video URL, and order are required' },
        { status: 400 }
      );
    }

    const lesson = await Lesson.create({
      title,
      videoUrl,
      notesUrl,
      courseId: params.id,
      order,
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}