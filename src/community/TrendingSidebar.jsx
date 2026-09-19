// src/components/community/TrendingSidebar.jsx
// Right rail — starts flush at the top (spacer removed)

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, UserPlus, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getTrendingTags, getTrendingPosts } from "@/api/Communityapi";
import { Avatar } from "./ui";

// Fetch real trending tags from backend via API
// API returns: { success: true, tags: [{ tag, posts }, ...] }


const fetchSuggestedMembers = async () => [
  { id: "u1", name: "Amina Yusuf", role: "Student", photo: null },
  { id: "u2", name: "Farah Ahmed", role: "Teacher", photo: null },
  { id: "u3", name: "Hodan Ali", role: "Student", photo: null },
];

const TrendingTopicRow = ({ topic, rank }) => (
  <Link
    to={`/community?tag=${encodeURIComponent(topic.tag)}`}
    className="flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors group"
  >
    <span className="text-[11px] font-black text-gray-300 dark:text-gray-700 dark:text-gray-300 pt-0.5 w-4 flex-shrink-0">
      {rank}
    </span>
    <div className="min-w-0">
      <p className="text-[13.5px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#3F9100] dark:group-hover:text-[#9DE83A] transition-colors truncate">
        #{topic.tag}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-gray-600 dark:text-gray-400">
        {topic.posts} posts
      </p>
    </div>
  </Link>
);

const SuggestedMemberRow = ({ member }) => {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <Avatar name={member.name} photo={member.photo} size={32} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 truncate">
          {member.name}
        </p>
        <p className="text-[11px] text-gray-400 capitalize">{member.role}</p>
      </div>
      <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
        onClick={() => setFollowing((f) => !f)}
        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors ${following
            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            : "bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/15 text-[#3F9100] dark:text-[#9DE83A] hover:bg-[#2C2DE0]/20"
          }`}
      >
        {!following && <UserPlus size={11} />}
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
};

const TrendingSidebar = () => {
  const { t } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    Promise.all([getTrendingTags(), getTrendingPosts(5)])
      .then(([tagData, postData]) => {
        setTopics(tagData?.tags || []);
        setHotPosts(postData?.posts || []);
      })
      .catch(() => {
        setTopics([]);
        setHotPosts([]);
      });
    fetchSuggestedMembers().then(setMembers).catch(() => setMembers([]));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-6 py-6 sm:py-8 pr-2 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <Flame size={14} className="text-[#F5A623]" />
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 dark:text-gray-400">
              {t["trending.title"] ?? "Trending"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {topics.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-gray-400">
                {t["trending.empty"] ?? "Nothing trending yet"}
              </p>
            ) : (
              topics.map((topic, i) => (
                <TrendingTopicRow key={topic.tag} topic={topic} rank={i + 1} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <TrendingUp size={14} className="text-[#2C2DE0]" />
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 dark:text-gray-400">
              {t["trending.hotPosts"] ?? "Hot posts"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {hotPosts.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-gray-400">
                {t["trending.noPosts"] ?? "No trending posts yet"}
              </p>
            ) : (
              hotPosts.map((post) => (
                <Link
                  key={post._id}
                  to={`/community/post/${post._id}`}
                  className="block px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                >
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {post.title || post.content?.slice(0, 60) || (t["trending.untitled"] ?? "Untitled post")}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {post.likesCount ?? post.likes?.length ?? 0} likes · {post.commentsCount ?? post.comments?.length ?? 0} comments
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      

        <p className="px-3 text-[10px] text-gray-300 dark:text-gray-700 dark:text-gray-300 leading-relaxed">
          {t["trending.footer"] ?? "Topics update as the community posts."}
        </p>
      </div>
    </div>
  );
};

export default TrendingSidebar;