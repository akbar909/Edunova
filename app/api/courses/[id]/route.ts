import { authOptions } from '@/lib/auth';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let course;
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      course = await Course.findOne({
        $or: [
          { _id: params.id },
          { slug: params.id }
        ]
      })
        .populate('instructorId', 'name')
        .populate('categoryId', 'name');
    } else {
      course = await Course.findOne({ slug: params.id })
        .populate('instructorId', 'name')
        .populate('categoryId', 'name');
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

    return NextResponse.json({ course, lessons });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

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

    await connectDB();

    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this course
    if (session.user.role !== 'admin' && course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await req.json();
    delete updates._id;
    delete updates.instructorId;

    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    )
      .populate('instructorId', 'name')
      .populate('categoryId', 'name');

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update course' },
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
    
    if (!session) {
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

    // Check if user can delete this course
    if (session.user.role !== 'admin' && course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete associated lessons
    await Lesson.deleteMany({ courseId: params.id });
    
    // Delete course
    await Course.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}