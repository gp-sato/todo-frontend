import React from 'react';

type LogoutButtonProps = {
  onLogout: () => Promise<void>;
  loggingOut: boolean;
};

export default function LogoutButton({onLogout, loggingOut}: LogoutButtonProps) {
  return (
    <button
      className="text-sm text-gray-500 hover:underline disabled:opacity-50"
      onClick={onLogout}
      disabled={loggingOut}
    >
      {loggingOut ? 'ログアウト中…' : 'ログアウト'}
    </button>
  );
};
