import { memo, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { getUserAvatar, getUserFirstName, getUserInitial } from "@/lib/utils/user";
import { SHADOW_STYLES } from "@/lib/constants";

interface FrameBusinessCardProps {
  user: User | null;
  coins: number;
  onSignOut: () => void;
}

export const FrameBusinessCard = memo<FrameBusinessCardProps>(({ 
  user, 
  coins, 
  onSignOut 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleSettingsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Settings clicked");
  }, []);

  const handleSignOutClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSignOut();
  }, [onSignOut]);

  const cardStyle = {
    backfaceVisibility: "hidden" as const,
    boxShadow: SHADOW_STYLES.CARD,
  };

  const frontCardStyle = {
    ...cardStyle,
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const backCardStyle = {
    ...cardStyle,
    transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
  };

  const avatar = getUserAvatar(user);

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        {/* 클립 */}
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full shadow-lg z-20 flex items-center justify-center transform rotate-12">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>

        {/* 명함 컨테이너 */}
        <div
          className="relative w-32 h-20 cursor-pointer transform rotate-1"
          onClick={handleCardClick}
          style={{ perspective: "1200px" }}
        >
          {/* 명함 앞면 */}
          <div
            className="absolute inset-0 bg-white rounded-xl transition-transform duration-500"
            style={frontCardStyle}
          >
            <div className="p-2 h-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-6 h-6 rounded-full ring-1 ring-gray-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-gray-200">
                    {getUserInitial(user)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-900 truncate">
                    {getUserFirstName(user)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs">🪙</span>
                <div className="font-bold text-xs text-yellow-600 whitespace-nowrap">
                  {coins}
                </div>
              </div>
            </div>
          </div>

          {/* 명함 뒷면 */}
          <div
            className="absolute inset-0 bg-white rounded-xl transition-transform duration-500"
            style={backCardStyle}
          >
            <div className="p-2 h-full flex flex-col justify-center space-y-1">
              <button
                className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                onClick={handleSettingsClick}
              >
                <span className="text-xs">⚙️</span>
                <span className="font-medium">설정</span>
              </button>
              <button
                className="w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                onClick={handleSignOutClick}
              >
                <span className="text-xs">🚪</span>
                <span className="font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FrameBusinessCard.displayName = "FrameBusinessCard";