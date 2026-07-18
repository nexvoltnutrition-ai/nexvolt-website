import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

export function AnnouncementBar() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: bars, error } = await supabase.from('announcement_bar').select('*').limit(1);
        if (error) throw error;
        if (bars && bars.length > 0) {
          setData(bars[0]);
        }
      } catch (error) {
        console.error("Error fetching announcement bar:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data || !data.enabled || closed) return null;

  const content = (
    <div
      className={`${data.marquee ? 'whitespace-nowrap overflow-hidden' : ''} w-full flex items-center justify-center`}
      style={{
        textAlign: (data.text_align as any) || 'center',
        fontSize: data.font_size || '13px',
        fontWeight: data.font_weight || '500',
      }}
    >
      {data.marquee ? (
        <div 
          className={`inline-block animate-marquee ${data.pause_on_hover ? 'hover:![animation-play-state:paused]' : ''}`}
          style={{ animationDuration: `${data.marquee_speed || 15}s` }}
        >
          <span className="pr-16">{data.text}</span>
          <span className="pr-16">{data.text}</span>
        </div>
      ) : (
        <div className="px-10 w-full max-w-7xl mx-auto truncate">
          {data.text}
        </div>
      )}
    </div>
  );

  const inner = data.link ? (
    <a 
      href={data.link} 
      target={data.open_new_tab ? "_blank" : "_self"} 
      rel={data.open_new_tab ? "noopener noreferrer" : ""}
      className="w-full flex items-center h-full hover:opacity-90 transition-opacity"
      style={{ color: data.text_color || '#ffffff' }}
    >
      {content}
    </a>
  ) : (
    <div className="w-full flex items-center h-full" style={{ color: data.text_color || '#ffffff' }}>
      {content}
    </div>
  );

  return (
    <div 
      className={`${data.sticky ? 'sticky top-0 z-50' : 'relative z-50'} flex items-center overflow-hidden`}
      style={{ 
        backgroundColor: data.bg_color || '#f47c20',
        height: data.height ? `${data.height}px` : '40px'
      }}
    >
      {inner}
      
      {data.close_button && (
        <button 
          onClick={() => setClosed(true)}
          className="absolute right-2 md:right-4 z-10 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
          style={{ color: data.text_color || '#ffffff' }}
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
