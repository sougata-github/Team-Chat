import { Loader } from "lucide-react";

const loading = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader className="animate-spin transition" />
    </div>
  );
};

export default loading;
