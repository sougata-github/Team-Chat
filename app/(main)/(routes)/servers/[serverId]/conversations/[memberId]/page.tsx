import React from "react";

const page = ({ params }: { params: { memberId: string } }) => {
  return <div>{params.memberId}</div>;
};

export default page;
