export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[];
  media_type: 'text' | 'image' | 'video' | 'artwork';
  nft_id: string | null;
  collection_id: string | null;
  created_at: string;
  author?: Profile;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  network_key: string;
  created_at: string;
  nft_count?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'follow' | 'offer' | 'trade' | 'system' | 'nft';
  entity_id: string | null;
  entity_type: string | null;
  content: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface P2pPaymentMethod {
  id: string;
  user_id: string;
  label: string;
  account_holder: string;
  account_details: string;
  supported_currencies: string[];
  created_at: string;
}

export interface P2pOffer {
  id: string;
  user_id: string;
  offer_type: 'buy' | 'sell';
  network_key: string;
  price: number;
  fiat_currency: string;
  available_amount: number;
  initial_amount: number;
  min_amount: number;
  max_amount: number;
  payment_method_id: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  terms: string | null;
  created_at: string;
  creator?: Profile;
  payment_method?: P2pPaymentMethod;
}

export interface P2pTrade {
  id: string;
  offer_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  price: number;
  total: number;
  fiat_currency: string;
  network_key: string;
  status: 'pending_payment' | 'payment_made' | 'released' | 'cancelled' | 'disputed' | 'expired';
  payment_method_id: string | null;
  expires_at: string;
  paid_at: string | null;
  released_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  buyer?: Profile;
  seller?: Profile;
  offer?: P2pOffer;
  payment_method?: P2pPaymentMethod;
}

export interface P2pMessage {
  id: string;
  trade_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  sender?: Profile;
}

export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_id: string;
  created_at: string;
  blocked?: Profile;
}
