import * as React from 'react';
import styled from 'styled-components';

export interface AvatarProps {
  userId: string;
  userName: string | null;
}

const AvatarWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: fit-content;
`;

const AvatarImage = styled.img`
  width: 40px;
  border-radius: 50%;
  border: 2px solid blue;
`;

const Avatar: React.FC<AvatarProps> = ({ userId, userName }) => {
  const imageUriHash = userId + userName;
  return (
    <AvatarWrap className="comment-avatar">
      <AvatarImage
        loading="lazy"
        alt={`${userName || 'anonymous'}'s image`}
        src={`https://robohash.org/${imageUriHash}?set=set2`}
      />
    </AvatarWrap>
  );
};

export default Avatar;
