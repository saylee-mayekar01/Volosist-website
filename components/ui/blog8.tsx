
import { ArrowRight } from "lucide-react";
import { Card } from "./card";
import { cn } from "../../lib/utils";

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
  tags?: string[];
}

interface Blog8Props {
  heading?: string;
  description?: string;
  posts?: Post[];
}

const Blog8 = ({
  heading = "Blog Posts",
  description = "Discover the latest insights and tutorials about modern web development, UI design, and component-driven architecture.",
  posts = [],
}: Blog8Props) => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 flex flex-col items-center gap-16">
        <div className="text-center max-w-3xl">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl uppercase">
            {heading}
          </h2>
          <p className="text-slate-500 font-medium md:text-lg">
            {description}
          </p>
        </div>

        <div className="grid gap-y-16 w-full max-w-6xl">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-0 bg-transparent shadow-none overflow-visible"
            >
              <div className="grid gap-y-8 sm:grid-cols-10 sm:gap-x-12 md:items-center">
                <div className="sm:col-span-5 flex flex-col">
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                      {post.tags?.map((tag) => <span key={tag} className="bg-blue-50 px-2 py-0.5 rounded">{tag}</span>)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 md:text-3xl tracking-tight leading-tight group">
                    <a
                      href={post.url}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-4 text-slate-500 font-medium leading-relaxed">
                    {post.summary}
                  </p>
                  <div className="mt-6 flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{post.author}</span>
                    <span className="text-slate-200">•</span>
                    <span>{post.published}</span>
                  </div>
                  <div className="mt-8 flex items-center">
                    <a
                      href={post.url}
                      className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-all group/link"
                    >
                      <span>Read more</span>
                      <ArrowRight className="ml-2 size-3 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </div>
                <div className="order-first sm:order-last sm:col-span-5">
                  <a href={post.url} className="block group/img">
                    <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 transition-all group-hover/img:-translate-y-1 group-hover/img:shadow-2xl">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                    </div>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Blog8 };
