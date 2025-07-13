interface LoginScreenProps {
  onSignIn: () => void;
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 DoneDrop
          </h1>
          <p className="text-gray-600">
            아날로그 감성의 할일 관리 앱
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-md transform rotate-2 shadow-md">
              <span className="text-sm">할일 작성</span>
            </div>
            <span className="mx-3 text-2xl">→</span>
            <div className="bg-pink-100 border-2 border-pink-300 p-4 rounded-md transform -rotate-1 shadow-md">
              <span className="text-sm">완료!</span>
            </div>
            <span className="mx-3 text-2xl">→</span>
            <div className="text-4xl">🪙</div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            포스트잇으로 할일을 관리하고 코인을 모아보세요
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              로그인하면 모든 기기에서 할일을 동기화할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}