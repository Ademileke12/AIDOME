import InteractiveMascot from './InteractiveMascot';

export default function Footer() {
  // Creator profile image
  const creatorImage = 'https://i.ibb.co/Y4Hght08/pfp.png';
  
  return (
    <footer className="pt-24 pb-12 border-t border-theme mt-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
      {/* Contact Me Section */}
      <div className="mb-16">
        <div className="glass-panel rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-3xl mx-auto border border-theme hover:border-theme-strong transition-all duration-500 group">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-3 sm:mb-4 leading-tight">
            One-on-One <span className="font-serif italic text-theme-secondary">Learning</span>
          </h3>
          <p className="text-theme-secondary text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Want to dive deep into a specialized aspect of AI? Book a personalized learning session with me. 
            Tailored guidance, hands-on practice, and expert insights.
          </p>
          <a
            href="https://wa.me/2349018873250"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-theme-elevated hover:bg-theme-elevated border border-theme-strong hover:border-theme-strong rounded-full transition-all duration-300 group-hover:scale-105 text-sm sm:text-base"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="font-medium whitespace-nowrap">Contact me on WhatsApp</span>
          </a>
          <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-theme-tertiary">
            Paid sessions • Flexible scheduling • Expert guidance
          </p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-12 editorial-card rounded-3xl p-8 mb-16 relative overflow-hidden group">
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-0" />
        
        {/* Left: Bio info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 z-10 max-w-2xl text-center sm:text-left">
          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-full border border-theme overflow-hidden shadow-2xl relative">
            <img 
              src={creatorImage} 
              alt="Creator Avatar" 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight mb-4 text-theme-primary">
              <span className="font-serif italic text-theme-secondary block mb-1 tracking-normal">Built by</span>
              anakincoco
            </h3>
            <p className="text-sm font-sans text-theme-secondary leading-relaxed text-balance">
              Frontend Dev and game developer. vibe coder. Educating through Writing. AI/ Digital Token User. Anime lover. Building 
              <a href="https://twitter.com/examfever_" target="_blank" rel="noreferrer" className="mx-1 text-theme-primary hover-theme-secondary transition-colors border-b border-theme">
                @examfever_
              </a> 
              nd CADI.
            </p>
          </div>
        </div>

        {/* Right: Interactive Mascot */}
        <div className="z-10 bg-theme-elevated border border-theme p-8 rounded-2xl shrink-0 hidden md:flex items-center justify-center">
          <InteractiveMascot className="w-32 h-32 text-theme-primary" />
        </div>
      </div>

      {/* Copyright */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 editable-label">
          <span>© 2026 AI dome Gallery</span>
          <span className="hidden md:inline text-theme-tertiary">|</span>
          <span>By anakincoco</span>
        </div>
        <div className="flex gap-6">
          <a 
            href="https://x.com/anakincoco" 
            target="_blank"
            rel="noopener noreferrer"
            className="editable-label hover-theme-primary transition-colors"
          >
            Twitter
          </a>
          <a 
            href="#" 
            className="editable-label hover-theme-primary transition-colors"
          >
            Dribbble
          </a>
          <a 
            href="#" 
            className="editable-label hover-theme-primary transition-colors"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
