"use client";

export interface LoveStory {
  year: string;
  title: string;
  story: string;
}

export interface BaseLoveStoryProps {
  stories: LoveStory[];
  styles?: {
    wrapper?: string;
    mainTitle?: string;
    timelineContainer?: string;
    timelineLine?: string;
    itemContainer?: string;
    yearBadge?: string;
    itemTitle?: string;
    itemText?: string;
  };
}

export default function BaseLoveStory({ stories, styles = {} }: BaseLoveStoryProps) {
  // PERTAHANAN ABSOLUT: Jika array kosong atau tidak ada, return null. Komponen lenyap.
  if (!stories || stories.length === 0) return null;

  return (
    <div className={`relative ${styles.wrapper || "w-full text-center"}`}>
      {styles.mainTitle && <h3 className={styles.mainTitle}>Kisah Cinta Kami</h3>}
      
      <div className={styles.timelineContainer || "space-y-8 relative mt-8"}>
        {/* Garis Vertikal di tengah */}
        <div className={styles.timelineLine || "absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 -translate-x-1/2"}></div>
        
        {stories.map((story, idx) => (
          <div 
            key={idx} 
            className={styles.itemContainer || "relative z-10 animate-in fade-in slide-in-from-bottom-4"} 
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            <div className={styles.yearBadge || "bg-slate-200 px-3 py-1 rounded-full inline-block text-xs font-bold mb-2"}>
              {story.year}
            </div>
            <h4 className={styles.itemTitle || "font-bold text-slate-800"}>{story.title}</h4>
            <p className={styles.itemText || "text-xs text-slate-600 px-8 mt-1 leading-relaxed"}>{story.story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}