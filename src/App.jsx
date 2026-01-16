import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

// ========== ICONS ==========
const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({ filled }) => <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Comment: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Share: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ArrowLeft: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Image: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Bookmark: ({ filled }) => <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Video: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Camera: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Repeat: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  BarChart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  TrendingUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  MessageCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Flag: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Slash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Compass: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Smile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  MoreHorizontal: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  Link: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Verified: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Pin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Mic: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Circle: () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="6"/></svg>,
  CheckCheck: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>,
  Star: ({ filled }) => <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  List: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  DollarSign: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Palette: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>,
  Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Gift: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  Hash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Filter: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  VolumeX: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
}

// Emoji reactions
const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯']

function App() {
  // Auth State
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // App State
  const [darkMode, setDarkMode] = useState(true)
  const [page, setPage] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data State
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [communities, setCommunities] = useState([])
  const [myCommunities, setMyCommunities] = useState([])
  const [activities, setActivities] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [stories, setStories] = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [trendingTags, setTrendingTags] = useState([])

  // View State
  const [viewingThread, setViewingThread] = useState(null)
  const [viewingCommunity, setViewingCommunity] = useState(null)
  const [viewingProfile, setViewingProfile] = useState(null)
  const [viewingChat, setViewingChat] = useState(null)
  const [viewingStory, setViewingStory] = useState(null)
  const [showReactions, setShowReactions] = useState(null)
  const [showPostMenu, setShowPostMenu] = useState(null)

  // Form State
  const [newPost, setNewPost] = useState('')
  const [newReply, setNewReply] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [postImages, setPostImages] = useState([])
  const [postTags, setPostTags] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunityDesc, setNewCommunityDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [showPollForm, setShowPollForm] = useState(false)
  const [storyImage, setStoryImage] = useState(null)

  // New Feature States
  const [drafts, setDrafts] = useState([])
  const [topics, setTopics] = useState([])
  const [myTopics, setMyTopics] = useState([])
  const [lists, setLists] = useState([])
  const [highlights, setHighlights] = useState([])
  const [closeFriends, setCloseFriends] = useState([])
  const [mutedKeywords, setMutedKeywords] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [accentColor, setAccentColor] = useState('#1d9bf0')
  const [themeMode, setThemeMode] = useState('dark') // dark, light, oled
  const [postsPage, setPostsPage] = useState(0)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [quotePost, setQuotePost] = useState(null)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifs, setGifs] = useState([])
  const [gifSearch, setGifSearch] = useState('')
  const [selectedGif, setSelectedGif] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [scheduledDate, setScheduledDate] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [searchFilters, setSearchFilters] = useState({ type: 'all', date: '', hasMedia: false })
  const [viewingList, setViewingList] = useState(null)
  const [newListName, setNewListName] = useState('')
  const [showTipModal, setShowTipModal] = useState(null)
  const [tipAmount, setTipAmount] = useState('')

  const fileInputRef = useRef(null)
  const storyInputRef = useRef(null)
  const loadingRef = useRef(false)

  // Theme & Accent Color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--accent2', accentColor + 'dd')
    document.documentElement.style.setProperty('--accent-soft', accentColor + '1a')
  }, [themeMode, accentColor])

  // Auth Setup
  useEffect(() => {
    // Timeout fallback - if auth takes too long, show login
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        if (event === 'SIGNED_IN') await createProfile(session.user)
        loadProfile(session.user)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // Load Data
  useEffect(() => {
    if (user) {
      loadAllData()
      const channel = supabase.channel('changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, loadPosts)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => viewingChat && loadMessages(viewingChat.id))
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [user])

  const loadAllData = async () => {
    await Promise.all([
      loadPosts(),
      loadUsers(),
      loadCommunities(),
      loadMyCommunities(),
      loadActivities(),
      loadBookmarks(),
      loadStories(),
      loadConversations(),
      loadTrendingTags(),
      loadTopics(),
      loadLists(),
      loadDrafts(),
      loadUnreadCount(),
      loadMutedKeywords()
    ])
  }

  // ========== NEW FEATURES ==========
  const loadTopics = async () => {
    try {
      const { data } = await supabase.from('topics').select('*').order('follower_count', { ascending: false })
      setTopics(data || [])
      const { data: my } = await supabase.from('user_topics').select('topic_id').eq('user_id', user?.id)
      setMyTopics(my?.map(t => t.topic_id) || [])
    } catch (e) { console.error(e) }
  }

  const loadLists = async () => {
    try {
      const { data } = await supabase.from('lists').select('*, list_members(member_id)').eq('user_id', user?.id)
      setLists(data || [])
    } catch (e) { console.error(e) }
  }

  const loadDrafts = async () => {
    try {
      const { data } = await supabase.from('drafts').select('*').eq('user_id', user?.id).order('updated_at', { ascending: false })
      setDrafts(data || [])
    } catch (e) { console.error(e) }
  }

  const loadUnreadCount = async () => {
    try {
      const { count } = await supabase.from('activity').select('*', { count: 'exact', head: true }).eq('target_user_id', user?.id).eq('is_read', false)
      setUnreadCount(count || 0)
    } catch (e) { console.error(e) }
  }

  const loadMutedKeywords = async () => {
    try {
      const { data } = await supabase.from('muted_keywords').select('keyword').eq('user_id', user?.id)
      setMutedKeywords(data?.map(m => m.keyword) || [])
    } catch (e) { console.error(e) }
  }

  const followTopic = async (topicId) => {
    if (myTopics.includes(topicId)) {
      await supabase.from('user_topics').delete().eq('user_id', user.id).eq('topic_id', topicId)
      setMyTopics(myTopics.filter(t => t !== topicId))
    } else {
      await supabase.from('user_topics').insert([{ user_id: user.id, topic_id: topicId }])
      setMyTopics([...myTopics, topicId])
    }
  }

  const createList = async () => {
    if (!newListName.trim()) return
    await supabase.from('lists').insert([{ user_id: user.id, name: newListName }])
    setNewListName('')
    loadLists()
  }

  const addToList = async (listId, memberId) => {
    await supabase.from('list_members').upsert([{ list_id: listId, member_id: memberId }], { onConflict: 'list_id,member_id' })
    loadLists()
  }

  const saveDraft = async () => {
    if (!newPost.trim()) return
    await supabase.from('drafts').insert([{
      user_id: user.id,
      content: newPost,
      media_urls: postImages.map(f => f.name),
      tags: postTags.split(',').map(t => t.trim()).filter(t => t)
    }])
    setNewPost(''); setPostImages([]); setPostTags('')
    loadDrafts()
    alert('Draft saved!')
  }

  const loadDraft = (draft) => {
    setNewPost(draft.content || '')
    setPostTags(draft.tags?.join(', ') || '')
    setPage('create')
  }

  const deleteDraft = async (id) => {
    await supabase.from('drafts').delete().eq('id', id)
    loadDrafts()
  }

  const addMutedKeyword = async (keyword) => {
    if (!keyword.trim()) return
    await supabase.from('muted_keywords').insert([{ user_id: user.id, keyword: keyword.toLowerCase() }])
    loadMutedKeywords()
  }

  const removeMutedKeyword = async (keyword) => {
    await supabase.from('muted_keywords').delete().eq('user_id', user.id).eq('keyword', keyword)
    loadMutedKeywords()
  }

  const markAllRead = async () => {
    await supabase.from('activity').update({ is_read: true }).eq('target_user_id', user.id)
    setUnreadCount(0)
    loadActivities()
  }

  // GIF Picker (using Giphy API - you'd need an API key)
  const searchGifs = async (query) => {
    if (!query) { setGifs([]); return }
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=20`)
      const data = await res.json()
      setGifs(data.data || [])
    } catch (e) { setGifs([]) }
  }

  // Typing indicator
  const sendTypingIndicator = async () => {
    if (!viewingChat) return
    const channel = supabase.channel(`typing:${viewingChat.id}`)
    await channel.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id } })
  }

  // Edit post
  const startEditPost = (post) => {
    setEditingPost(post)
    setEditPostContent(post.content)
  }

  const saveEditPost = async () => {
    if (!editingPost || !editPostContent.trim()) return
    await supabase.from('posts').update({ content: editPostContent, edited_at: new Date().toISOString() }).eq('id', editingPost.id)
    setEditingPost(null)
    setEditPostContent('')
    loadPosts()
  }

  // Pin post
  const togglePinPost = async (post) => {
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id)
    loadPosts()
  }

  // Schedule post
  const createScheduledPost = async (e) => {
    e.preventDefault()
    if (!newPost.trim() || !scheduledDate) return
    await supabase.from('posts').insert([{
      content: newPost,
      user_id: user.id,
      scheduled_at: scheduledDate,
      community_id: selectedCommunity || null
    }])
    setNewPost(''); setScheduledDate(''); setShowSchedule(false)
    alert('Post scheduled!')
  }

  // Quote repost
  const startQuoteRepost = (post) => {
    setQuotePost(post)
    setPage('create')
  }

  // Send tip
  const sendTip = async () => {
    if (!showTipModal || !tipAmount) return
    await supabase.from('tips').insert([{
      sender_id: user.id,
      receiver_id: showTipModal.user_id,
      amount: parseFloat(tipAmount),
      post_id: showTipModal.id
    }])
    await supabase.from('activity').insert([{
      type: 'tip', user_id: user.id, target_user_id: showTipModal.user_id, post_id: showTipModal.id
    }])
    setShowTipModal(null)
    setTipAmount('')
    alert('Tip sent!')
  }

  // Infinite scroll
  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) return
    setLoadingMore(true)
    const { data } = await supabase.from('posts').select('*, profiles:user_id(*)')
      .is('parent_id', null).order('created_at', { ascending: false })
      .range(posts.length, posts.length + 19)
    if (data?.length < 20) setHasMorePosts(false)
    if (data?.length > 0) setPosts([...posts, ...data])
    setLoadingMore(false)
  }

  // Update online status
  const updateOnlineStatus = async (isOnline) => {
    await supabase.from('profiles').update({ is_online: isOnline, last_seen: new Date().toISOString() }).eq('id', user?.id)
  }

  useEffect(() => {
    if (user) {
      updateOnlineStatus(true)
      const interval = setInterval(() => updateOnlineStatus(true), 60000)
      window.addEventListener('beforeunload', () => updateOnlineStatus(false))
      return () => { clearInterval(interval); updateOnlineStatus(false) }
    }
  }, [user])

  // ========== AUTH ==========
  const loadProfile = async (authUser) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      setProfile(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const createProfile = async (authUser) => {
    await supabase.from('profiles').upsert({
      id: authUser.id,
      username: authUser.email?.split('@')[0] || `user_${Date.now()}`,
      display_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      avatar_url: authUser.user_metadata?.avatar_url,
    }, { onConflict: 'id' })
  }

  const saveProfile = async () => {
    await supabase.from('profiles').update({ display_name: editName, bio: editBio }).eq('id', user.id)
    setProfile({ ...profile, display_name: editName, bio: editBio })
    setEditMode(false)
  }

  const signInWithEmail = async (e) => {
    e.preventDefault()
    setAuthError(''); setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const signUpWithEmail = async (e) => {
    e.preventDefault()
    setAuthError(''); setAuthLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
    else setAuthError('success')
    setAuthLoading(false)
  }

  const signOut = () => supabase.auth.signOut()

  // ========== POSTS ==========
  const loadPosts = async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:user_id (*), communities:community_id (*), polls(*)')
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) { loadingRef.current = false; return }

      const postIds = data?.map(p => p.id) || []
      let likeCounts = {}, replyCounts = {}, repostCounts = {}, reactions = {}

      if (postIds.length > 0) {
        const [likesRes, repliesRes, repostsRes, reactionsRes, myLikesRes, myReactionsRes, pollVotesRes] = await Promise.all([
          supabase.from('likes').select('post_id').in('post_id', postIds),
          supabase.from('posts').select('parent_id').in('parent_id', postIds),
          supabase.from('reposts').select('post_id').in('post_id', postIds),
          supabase.from('reactions').select('post_id, reaction_type').in('post_id', postIds),
          supabase.from('likes').select('post_id').eq('user_id', user?.id),
          supabase.from('reactions').select('post_id, reaction_type').eq('user_id', user?.id),
          supabase.from('poll_votes').select('poll_id, option_index').eq('user_id', user?.id)
        ])

        likesRes.data?.forEach(l => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1 })
        repliesRes.data?.forEach(r => { replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1 })
        repostsRes.data?.forEach(r => { repostCounts[r.post_id] = (repostCounts[r.post_id] || 0) + 1 })
        reactionsRes.data?.forEach(r => {
          if (!reactions[r.post_id]) reactions[r.post_id] = {}
          reactions[r.post_id][r.reaction_type] = (reactions[r.post_id][r.reaction_type] || 0) + 1
        })

        const likedIds = new Set(myLikesRes.data?.map(l => l.post_id) || [])
        const myReactionMap = {}
        myReactionsRes.data?.forEach(r => { myReactionMap[r.post_id] = r.reaction_type })
        const myVotes = {}
        pollVotesRes.data?.forEach(v => { myVotes[v.poll_id] = v.option_index })

        setPosts((data || []).map(p => ({
          ...p,
          isLiked: likedIds.has(p.id),
          likeCount: likeCounts[p.id] || 0,
          replyCount: replyCounts[p.id] || 0,
          repostCount: repostCounts[p.id] || 0,
          reactions: reactions[p.id] || {},
          myReaction: myReactionMap[p.id],
          myVote: p.polls?.[0] ? myVotes[p.polls[0].id] : null
        })))
      } else {
        setPosts([])
      }
    } catch (e) {
      if (!e.message?.includes('AbortError')) console.error(e)
    } finally {
      loadingRef.current = false
    }
  }

  const createPost = async (e) => {
    e.preventDefault()
    if (!newPost.trim() && postImages.length === 0) return

    setUploading(true)
    let mediaUrls = []

    // Upload images
    for (const img of postImages) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${img.name.split('.').pop()}`
      const { error } = await supabase.storage.from('post-images').upload(fileName, img)
      if (!error) {
        const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
        mediaUrls.push(data.publicUrl)
      }
    }

    const tags = postTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t)

    // Extract mentions
    const mentionRegex = /@(\w+)/g
    const mentionedUsernames = [...newPost.matchAll(mentionRegex)].map(m => m[1])

    const { data: postData, error } = await supabase.from('posts').insert([{
      content: newPost,
      user_id: user.id,
      community_id: selectedCommunity || null,
      image_url: mediaUrls[0] || null,
      media_urls: mediaUrls,
      tags: tags.length > 0 ? tags : null
    }]).select().single()

    if (!error && postData) {
      // Create poll if exists
      if (showPollForm && pollQuestion && pollOptions.filter(o => o).length >= 2) {
        await supabase.from('polls').insert([{
          post_id: postData.id,
          question: pollQuestion,
          options: pollOptions.filter(o => o).map(o => ({ text: o, votes: 0 }))
        }])
      }

      // Handle mentions
      if (mentionedUsernames.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('username', mentionedUsernames)

        for (const mu of mentionedUsers || []) {
          await supabase.from('mentions').insert([{ post_id: postData.id, mentioned_user_id: mu.id }])
          await supabase.from('activity').insert([{
            type: 'mention', user_id: user.id, target_user_id: mu.id, post_id: postData.id
          }])
        }
      }
    }

    setNewPost(''); setPostImages([]); setPostTags(''); setSelectedCommunity('')
    setPollQuestion(''); setPollOptions(['', '']); setShowPollForm(false)
    setUploading(false); setPage('home')
    setTimeout(() => loadPosts(), 100)
  }

  const deletePost = async (id) => {
    if (confirm('Delete?')) {
      await supabase.from('posts').delete().eq('id', id)
      if (viewingThread?.id === id) { setViewingThread(null); setPage('home') }
      loadPosts()
    }
  }

  const toggleLike = async (post) => {
    if (post.isLiked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert([{ post_id: post.id, user_id: user.id }])
      if (post.user_id !== user.id) {
        await supabase.from('activity').insert([{ type: 'like', user_id: user.id, target_user_id: post.user_id, post_id: post.id }])
      }
    }
    loadPosts()
  }

  const addReaction = async (post, emoji) => {
    await supabase.from('reactions').upsert([{ post_id: post.id, user_id: user.id, reaction_type: emoji }], { onConflict: 'post_id,user_id' })
    setShowReactions(null)
    loadPosts()
  }

  const repost = async (post) => {
    const { data: existing } = await supabase.from('reposts').select('id').eq('post_id', post.id).eq('user_id', user.id).single()
    if (existing) {
      await supabase.from('reposts').delete().eq('id', existing.id)
    } else {
      await supabase.from('reposts').insert([{ post_id: post.id, user_id: user.id }])
    }
    loadPosts()
  }

  const votePoll = async (pollId, optionIndex) => {
    await supabase.from('poll_votes').upsert([{ poll_id: pollId, user_id: user.id, option_index: optionIndex }], { onConflict: 'poll_id,user_id' })
    loadPosts()
  }

  const reportPost = async (postId, reason) => {
    await supabase.from('reports').insert([{ reporter_id: user.id, post_id: postId, reason }])
    alert('Report submitted')
    setShowPostMenu(null)
  }

  // ========== REPLIES ==========
  const loadReplies = async (postId) => {
    const { data } = await supabase.from('posts').select('*, profiles:user_id (*)').eq('parent_id', postId).order('created_at', { ascending: true })
    if (!data?.length) return []
    const replyIds = data.map(r => r.id)
    const { data: likes } = await supabase.from('likes').select('post_id').in('post_id', replyIds)
    const likeCounts = {}
    likes?.forEach(l => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1 })
    const { data: myLikes } = await supabase.from('likes').select('post_id').eq('user_id', user?.id)
    const likedIds = new Set(myLikes?.map(l => l.post_id) || [])
    return data.map(p => ({ ...p, isLiked: likedIds.has(p.id), likeCount: likeCounts[p.id] || 0 }))
  }

  const createReply = async (parentId, parentUserId) => {
    if (!newReply.trim()) return
    await supabase.from('posts').insert([{ content: newReply, user_id: user.id, parent_id: parentId }])
    if (parentUserId !== user.id) {
      await supabase.from('activity').insert([{ type: 'reply', user_id: user.id, target_user_id: parentUserId, post_id: parentId }])
    }
    setNewReply('')
    if (viewingThread) {
      const replies = await loadReplies(viewingThread.id)
      setViewingThread({ ...viewingThread, replies })
    }
  }

  // ========== STORIES ==========
  const loadStories = async () => {
    try {
      const { data } = await supabase
        .from('stories')
        .select('*, profiles:user_id (*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      // Group by user
      const grouped = {}
      data?.forEach(s => {
        if (!grouped[s.user_id]) grouped[s.user_id] = { user: s.profiles, stories: [] }
        grouped[s.user_id].stories.push(s)
      })
      setStories(Object.values(grouped))
    } catch (e) { console.error(e) }
  }

  const createStory = async () => {
    if (!storyImage) return
    setUploading(true)
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${storyImage.name.split('.').pop()}`
    const { error } = await supabase.storage.from('stories').upload(fileName, storyImage)
    if (!error) {
      const { data } = supabase.storage.from('stories').getPublicUrl(fileName)
      await supabase.from('stories').insert([{ user_id: user.id, image_url: data.publicUrl }])
      setStoryImage(null)
      loadStories()
    }
    setUploading(false)
  }

  const viewStory = async (storyGroup, index = 0) => {
    setViewingStory({ ...storyGroup, currentIndex: index })
    const story = storyGroup.stories[index]
    if (story.user_id !== user.id) {
      await supabase.from('story_views').upsert([{ story_id: story.id, user_id: user.id }], { onConflict: 'story_id,user_id' })
    }
  }

  // ========== MESSAGES ==========
  const loadConversations = async () => {
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false })

      const convWithProfiles = await Promise.all((data || []).map(async (c) => {
        const otherId = c.user1_id === user?.id ? c.user2_id : c.user1_id
        const { data: p } = await supabase.from('profiles').select('*').eq('id', otherId).single()
        return { ...c, otherUser: p }
      }))
      setConversations(convWithProfiles)
    } catch (e) { console.error(e) }
  }

  const loadMessages = async (conversationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const startConversation = async (otherUserId) => {
    let { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single()

    if (!existing) {
      const { data } = await supabase.from('conversations').insert([{ user1_id: user.id, user2_id: otherUserId }]).select().single()
      existing = data
    }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', otherUserId).single()
    setViewingChat({ ...existing, otherUser: p })
    loadMessages(existing.id)
    setPage('chat')
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !viewingChat) return
    await supabase.from('messages').insert([{
      conversation_id: viewingChat.id,
      sender_id: user.id,
      receiver_id: viewingChat.otherUser.id,
      content: newMessage
    }])
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', viewingChat.id)
    setNewMessage('')
    loadMessages(viewingChat.id)
  }

  // ========== USERS ==========
  const loadUsers = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').neq('id', user?.id).limit(20)
      const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', user?.id)
      const followingIds = new Set(myFollows?.map(f => f.following_id) || [])
      setUsers((data || []).map(u => ({ ...u, isFollowing: followingIds.has(u.id) })))
    } catch (e) { console.error(e) }
  }

  const toggleFollow = async (u) => {
    if (u.isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', u.id)
    } else {
      await supabase.from('follows').insert([{ follower_id: user.id, following_id: u.id }])
      await supabase.from('activity').insert([{ type: 'follow', user_id: user.id, target_user_id: u.id }])
    }
    loadUsers()
  }

  const blockUser = async (userId) => {
    await supabase.from('blocked_users').insert([{ blocker_id: user.id, blocked_id: userId }])
    alert('User blocked')
  }

  // ========== COMMUNITIES ==========
  const loadCommunities = async () => {
    try {
      const { data } = await supabase.from('communities').select('*').order('created_at', { ascending: false })
      const communityIds = data?.map(c => c.id) || []
      let memberCounts = {}
      if (communityIds.length > 0) {
        const { data: members } = await supabase.from('community_members').select('community_id').in('community_id', communityIds)
        members?.forEach(m => { memberCounts[m.community_id] = (memberCounts[m.community_id] || 0) + 1 })
      }
      setCommunities((data || []).map(c => ({ ...c, memberCount: memberCounts[c.id] || 0 })))
    } catch (e) { console.error(e) }
  }

  const loadMyCommunities = async () => {
    try {
      const { data } = await supabase.from('community_members').select('community:communities(*)').eq('user_id', user?.id)
      setMyCommunities(data?.map(m => m.community).filter(Boolean) || [])
    } catch (e) { console.error(e) }
  }

  const joinCommunity = async (id) => {
    await supabase.from('community_members').insert([{ community_id: id, user_id: user.id }])
    loadMyCommunities(); loadCommunities()
  }

  const leaveCommunity = async (id) => {
    await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', user.id)
    loadMyCommunities(); loadCommunities()
  }

  const createCommunity = async (e) => {
    e.preventDefault()
    if (!newCommunityName.trim()) return
    const slug = newCommunityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await supabase.from('communities').insert([{
      name: newCommunityName, slug, description: newCommunityDesc, creator_id: user.id,
      image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`
    }])
    setNewCommunityName(''); setNewCommunityDesc('')
    setPage('communities'); loadCommunities()
  }

  const isMember = (id) => myCommunities.some(c => c?.id === id)

  // ========== ACTIVITY & BOOKMARKS ==========
  const loadActivities = async () => {
    try {
      const { data } = await supabase.from('activity')
        .select('*, actor:profiles!activity_user_id_fkey(*)')
        .eq('target_user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(30)
      setActivities(data || [])
    } catch (e) { console.error(e) }
  }

  const loadBookmarks = async () => {
    try {
      const { data } = await supabase.from('bookmarks').select('post_id').eq('user_id', user?.id)
      setBookmarks(data?.map(b => b.post_id) || [])
    } catch (e) { console.error(e) }
  }

  const toggleBookmark = async (postId) => {
    if (bookmarks.includes(postId)) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
      setBookmarks(bookmarks.filter(id => id !== postId))
    } else {
      await supabase.from('bookmarks').insert([{ post_id: postId, user_id: user.id }])
      setBookmarks([...bookmarks, postId])
    }
  }

  // ========== TRENDING ==========
  const loadTrendingTags = async () => {
    try {
      const { data } = await supabase.from('posts').select('tags').not('tags', 'is', null).limit(100)
      const tagCounts = {}
      data?.forEach(p => p.tags?.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
      const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      setTrendingTags(sorted.map(([tag, count]) => ({ tag, count })))
    } catch (e) { console.error(e) }
  }

  // ========== HELPERS ==========
  const formatTime = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'now'
    if (m < 60) return `${m}m`
    if (m < 1440) return `${Math.floor(m/60)}h`
    return `${Math.floor(m/1440)}d`
  }

  const getAvatar = (url, fallback) => url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallback || 'user'}`

  // Extract URLs from text and render as links
  const renderContent = (text) => {
    if (!text) return null
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="content-link" onClick={e => e.stopPropagation()}>{part}</a>
      }
      // Handle mentions
      const mentionRegex = /@(\w+)/g
      const mentionParts = part.split(mentionRegex)
      return mentionParts.map((mp, j) => {
        if (j % 2 === 1) {
          return <span key={`${i}-${j}`} className="mention" onClick={async (e) => { e.stopPropagation(); const { data } = await supabase.from('profiles').select('id').eq('username', mp).single(); if (data) goToProfile(data.id) }}>@{mp}</span>
        }
        return mp
      })
    })
  }

  const goToThread = async (post) => {
    const replies = await loadReplies(post.id)
    setViewingThread({ ...post, replies })
    setPage('thread')
  }

  const goToProfile = async (userId) => {
    if (userId === user.id) { setPage('profile'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    const { data: userPosts } = await supabase.from('posts').select('*').eq('user_id', userId).is('parent_id', null).order('created_at', { ascending: false })
    const { data: f } = await supabase.from('follows').select('id').eq('follower_id', user?.id).eq('following_id', userId).single()
    const { data: followers } = await supabase.from('follows').select('id').eq('following_id', userId)
    const { data: following } = await supabase.from('follows').select('id').eq('follower_id', userId)
    setViewingProfile({ ...data, posts: userPosts || [], isFollowing: !!f, followersCount: followers?.length || 0, followingCount: following?.length || 0 })
    setPage('view-profile')
  }

  const goToCommunity = async (community) => {
    const { data: communityPosts } = await supabase.from('posts')
      .select('*, profiles:user_id(*)')
      .eq('community_id', community.id)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    setViewingCommunity({ ...community, posts: communityPosts || [] })
    setPage('view-community')
  }

  const sharePost = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    alert('Link copied!')
  }

  const filteredPosts = searchQuery
    ? posts.filter(p => p.content?.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags?.some(t => t.includes(searchQuery.toLowerCase())))
    : posts

  const filteredUsers = searchQuery
    ? users.filter(u => u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  // ========== LOADING ==========
  if (loading) return (
    <div className="loading-screen">
      <div className="blackmirrorLoading">
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
        <div className="blackmirrorLoading-part"></div>
      </div>
    </div>
  )

  // ========== LOGIN ==========
  if (!user) {
    return (
      <div className="login-screen">
        {/* Animated background */}
        <div className="login-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="grid-overlay"></div>
        </div>

        {/* Floating chat bubbles decoration */}
        <div className="floating-elements">
          <div className="chat-bubble bubble-1">
            <span className="bubble-avatar">👋</span>
            <span className="bubble-text">Hello!</span>
          </div>
          <div className="chat-bubble bubble-2">
            <span className="bubble-avatar">🚀</span>
            <span className="bubble-text">Let's connect</span>
          </div>
          <div className="chat-bubble bubble-3">
            <span className="bubble-avatar">💬</span>
            <span className="bubble-text">Share ideas</span>
          </div>
          <div className="chat-bubble bubble-4">
            <span className="bubble-avatar">✨</span>
            <span className="bubble-text">Inspire others</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h1>Thread</h1>
          </div>
          <p className="login-tagline">Connect, Share, Inspire</p>
          <p className="login-desc">Join the next generation social platform where ideas come alive.</p>

          {authError && authError !== 'success' && <div className="auth-error">{authError}</div>}
          {authError === 'success' && <div className="auth-success">✓ Account created! Please login.</div>}

          <button
            className="btn-google"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
            disabled={authLoading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {authLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <form onSubmit={authMode === 'login' ? signInWithEmail : signUpWithEmail} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button type="submit" className="btn-email" disabled={authLoading}>
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-toggle">
            {authMode === 'login' ? (
              <p>Don't have an account? <button onClick={() => { setAuthMode('signup'); setAuthError('') }}>Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError('') }}>Sign In</button></p>
            )}
          </div>

          <div className="login-footer">
            <p>By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
          </div>

          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Secure & Private</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Real-time Chat</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== POST CARD ==========
  const PostCard = ({ post, showCommunity = true }) => (
    <article className="post-card">
      <div className="post-body">
        <div className="post-header">
          <img src={getAvatar(post.profiles?.avatar_url, post.profiles?.username)} className="post-avatar" onClick={() => goToProfile(post.user_id)} />
          <div className="post-meta">
            <div className="post-author-line">
              <span className="post-author" onClick={() => goToProfile(post.user_id)}>{post.profiles?.display_name}</span>
              {post.profiles?.is_verified && <span className="verified-badge"><Icons.Verified /></span>}
              <span className="post-handle">@{post.profiles?.username}</span>
              <span className="post-time">· {formatTime(post.created_at)}</span>
            </div>
            {showCommunity && post.communities && (
              <span className="post-community" onClick={() => goToCommunity(post.communities)}>r/{post.communities.name}</span>
            )}
          </div>
          <button className="post-menu-btn" onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}>
            <Icons.MoreHorizontal />
          </button>
          {showPostMenu === post.id && (
            <div className="post-menu">
              {user.id === post.user_id && <button onClick={() => { startEditPost(post); setShowPostMenu(null) }}><Icons.Edit /> Edit</button>}
              {user.id === post.user_id && <button onClick={() => { togglePinPost(post); setShowPostMenu(null) }}><Icons.Pin /> {post.is_pinned ? 'Unpin' : 'Pin'}</button>}
              {user.id === post.user_id && <button onClick={() => deletePost(post.id)}><Icons.Trash /> Delete</button>}
              <button onClick={() => { startQuoteRepost(post); setShowPostMenu(null) }}><Icons.Repeat /> Quote</button>
              {user.id !== post.user_id && <button onClick={() => { setShowTipModal(post); setShowPostMenu(null) }}><Icons.DollarSign /> Tip</button>}
              {user.id !== post.user_id && <button onClick={() => blockUser(post.user_id)}><Icons.Slash /> Block</button>}
              <button onClick={() => reportPost(post.id, 'spam')}><Icons.Flag /> Report</button>
            </div>
          )}
        </div>
        {post.is_pinned && <div className="pinned-indicator"><Icons.Pin /> Pinned</div>}
        <p className="post-content" onClick={() => goToThread(post)}>{renderContent(post.content)}</p>
        {post.edited_at && <span className="edited-indicator">edited</span>}
        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => <span key={tag} className="tag" onClick={() => { setSearchQuery(tag); setPage('search') }}>#{tag}</span>)}
          </div>
        )}
        {post.media_urls?.length > 0 ? (
          <div className={`post-media grid-${Math.min(post.media_urls.length, 4)}`}>
            {post.media_urls.slice(0, 4).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => goToThread(post)} />
            ))}
          </div>
        ) : post.image_url && (
          <img src={post.image_url} className="post-image" alt="" onClick={() => goToThread(post)} />
        )}
        {/* Poll */}
        {post.polls?.[0] && (
          <div className="poll">
            <p className="poll-question">{post.polls[0].question}</p>
            {post.polls[0].options?.map((opt, i) => (
              <button key={i} className={`poll-option ${post.myVote === i ? 'voted' : ''}`} onClick={() => votePoll(post.polls[0].id, i)}>
                {opt.text} {post.myVote !== null && <span className="poll-percent">{Math.round((opt.votes || 0) / Math.max(1, post.polls[0].options.reduce((s, o) => s + (o.votes || 0), 0)) * 100)}%</span>}
              </button>
            ))}
          </div>
        )}
        {/* Reactions display */}
        {Object.keys(post.reactions || {}).length > 0 && (
          <div className="reactions-display">
            {Object.entries(post.reactions).slice(0, 5).map(([emoji, count]) => (
              <span key={emoji} className="reaction-chip">{emoji} {count}</span>
            ))}
          </div>
        )}
        <div className="post-actions">
          <button className={`action ${post.isLiked ? 'active' : ''}`} onClick={() => toggleLike(post)}>
            <Icons.Heart filled={post.isLiked} /> {post.likeCount || 0}
          </button>
          <button className="action" onClick={() => goToThread(post)}>
            <Icons.Comment /> {post.replyCount || 0}
          </button>
          <button className="action" onClick={() => repost(post)}>
            <Icons.Repeat /> {post.repostCount || 0}
          </button>
          <button className="action" onClick={() => setShowReactions(showReactions === post.id ? null : post.id)}>
            <Icons.Smile />
          </button>
          <button className="action" onClick={() => sharePost(post)}><Icons.Share /></button>
          <button className={`action ${bookmarks.includes(post.id) ? 'active' : ''}`} onClick={() => toggleBookmark(post.id)}>
            <Icons.Bookmark filled={bookmarks.includes(post.id)} />
          </button>
        </div>
        {showReactions === post.id && (
          <div className="reactions-picker">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => addReaction(post, emoji)} className={post.myReaction === emoji ? 'selected' : ''}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  )

  // ========== STORY BAR ==========
  const StoryBar = () => (
    <div className="story-bar">
      <div className="story-item add-story" onClick={() => storyInputRef.current?.click()}>
        <div className="story-avatar add"><Icons.Plus /></div>
        <span>Add Story</span>
        <input type="file" accept="image/*" ref={storyInputRef} hidden onChange={e => { setStoryImage(e.target.files[0]); createStory() }} />
      </div>
      {stories.map((group, i) => (
        <div key={i} className="story-item" onClick={() => viewStory(group)}>
          <div className="story-avatar"><img src={getAvatar(group.user?.avatar_url, group.user?.username)} alt="" /></div>
          <span>{group.user?.username?.slice(0, 8)}</span>
        </div>
      ))}
    </div>
  )

  // ========== MAIN APP ==========
  return (
    <div className="app">
      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className="story-modal" onClick={() => setViewingStory(null)}>
          <div className="story-content" onClick={e => e.stopPropagation()}>
            <div className="story-header">
              <img src={getAvatar(viewingStory.user?.avatar_url)} />
              <span>{viewingStory.user?.display_name}</span>
              <button onClick={() => setViewingStory(null)}><Icons.X /></button>
            </div>
            <img src={viewingStory.stories[viewingStory.currentIndex]?.image_url} alt="" />
            <div className="story-nav">
              {viewingStory.currentIndex > 0 && (
                <button onClick={() => setViewingStory({ ...viewingStory, currentIndex: viewingStory.currentIndex - 1 })}>←</button>
              )}
              {viewingStory.currentIndex < viewingStory.stories.length - 1 && (
                <button onClick={() => setViewingStory({ ...viewingStory, currentIndex: viewingStory.currentIndex + 1 })}>→</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Post</h3>
              <button onClick={() => setEditingPost(null)}><Icons.X /></button>
            </div>
            <textarea value={editPostContent} onChange={e => setEditPostContent(e.target.value)} rows={4} />
            <div className="modal-actions">
              <button onClick={() => setEditingPost(null)}>Cancel</button>
              <button className="primary" onClick={saveEditPost}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="modal-overlay" onClick={() => setShowTipModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Icons.DollarSign /> Send Tip</h3>
              <button onClick={() => setShowTipModal(null)}><Icons.X /></button>
            </div>
            <p>Send a tip to @{showTipModal.profiles?.username}</p>
            <input type="number" placeholder="Amount ($)" value={tipAmount} onChange={e => setTipAmount(e.target.value)} min="1" step="0.01" />
            <div className="tip-presets">
              {[1, 5, 10, 25].map(amt => (
                <button key={amt} onClick={() => setTipAmount(amt.toString())}>${amt}</button>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowTipModal(null)}>Cancel</button>
              <button className="primary" onClick={sendTip} disabled={!tipAmount}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <div className="modal-overlay" onClick={() => setShowGifPicker(false)}>
          <div className="modal gif-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Choose GIF</h3>
              <button onClick={() => setShowGifPicker(false)}><Icons.X /></button>
            </div>
            <input placeholder="Search GIFs..." value={gifSearch} onChange={e => { setGifSearch(e.target.value); searchGifs(e.target.value) }} />
            <div className="gif-grid">
              {gifs.map(gif => (
                <img key={gif.id} src={gif.images.fixed_height_small.url} alt={gif.title} onClick={() => { setSelectedGif(gif.images.original.url); setShowGifPicker(false) }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Icons.Menu /></button>
          <h1 onClick={() => setPage('home')}>bodol</h1>
        </div>
        <div className="topbar-search">
          <Icons.Search />
          <input placeholder="Search..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage('search') }} />
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => { loadConversations(); setPage('messages') }}><Icons.MessageCircle /></button>
          <button className="icon-btn notification-btn" onClick={() => { markAllRead(); setPage('activity') }}>
            <Icons.Bell />
            {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          <button className="theme-btn" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'oled' : 'dark')}>
            {themeMode === 'dark' ? <Icons.Moon /> : themeMode === 'oled' ? <Icons.Circle /> : <Icons.Sun />}
          </button>
          <img src={getAvatar(profile?.avatar_url, user.email)} onClick={() => setPage('profile')} />
          <button className="logout-btn" onClick={signOut}><Icons.Logout /></button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-menu" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setPage('home'); setMobileMenuOpen(false) }}><Icons.Home /> Home</button>
            <button onClick={() => { setPage('explore'); setMobileMenuOpen(false) }}><Icons.Compass /> Explore</button>
            <button onClick={() => { setPage('create'); setMobileMenuOpen(false) }}><Icons.Plus /> Create</button>
            <button onClick={() => { setPage('communities'); setMobileMenuOpen(false) }}><Icons.Users /> Communities</button>
            <button onClick={() => { setPage('messages'); setMobileMenuOpen(false) }}><Icons.MessageCircle /> Messages</button>
            <button onClick={() => { setPage('bookmarks'); setMobileMenuOpen(false) }}><Icons.Bookmark /> Saved</button>
            <button onClick={() => { setPage('activity'); setMobileMenuOpen(false) }}><Icons.Bell /> Notifications</button>
            <button onClick={() => { setPage('profile'); setMobileMenuOpen(false) }}><Icons.User /> Profile</button>
          </nav>
        </div>
      )}

      <div className="layout">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          <nav className="nav">
            <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><Icons.Home /><span>Home</span></button>
            <button className={page === 'explore' ? 'active' : ''} onClick={() => setPage('explore')}><Icons.Compass /><span>Explore</span></button>
            <button className={page === 'create' ? 'active' : ''} onClick={() => setPage('create')}><Icons.Plus /><span>Create</span></button>
            <button className={page === 'communities' ? 'active' : ''} onClick={() => setPage('communities')}><Icons.Users /><span>Communities</span></button>
            <button className={page === 'messages' ? 'active' : ''} onClick={() => { loadConversations(); setPage('messages') }}><Icons.MessageCircle /><span>Messages</span></button>
            <button className={page === 'bookmarks' ? 'active' : ''} onClick={() => setPage('bookmarks')}><Icons.Bookmark /><span>Saved</span></button>
            <button className={page === 'activity' ? 'active' : ''} onClick={() => setPage('activity')}><Icons.Bell /><span>Notifications</span></button>
            <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}><Icons.User /><span>Profile</span></button>
            <button className={page === 'lists' ? 'active' : ''} onClick={() => setPage('lists')}><Icons.List /><span>Lists</span></button>
            <button className={page === 'topics' ? 'active' : ''} onClick={() => setPage('topics')}><Icons.Hash /><span>Topics</span></button>
            <button className={page === 'drafts' ? 'active' : ''} onClick={() => setPage('drafts')}><Icons.FileText /><span>Drafts</span></button>
            <button className={page === 'settings' ? 'active' : ''} onClick={() => setPage('settings')}><Icons.Settings /><span>Settings</span></button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main">
          {/* Home */}
          {page === 'home' && (
            <>
              <StoryBar />
              <div className="page-header">
                <h2>Home</h2>
                <button className="btn-create" onClick={() => setPage('create')}><Icons.Plus /> Create</button>
              </div>
              {posts.length === 0 ? (
                <div className="empty">No posts yet</div>
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </>
          )}

          {/* Explore */}
          {page === 'explore' && (
            <>
              <h2>Explore</h2>
              <div className="explore-section">
                <h3><Icons.TrendingUp /> Trending</h3>
                <div className="trending-tags">
                  {trendingTags.map(t => (
                    <button key={t.tag} className="trending-tag" onClick={() => { setSearchQuery(t.tag); setPage('search') }}>
                      #{t.tag} <span>{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <h3>Popular Posts</h3>
              {posts.slice().sort((a, b) => b.likeCount - a.likeCount).slice(0, 10).map(post => <PostCard key={post.id} post={post} />)}
            </>
          )}

          {/* Create */}
          {page === 'create' && (
            <>
              <h2>Create Post</h2>
              <form className="create-form" onSubmit={showSchedule ? createScheduledPost : createPost}>
                <select value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)}>
                  <option value="">Choose community (optional)</option>
                  {myCommunities.map(c => c && <option key={c.id} value={c.id}>r/{c.name}</option>)}
                </select>
                <textarea placeholder="What's on your mind? Use @username to mention" value={newPost} onChange={e => setNewPost(e.target.value)} rows={4} />
                <input placeholder="Tags (comma separated)" value={postTags} onChange={e => setPostTags(e.target.value)} />

                {/* Quote Post Preview */}
                {quotePost && (
                  <div className="quote-preview">
                    <button type="button" className="remove-quote" onClick={() => setQuotePost(null)}><Icons.X /></button>
                    <div className="quote-content">
                      <span className="quote-author">@{quotePost.profiles?.username}</span>
                      <p>{quotePost.content?.slice(0, 100)}</p>
                    </div>
                  </div>
                )}

                {/* Selected GIF Preview */}
                {selectedGif && (
                  <div className="gif-preview">
                    <button type="button" onClick={() => setSelectedGif(null)}><Icons.X /></button>
                    <img src={selectedGif} alt="Selected GIF" />
                  </div>
                )}

                {/* Poll */}
                {showPollForm && (
                  <div className="poll-form">
                    <input placeholder="Poll question" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
                    {pollOptions.map((opt, i) => (
                      <input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                        const newOpts = [...pollOptions]; newOpts[i] = e.target.value; setPollOptions(newOpts)
                      }} />
                    ))}
                    <button type="button" onClick={() => setPollOptions([...pollOptions, ''])}>+ Add Option</button>
                  </div>
                )}

                {/* Schedule */}
                {showSchedule && (
                  <div className="schedule-form">
                    <label><Icons.Clock /> Schedule for:</label>
                    <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                  </div>
                )}

                <div className="create-actions">
                  <input type="file" accept="image/*,video/*" multiple ref={fileInputRef} onChange={e => setPostImages([...e.target.files])} hidden />
                  <button type="button" onClick={() => fileInputRef.current?.click()}><Icons.Image /></button>
                  <button type="button" onClick={() => setShowGifPicker(true)}><Icons.Smile /> GIF</button>
                  <button type="button" onClick={() => setShowPollForm(!showPollForm)}><Icons.BarChart /></button>
                  <button type="button" onClick={() => setShowSchedule(!showSchedule)}><Icons.Clock /></button>
                  <button type="button" onClick={saveDraft}><Icons.FileText /> Draft</button>
                </div>
                {postImages.length > 0 && (
                  <div className="selected-files">{postImages.map(f => f.name).join(', ')}</div>
                )}
                <button type="submit" className="btn-submit" disabled={uploading || (!newPost.trim() && postImages.length === 0 && !selectedGif)}>
                  {uploading ? 'Posting...' : showSchedule ? 'Schedule' : 'Post'}
                </button>
              </form>
            </>
          )}

          {/* Thread */}
          {page === 'thread' && viewingThread && (
            <>
              <div className="page-header">
                <button className="btn-back" onClick={() => setPage('home')}><Icons.ArrowLeft /></button>
                <h2>Thread</h2>
              </div>
              <PostCard post={viewingThread} />
              <div className="reply-form">
                <textarea placeholder="Write a reply..." value={newReply} onChange={e => setNewReply(e.target.value)} rows={2} />
                <button onClick={() => createReply(viewingThread.id, viewingThread.user_id)} disabled={!newReply.trim()}>Reply</button>
              </div>
              <div className="replies">
                <h3>{viewingThread.replies?.length || 0} Replies</h3>
                {viewingThread.replies?.map(reply => (
                  <div key={reply.id} className="reply">
                    <img src={getAvatar(reply.profiles?.avatar_url, reply.profiles?.username)} className="reply-avatar" />
                    <div className="reply-body">
                      <div className="reply-header">
                        <span className="reply-author" onClick={() => goToProfile(reply.user_id)}>{reply.profiles?.display_name}</span>
                        {reply.profiles?.is_verified && <span className="verified-badge"><Icons.Verified /></span>}
                        <span className="reply-time">{formatTime(reply.created_at)}</span>
                      </div>
                      <p>{reply.content}</p>
                      <button className={`action small ${reply.isLiked ? 'active' : ''}`} onClick={() => toggleLike(reply)}>
                        <Icons.Heart filled={reply.isLiked} /> {reply.likeCount || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Messages */}
          {page === 'messages' && (
            <>
              <h2>Messages</h2>
              {conversations.length === 0 ? (
                <div className="empty">No conversations yet</div>
              ) : (
                conversations.map(c => (
                  <div key={c.id} className="conversation-item" onClick={() => { setViewingChat(c); loadMessages(c.id); setPage('chat') }}>
                    <img src={getAvatar(c.otherUser?.avatar_url, c.otherUser?.username)} />
                    <div>
                      <div className="name">{c.otherUser?.display_name}</div>
                      <div className="handle">@{c.otherUser?.username}</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Chat */}
          {page === 'chat' && viewingChat && (
            <>
              <div className="page-header">
                <button className="btn-back" onClick={() => setPage('messages')}><Icons.ArrowLeft /></button>
                <img src={getAvatar(viewingChat.otherUser?.avatar_url)} className="chat-avatar" />
                <h2>{viewingChat.otherUser?.display_name}</h2>
              </div>
              <div className="chat-messages">
                {messages.map(m => (
                  <div key={m.id} className={`message ${m.sender_id === user.id ? 'sent' : 'received'}`}>
                    <p>{m.content}</p>
                    <span className="message-time">{formatTime(m.created_at)}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage}><Icons.Send /></button>
              </div>
            </>
          )}

          {/* Search */}
          {page === 'search' && (
            <>
              <h2>Search</h2>
              {searchQuery ? (
                <>
                  <h3 className="section-title">Users</h3>
                  {filteredUsers.length === 0 ? <div className="empty small">No users</div> : filteredUsers.slice(0, 5).map(u => (
                    <div key={u.id} className="user-item" onClick={() => goToProfile(u.id)}>
                      <img src={getAvatar(u.avatar_url, u.username)} />
                      <div><div className="name">{u.display_name} {u.is_verified && <Icons.Verified />}</div><div className="handle">@{u.username}</div></div>
                    </div>
                  ))}
                  <h3 className="section-title">Posts</h3>
                  {filteredPosts.length === 0 ? <div className="empty small">No posts</div> : filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                </>
              ) : <div className="empty">Type to search...</div>}
            </>
          )}

          {/* Bookmarks */}
          {page === 'bookmarks' && (
            <>
              <h2>Saved</h2>
              {posts.filter(p => bookmarks.includes(p.id)).length === 0 ? (
                <div className="empty">No saved posts</div>
              ) : (
                posts.filter(p => bookmarks.includes(p.id)).map(post => <PostCard key={post.id} post={post} />)
              )}
            </>
          )}

          {/* Communities */}
          {page === 'communities' && (
            <>
              <div className="page-header">
                <h2>Communities</h2>
                <button className="btn-create" onClick={() => setPage('create-community')}><Icons.Plus /></button>
              </div>
              {communities.map(c => (
                <div key={c.id} className="community-item" onClick={() => goToCommunity(c)}>
                  <img src={c.image_url} />
                  <div><div className="name">r/{c.name}</div><div className="members">{c.memberCount || 0} members</div></div>
                  <button className={`btn-join ${isMember(c.id) ? 'joined' : ''}`} onClick={e => { e.stopPropagation(); isMember(c.id) ? leaveCommunity(c.id) : joinCommunity(c.id) }}>
                    {isMember(c.id) ? 'Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Create Community */}
          {page === 'create-community' && (
            <>
              <div className="page-header">
                <button className="btn-back" onClick={() => setPage('communities')}><Icons.ArrowLeft /></button>
                <h2>Create Community</h2>
              </div>
              <form className="create-form" onSubmit={createCommunity}>
                <input placeholder="Community name" value={newCommunityName} onChange={e => setNewCommunityName(e.target.value)} required />
                <textarea placeholder="Description" value={newCommunityDesc} onChange={e => setNewCommunityDesc(e.target.value)} rows={3} />
                <button type="submit" className="btn-submit" disabled={!newCommunityName.trim()}>Create</button>
              </form>
            </>
          )}

          {/* View Community */}
          {page === 'view-community' && viewingCommunity && (
            <>
              <div className="community-header">
                <img src={viewingCommunity.image_url} />
                <div>
                  <h2>r/{viewingCommunity.name}</h2>
                  <p>{viewingCommunity.description}</p>
                  <span>{viewingCommunity.memberCount || 0} members</span>
                </div>
                <button className={`btn-join ${isMember(viewingCommunity.id) ? 'joined' : ''}`} onClick={() => isMember(viewingCommunity.id) ? leaveCommunity(viewingCommunity.id) : joinCommunity(viewingCommunity.id)}>
                  {isMember(viewingCommunity.id) ? 'Joined' : 'Join'}
                </button>
              </div>
              {viewingCommunity.posts?.length === 0 ? (
                <div className="empty">No posts</div>
              ) : (
                viewingCommunity.posts?.map(post => <PostCard key={post.id} post={post} showCommunity={false} />)
              )}
            </>
          )}

          {/* Activity */}
          {page === 'activity' && (
            <>
              <h2>Notifications</h2>
              {activities.length === 0 ? (
                <div className="empty">No notifications</div>
              ) : (
                activities.map(a => (
                  <div key={a.id} className="activity-item">
                    <img src={getAvatar(a.actor?.avatar_url, a.actor?.username)} />
                    <div>
                      <strong>{a.actor?.display_name}</strong>
                      {a.type === 'like' && ' liked your post'}
                      {a.type === 'reply' && ' replied to your post'}
                      {a.type === 'follow' && ' followed you'}
                      {a.type === 'mention' && ' mentioned you'}
                      <span className="time">{formatTime(a.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Profile */}
          {page === 'profile' && (
            <>
              <div className="profile-header">
                <img src={getAvatar(profile?.avatar_url, user.email)} />
                {editMode ? (
                  <div className="profile-edit">
                    <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Bio" rows={2} />
                    <div className="edit-btns">
                      <button onClick={saveProfile}>Save</button>
                      <button onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info">
                    <h2>{profile?.display_name} {profile?.is_verified && <Icons.Verified />}</h2>
                    <p className="handle">@{profile?.username}</p>
                    {profile?.bio && <p className="bio">{profile.bio}</p>}
                    <button onClick={() => { setEditName(profile?.display_name || ''); setEditBio(profile?.bio || ''); setEditMode(true) }}>Edit Profile</button>
                  </div>
                )}
              </div>
              <h3 className="section-title">Your Posts</h3>
              {posts.filter(p => p.user_id === user.id).length === 0 ? (
                <div className="empty small">No posts yet</div>
              ) : (
                posts.filter(p => p.user_id === user.id).map(post => <PostCard key={post.id} post={post} />)
              )}
            </>
          )}

          {/* View Profile */}
          {page === 'view-profile' && viewingProfile && (
            <>
              <div className="page-header">
                <button className="btn-back" onClick={() => setPage('home')}><Icons.ArrowLeft /></button>
                <h2>Profile</h2>
              </div>
              <div className="profile-header">
                <img src={getAvatar(viewingProfile.avatar_url, viewingProfile.username)} />
                <div className="profile-info">
                  <h2>{viewingProfile.display_name} {viewingProfile.is_verified && <Icons.Verified />}</h2>
                  <p className="handle">@{viewingProfile.username}</p>
                  <div className="profile-stats">
                    <span><strong>{viewingProfile.posts?.length || 0}</strong> posts</span>
                    <span><strong>{viewingProfile.followersCount || 0}</strong> followers</span>
                    <span><strong>{viewingProfile.followingCount || 0}</strong> following</span>
                  </div>
                  {viewingProfile.bio && <p className="bio">{viewingProfile.bio}</p>}
                  <div className="profile-actions">
                    <button className={`btn-follow ${viewingProfile.isFollowing ? 'following' : ''}`} onClick={() => { toggleFollow(viewingProfile); setViewingProfile({ ...viewingProfile, isFollowing: !viewingProfile.isFollowing }) }}>
                      {viewingProfile.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="btn-message" onClick={() => startConversation(viewingProfile.id)}>
                      <Icons.MessageCircle /> Message
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="section-title">Posts</h3>
              {viewingProfile.posts?.length === 0 ? (
                <div className="empty small">No posts</div>
              ) : (
                viewingProfile.posts?.map(post => <PostCard key={post.id} post={{...post, profiles: viewingProfile}} />)
              )}
            </>
          )}

          {/* Settings */}
          {page === 'settings' && (
            <>
              <h2>Settings</h2>
              <div className="settings-section">
                <h3><Icons.Palette /> Theme</h3>
                <div className="theme-options">
                  <button className={themeMode === 'light' ? 'active' : ''} onClick={() => setThemeMode('light')}>Light</button>
                  <button className={themeMode === 'dark' ? 'active' : ''} onClick={() => setThemeMode('dark')}>Dark</button>
                  <button className={themeMode === 'oled' ? 'active' : ''} onClick={() => setThemeMode('oled')}>OLED</button>
                </div>
              </div>
              <div className="settings-section">
                <h3><Icons.Palette /> Accent Color</h3>
                <div className="color-options">
                  {['#1d9bf0', '#7856ff', '#f91880', '#ff7a00', '#00ba7c', '#ffd400'].map(color => (
                    <button key={color} className={`color-btn ${accentColor === color ? 'active' : ''}`} style={{background: color}} onClick={() => setAccentColor(color)} />
                  ))}
                </div>
              </div>
              <div className="settings-section">
                <h3><Icons.VolumeX /> Muted Keywords</h3>
                <div className="muted-list">
                  {mutedKeywords.map(kw => (
                    <span key={kw} className="muted-chip">{kw} <button onClick={() => removeMutedKeyword(kw)}>×</button></span>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); addMutedKeyword(e.target.keyword.value); e.target.reset() }} className="add-muted-form">
                  <input name="keyword" placeholder="Add keyword to mute..." />
                  <button type="submit"><Icons.Plus /></button>
                </form>
              </div>
            </>
          )}

          {/* Lists */}
          {page === 'lists' && (
            <>
              <div className="page-header">
                <h2>Lists</h2>
              </div>
              <form onSubmit={e => { e.preventDefault(); createList() }} className="create-list-form">
                <input placeholder="New list name..." value={newListName} onChange={e => setNewListName(e.target.value)} />
                <button type="submit" disabled={!newListName.trim()}><Icons.Plus /></button>
              </form>
              {lists.length === 0 ? (
                <div className="empty">No lists yet</div>
              ) : (
                lists.map(list => (
                  <div key={list.id} className="list-item" onClick={() => { setViewingList(list); setPage('view-list') }}>
                    <Icons.List />
                    <div><div className="name">{list.name}</div><div className="sub">{list.list_members?.length || 0} members</div></div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Topics */}
          {page === 'topics' && (
            <>
              <h2>Topics</h2>
              <p className="topics-intro">Follow topics to see more of what you're interested in.</p>
              <div className="topics-grid">
                {topics.map(topic => (
                  <div key={topic.id} className={`topic-card ${myTopics.includes(topic.id) ? 'following' : ''}`}>
                    <span className="topic-name">{topic.name}</span>
                    <span className="topic-count">{topic.follower_count || 0} followers</span>
                    <button onClick={() => followTopic(topic.id)}>
                      {myTopics.includes(topic.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Drafts */}
          {page === 'drafts' && (
            <>
              <h2>Drafts</h2>
              {drafts.length === 0 ? (
                <div className="empty">No drafts saved</div>
              ) : (
                drafts.map(draft => (
                  <div key={draft.id} className="draft-item">
                    <p>{draft.content?.slice(0, 100)}{draft.content?.length > 100 ? '...' : ''}</p>
                    <div className="draft-actions">
                      <button onClick={() => loadDraft(draft)}><Icons.Edit /> Edit</button>
                      <button onClick={() => deleteDraft(draft.id)}><Icons.Trash /> Delete</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="sidebar-section">
            <h3><Icons.TrendingUp /> Trending</h3>
            {trendingTags.slice(0, 5).map(t => (
              <div key={t.tag} className="trending-item" onClick={() => { setSearchQuery(t.tag); setPage('search') }}>
                <span className="tag-name">#{t.tag}</span>
                <span className="tag-count">{t.count} posts</span>
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <h3>Communities</h3>
            {communities.slice(0, 5).map(c => (
              <div key={c.id} className="sidebar-item" onClick={() => goToCommunity(c)}>
                <img src={c.image_url} />
                <div><div className="name">r/{c.name}</div><div className="sub">{c.memberCount || 0} members</div></div>
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <h3>Who to Follow</h3>
            {users.slice(0, 4).map(u => (
              <div key={u.id} className="sidebar-item" onClick={() => goToProfile(u.id)}>
                <img src={getAvatar(u.avatar_url, u.username)} />
                <div><div className="name">{u.display_name} {u.is_verified && <Icons.Verified />}</div><div className="sub">@{u.username}</div></div>
                <button className={`btn-follow small ${u.isFollowing ? 'following' : ''}`} onClick={e => { e.stopPropagation(); toggleFollow(u) }}>
                  {u.isFollowing ? '✓' : '+'}
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom Nav */}
      <nav className="bottombar">
        <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><Icons.Home /></button>
        <button className={page === 'explore' ? 'active' : ''} onClick={() => setPage('explore')}><Icons.Compass /></button>
        <button className={page === 'create' ? 'active' : ''} onClick={() => setPage('create')}><Icons.Plus /></button>
        <button className={page === 'messages' ? 'active' : ''} onClick={() => setPage('messages')}><Icons.MessageCircle /></button>
        <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}><Icons.User /></button>
      </nav>
    </div>
  )
}

export default App
