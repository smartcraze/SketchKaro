import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Play, ArrowRight, Users, Zap, Palette } from 'lucide-react';
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gray-900">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10">
           
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 border-blue-200 hover:scale-105 transition-transform duration-200">
            <Zap className="w-4 h-4 mr-2" />
            Real-time Collaboration Platform
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Create, Collaborate,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
              Innovate Together
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The most intuitive canvas for visual collaboration. Draw, sketch, and brainstorm with your team in real-time, anywhere in the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="default"
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg font-semibold border-2  transform hover:scale-105 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
              <div className="text-sm text-gray-600">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">50M+</div>
              <div className="text-sm text-gray-600">Drawings Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Untitled Canvas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    A
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    B
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    C
                  </div>
                </div>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Interactive Canvas Preview</p>
                <p className="text-sm text-gray-400">Real-time collaboration in action</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}