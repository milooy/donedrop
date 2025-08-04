import { FROG_EMOJIS } from "@/lib/constants";

interface BouncingFrogProps {
  onFrogClick?: () => void;
  isActive?: boolean;
}

export const BouncingFrog = ({
  onFrogClick,
  isActive = true,
}: BouncingFrogProps) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed pointer-events-auto z-30 cursor-pointer select-none transition-transform hover:scale-110"
      style={{
        left: "30px",
        bottom: "180px",
      }}
      onClick={onFrogClick}
      title="개구리를 클릭해서 개구리 모드로 전환하세요!"
    >
      {/* 개구리 본체 - CSS 애니메이션 */}
      <div className="text-4xl frog-idle">
        {FROG_EMOJIS.NORMAL}
      </div>
      
      {/* 개구리 그림자 - CSS 애니메이션 */}
      <div className="absolute -bottom-2 left-1/2 w-8 h-3 bg-black rounded-full frog-shadow" />
    </div>
  );
};
