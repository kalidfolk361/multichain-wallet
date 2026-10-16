import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Post, Comment, Profile } from '@/lib/types';
import { timeAgo } from '@/lib/format';
import { Heart, MessageCircle, Send, Loader2, ArrowLeft } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenProfile: (userId: string) => void;
  onOpenNftDetail: (nftId: string) => void;
  onUpdate: () => void;
}

export function PostCard({ post, onOpenProfile, onOpenNftDetail, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user!.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('likes').insert({ post_id: post.id });
      if (post.user_id !== user!.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          actor_id: user!.id,
          type: 'like',
          entity_id: post.id,
          entity_type: 'post',
          content: 'liked your post',
        });
      }
    }
    onUpdate();
  };

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select(`*, author:profiles!comments_user_id_fkey(*)`)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) ?? []);
    setLoadingComments(false);
  }, [post.id]);

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments, fetchComments]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, content: commentText.trim() })
      .select(`*, author:profiles!comments_user_id_fkey(*)`)
      .maybeSingle();
    setSubmittingComment(false);
    if (data) {
      setComments((prev) => [...prev, data as Comment]);
      setCommentText('');
      if (post.user_id !== user!.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          actor_id: user!.id,
          type: 'comment',
          entity_id: post.id,
          entity_type: 'post',
          content: 'commented on your post',
        });
      }
    }
  };

  const author = post.author;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4">
        {author?.avatar_url ? (
          <img
            src={author.avatar_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => onOpenProfile(post.user_id)}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center cursor-pointer"
            onClick={() => onOpenProfile(post.user_id)}
          >
            <span className="text-sm font-bold text-white">
              {(author?.display_name || author?.username || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onOpenProfile(post.user_id)}
            className="text-sm font-semibold text-white hover:underline truncate block"
          >
            {author?.display_name || author?.username || 'Unknown'}
          </button>
          <p className="text-xs text-gray-500">
            @{author?.username || 'unknown'} · {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className={`grid gap-1 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media_urls.map((url) =>
            post.media_type === 'video' ? (
              <video key={url} src={url} className="w-full max-h-[500px] object-cover" controls />
            ) : (
              <img key={url} src={url} alt="" className="w-full max-h-[500px] object-cover" />
            )
          )}
        </div>
      )}

      {/* NFT link */}
      {post.nft_id && (
        <button
          onClick={() => onOpenNftDetail(post.nft_id!)}
          className="mx-4 mb-3 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/15 transition-all"
        >
          View NFT →
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/[0.04]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${liked ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comment_count ?? 0}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3">
          {loadingComments && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              {c.author?.avatar_url ? (
                <img src={c.author.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-400">{(c.author?.display_name || 'U')[0]}</span>
                </div>
              )}
              <div className="flex-1 bg-white/[0.03] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenProfile(c.user_id)}
                    className="text-xs font-semibold text-white hover:underline"
                  >
                    {c.author?.display_name || c.author?.username || 'Unknown'}
                  </button>
                  <span className="text-[10px] text-gray-600">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !commentText.trim()}
              className="bg-blue-500 hover:bg-blue-400 text-white rounded-lg px-3 py-2 disabled:opacity-50 transition-all"
            >
              {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
