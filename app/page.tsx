import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { BookOpen, Users, Award, Video, Download, BarChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Learn Without
            <span className="text-primary"> Limits</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of students and instructors on our comprehensive e-learning platform. 
            Create, learn, and grow with expert-led courses and interactive content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="px-8 py-3 text-lg">
                Browse Courses
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features needed for effective online learning and teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">HD Video Streaming</CardTitle>
                <CardDescription className="text-muted-foreground">
                  High-quality video lessons with seamless streaming and progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-green-500/10 p-3 rounded-lg w-fit">
                  <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-foreground">Downloadable Resources</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Access course materials, notes, and resources even when offline.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-purple-500/10 p-3 rounded-lg w-fit">
                  <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-foreground">Progress Tracking</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Monitor your learning journey with detailed progress analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-orange-500/10 p-3 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-foreground">Expert Instructors</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Learn from industry professionals and certified educators.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-red-500/10 p-3 rounded-lg w-fit">
                  <Award className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-foreground">Certificates</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Earn certificates upon course completion to boost your career.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="bg-teal-500/10 p-3 rounded-lg w-fit">
                  <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-foreground">Diverse Catalog</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Explore thousands of courses across various subjects and skill levels.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join our community of learners and instructors today. Sign up for free and explore our vast course catalog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-primary-foreground ">
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduPlatform</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 EduPlatform. All rights reserved. Empowering education worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}