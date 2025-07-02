'use client';

import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchCategories,
  fetchCourses,
  selectFilteredCourses,
  setCourseType,
  setSearchTerm,
  setSelectedCategory,
} from '../../store/coursesSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const {
    categories,
    loading,
    searchTerm,
    selectedCategory,
    courseType,
  } = useAppSelector((state) => state.courses);

  // Use selector for filtered courses
  const filteredCourses = useSelector(selectFilteredCourses);

  // Fetch categories only once on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch courses on mount and when filters change
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch, selectedCategory, courseType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Catalog</h1>
          <p className="text-muted-foreground">Explore our comprehensive collection of courses</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="pl-10"
            />
          </div>

          <Select onValueChange={setSelectedCategory} defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setCourseType} defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow duration-300 border-border">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.isPaid ? "default" : "secondary"}>
                      {course.isPaid ? `$${course.price}` : 'Free'}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-foreground">{course.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    by {course.instructorId.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                      {course.categoryId.name}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <Link href={`/courses/${course.slug}`}>
                    <Button className="w-full">
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}