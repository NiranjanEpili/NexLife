interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' },
    xl: { icon: 'w-24 h-24', text: 'text-5xl' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes[size].icon} relative group`}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
        
        {/* Logo container */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
          {/* Inner glow */}
          <div className="absolute inset-1 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-50"></div>
          
          {/* Logo symbol - Stylized "N" */}
          <svg className="relative w-full h-full p-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Modern "N" with connecting line representing life journey */}
            <path 
              d="M4 20V4L12 12L20 4V20M12 12V20" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />
            {/* Star/Spark element */}
            <circle cx="12" cy="8" r="1.5" fill="white" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none`}>
            NexLife
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
            Life Simplified
          </span>
        </div>
      )}
    </div>
  );
}

// Alternative minimal logo version
export function LogoMinimal({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`${sizes[size]} relative group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-xl flex items-center justify-center h-full w-full">
        <svg className="w-full h-full p-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M4 20V4L12 12L20 4V20M12 12V20" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
