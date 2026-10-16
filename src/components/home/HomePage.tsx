import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Post, Profile } from '@/lib/types';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { Loader2 } from 'lucide-react';

interface HomePageProps {
  onOpenProfile: (userId: string) => void;
  onOpenNftDetail: (nftId: string) => void;
}

export function HomePage({ onOpenProfile, onOpenNftDetail }: HomePageProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setPosts([]);
    } else {
      const enriched = await Promise.all(
        (data as Post[]).map(async (post) => {
          const [likeCount, commentCount, myLike] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user!.id).maybeSingle(),
          ]);
          return {
            ...post,
            author: post.author as Profile,
            like_count: likeCount.count ?? 0,
            comment_count: commentCount.count ?? 0,
            liked_by_me: !!myLike.data,
          };
        })
      );
      setPosts(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handlePostCreated = async () => {
    setPosting(true);
    await fetchPosts();
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <PostComposer onPosted={handlePostCreated} />

      {loading || posting ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400 mb-1">No posts yet</p>
          <p className="text-xs text-gray-600">Be the first to share something with the community</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenProfile={onOpenProfile}
              onOpenNftDetail={onOpenNftDetail}
              onUpdate={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
