import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const instructor = searchParams.get('instructor');
    const featured = searchParams.get('featured');

    let query: any = {};

    if (category && category !== 'all') {
      query.categoryId = category;
    }

    if (type === 'free') {
      query.isPaid = false;
    } else if (type === 'paid') {
      query.isPaid = true;
    }

    if (instructor) {
      query.instructorId = instructor;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const courses = await Course.find(query)
      .populate('instructorId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role === 'instructor' && !session.user.isApproved) {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    const { title, description, thumbnail, isPaid, price, categoryId } = await req.json();

    if (!title || !description || !thumbnail || !categoryId) {
      return NextResponse.json(
        { error: 'Title, description, thumbnail, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const course = await Course.create({
      title,
      description,
      thumbnail,
      isPaid: isPaid || false,
      price: isPaid ? price : 0,
      instructorId: session.user.id,
      categoryId,
      slug,
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructorId', 'name')
      .populate('categoryId', 'name');

    return NextResponse.json({ course: populatedCourse }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}