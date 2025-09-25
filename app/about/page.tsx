"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-english text-5xl md:text-6xl text-primary mb-4">
            About Us
          </h1>
          <div className="font-chinese text-2xl md:text-3xl text-foreground mb-8">
            关于我们
          </div>
          <div className="w-24 h-px bg-primary mx-auto"></div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
            <h2 className="font-english text-2xl text-foreground mb-6">
              Our Story
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Tekindar Restaurant represents the pinnacle of culinary
              excellence, where traditional flavors meet modern innovation. Our
              journey began with a simple vision: to create extraordinary dining
              experiences that celebrate the art of fine cuisine.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
            <h2 className="font-english text-2xl text-foreground mb-6">
              Our Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every dish is crafted with passion, using only the finest
              ingredients sourced from trusted suppliers. We believe in the
              harmony of flavors, the beauty of presentation, and the importance
              of creating memorable moments for our guests.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-block bg-primary/10 rounded-2xl p-8">
              <div className="font-chinese text-4xl text-primary mb-4">
                欢迎光临
              </div>
              <p className="font-english text-xl text-foreground">
                Welcome to Our Table
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
