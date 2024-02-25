import React from "react";

const page = ({ params }: { params: { channelId: string } }) => {
  return <div>{params.channelId}</div>;
};

export default page;
