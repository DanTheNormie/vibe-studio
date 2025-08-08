import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Vibe Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern UI builder that transforms your visual designs into clean, 
            production-ready React components through JSON schemas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎨</span>
                Visual Editor
              </CardTitle>
              <CardDescription>
                Drag and drop components to build your UI visually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📝</span>
                JSON Schema
              </CardTitle>
              <CardDescription>
                Structured data representation for UI components and logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚡</span>
                Live Preview
              </CardTitle>
              <CardDescription>
                Real-time rendering of your UI from JSON schemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">Active</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Get Started
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/preview">
                Try Live Preview
              </Link>
            </Button>
            <Button variant="outline" size="lg" disabled>
              Open Editor
              <Badge variant="secondary" className="ml-2">Soon</Badge>
            </Button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle>Architecture</CardTitle>
              <CardDescription>
                Built with modern technologies and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Next.js 15</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Zod Validation</Badge>
                <Badge variant="outline">shadcn/ui</Badge>
                <Badge variant="outline">React 18</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}