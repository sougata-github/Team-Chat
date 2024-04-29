"use client";

const error = () => {
  return (
    <div className="p-4 h-full w-full bg-white dark:bg-[#313338] flex items-center justify-center">
      <p className="text-center text-xl dark:text-white text-gray-600">
        Oops! The invite link to this server has most likely changed.
      </p>
    </div>
  );
};

export default error;
