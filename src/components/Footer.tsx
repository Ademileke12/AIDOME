import InteractiveMascot from './InteractiveMascot';

export default function Footer() {
  // Creator profile image
  const creatorImage = 'https://i.ibb.co/Y4Hght08/pfp.png';
  
  return (
    <footer className="pt-24 pb-12 border-t border-white/[0.05] mt-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
      {/* Bio Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-12 editorial-card rounded-3xl p-8 mb-16 relative overflow-hidden group">
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-0" />
        
        {/* Left: Bio info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 z-10 max-w-2xl text-center sm:text-left">
          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-full border border-white/20 overflow-hidden shadow-2xl relative">
            <img 
              src={creatorImage} 
              alt="Creator Avatar" 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight mb-4 text-white">
              <span className="font-serif italic text-white/50 block mb-1 tracking-normal">Built by</span>
              anakincoco
            </h3>
            <p className="text-sm font-sans text-white/60 leading-relaxed text-balance">
              Frontend Dev and game developer. vibe coder. Educating through Writing. AI/ Digital Token User. Anime lover. Building 
              <a href="https://twitter.com/examfever_" target="_blank" rel="noreferrer" className="mx-1 text-white hover:text-white/70 transition-colors border-b border-white/30">
                @examfever_
              </a> 
              nd CADI.
            </p>
          </div>
        </div>

        {/* Right: Interactive Mascot */}
        <div className="z-10 bg-white/[0.02] border border-white/5 p-8 rounded-2xl shrink-0 hidden md:flex items-center justify-center">
          <InteractiveMascot className="w-32 h-32 text-white" />
        </div>
      </div>

      {/* Copyright */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 editable-label">
          <span>© 2026 AI dome Gallery</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span>By anakincoco</span>
        </div>
        <div className="flex gap-6">
          <a 
            href="https://x.com/anakincoco" 
            target="_blank"
            rel="noopener noreferrer"
            className="editable-label hover:text-white transition-colors"
          >
            Twitter
          </a>
          <a 
            href="#" 
            className="editable-label hover:text-white transition-colors"
          >
            Dribbble
          </a>
          <a 
            href="#" 
            className="editable-label hover:text-white transition-colors"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
