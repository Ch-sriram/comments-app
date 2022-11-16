import {
  CaretTop as Upvote,
  Reply,
  Edit,
  Trash as Delete,
  GitHub,
  BytesizeIconsProps
} from 'react-bytesize-icons';

export const ACTION_ICONS_DEFAULT_SIZE = 18;

export enum CommentAction {
  UPVOTE = 'upvote',
  REPLY = 'reply',
  EDIT = 'edit',
  DELETE = 'delete'
}

export type CommentActionType = `${CommentAction}`;

export const getIcon = (iconType: CommentActionType, width?: number) => {
  const iconProps = { width: width || ACTION_ICONS_DEFAULT_SIZE };
  switch (iconType) {
    case CommentAction.UPVOTE: return <Upvote {...iconProps} />;
    case CommentAction.REPLY: return <Reply {...iconProps} />;
    case CommentAction.EDIT: return <Edit {...iconProps} />;
    case CommentAction.DELETE: return <Delete {...iconProps} />;
    default: return null;
  }
};

export const getGitHubIcon = (props: BytesizeIconsProps) => <GitHub {...props} />;
