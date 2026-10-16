import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { ImagePlus, Video, Type, Loader2, Send } from 'lucide-react';

export function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      if (file.size > 15 * 1024 * 1024) continue;
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/post-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('post-media').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('post-media').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setMediaUrls(urls);
    setMediaType(urls.length > 0 ? (files[0].type.startsWith('video/') ? 'video' : 'image') : 'text');
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from('posts').insert({
      content: content.trim() || null,
      media_urls: mediaUrls,
      media_type: mediaType,
    });
    setSubmitting(false);
    if (error) return;
    setContent('');
    setMediaUrls([]);
    setMediaType('text');
    onPosted();
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex gap-3">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Share something with the community..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none"
          />
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mediaUrls.map((url) => (
                <div key={url} className="relative rounded-lg overflow-hidden">
                  {mediaType === 'video' ? (
                    <video src={url} className="w-full h-32 object-cover" controls />
                  ) : (
                    <img src={url} alt="" className="w-full h-32 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg transition-all"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                Photo
              </button>
              <button
                onClick={() => { setMediaType('text'); setMediaUrls([]); }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${mediaType === 'text' && !mediaUrls.length ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white bg-white/[0.04]'}`}
              >
                <Type className="w-3.5 h-3.5" /> Text
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!content.trim() && mediaUrls.length === 0)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
