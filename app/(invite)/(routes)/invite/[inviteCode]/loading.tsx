import { Loader } from "lucide-react";

const loading = () => {
  return (
    <div className="flex h-full items-center justify-center absolute inset-0">
      <Loader className="animate-spin transition" />
    </div>
  );
};

export default loading;
