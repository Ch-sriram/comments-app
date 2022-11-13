// /**
//  * Some Notes
//  * -----------
//  * 
//  * Creating recursive components is not easy. This component was the first attempt at recursing on comments, and honestly,
//  * the code in here looks spaghettiesque. Still keeping this component since getting back to this component can give me some idea on 
//  * where I went wrong in creating a component.
//  */

// import * as React from 'react';
// import styled, { css } from 'styled-components';
// import { CollectionTypes, DocumentTypes } from '@db/types';
// import { CommentAction, getIcon } from '../util';
// import { ActiveComment, ActiveCommentType } from '../../App';
// import CommentForm, { SubmitLabel } from './Form/CommentForm';

// const noop = () => undefined;

// const CommentBox = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-start;
//   border: 1px solid #22202017;
//   padding: 10px;
//   min-width: 80%;
//   border-radius: 4px;
// `;

// const CommentWrapper = styled.div<{commentLevel?: number, isReplyOrEdit?: boolean}>`
//   display: flex;
//   gap: 10px;
//   position: relative;
//   margin-bottom: ${({ isReplyOrEdit }) => !isReplyOrEdit ? 15 : 24}px;
//   flex-wrap: wrap;
//   ${({ commentLevel }) => !commentLevel ? '' : css`
//     left: ${(commentLevel * 3)}%;
//   `};
// `;

// const StyledUserName = styled.h3`
//   margin: 0 0 10px 0;
// `;

// const CommentBody = styled.div`
//   font-family: 'Ubuntu', sans-serif;
// `;

// const AvatarWrap = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 50px;
// `;

// const AvatarImage = styled.img`
//   width: 40px;
//   border-radius: 50%;
//   border: 2px solid blue;
// `;

// const CommentBoxWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const CommentActions = styled.div`
//   display: flex;
//   gap: 32px;
//   margin-left: 5px;
// `;

// const CommonActionWrapperSpan = styled.span`
//   cursor: pointer;
//   transition: .1s all ease-out;
//   :hover {
//     transform: translateY(-1px);
//   }
// `;

// const UpvoteWrapper = styled(CommonActionWrapperSpan)`
//   color: steelblue;
//   transform: translateY(1px);
//   :active {
//     svg {
//       fill: #4682d6;
//     }
//   }
// `;

// export const DownvoteWrapper = styled(CommonActionWrapperSpan)`
//   color: indianred;
//   transform: translateY(-1px);
//   :hover {
//     transform: translateY(1px);
//   }
//   :active {
//     svg {
//       fill: #cd5d5d;
//     }
//   }
// `;

// const ReplyWrapper = styled(CommonActionWrapperSpan)`
//   color: darkslateblue;
// `;

// const EditWrapper = styled(CommonActionWrapperSpan)`
//   color: darkviolet;
// `;

// const DeleteWrapper = styled(CommonActionWrapperSpan)`
//   color: orangered;
// `;

// const CommentFormWrapper = styled.div`
//   display: flex;
//   flex-flow: column;
//   flex-grow: 1;
// `;

// export type CommentActionHandlerType<T = void> = (commentId: string, parentId?: string) => T;
// export type CommentSubmitHandler = (body: string, id: string) => void;

// export interface CommentProps {
//   comment: DocumentTypes.Comment;
//   replies: CollectionTypes.Comments;
//   commentLevel?: number;
//   activeComment?: ActiveCommentType;
//   canRecurse: boolean;
//   commentContainsChildren: boolean;
//   getReplies: CommentActionHandlerType<CollectionTypes.Comments>;
//   onUpvote?: CommentActionHandlerType;
//   onDownvote?: CommentActionHandlerType;
//   onEditClick?: CommentActionHandlerType;
//   onReplyClick?: CommentActionHandlerType;
//   onCommentDelete?: CommentActionHandlerType;
//   onCommentEdit?: CommentSubmitHandler;
//   onCommentReply?: CommentSubmitHandler;
//   onCommentCancel?: () => void;
// }

// const Comment = (props: CommentProps) => {
//   const {
//     comment: {
//       userId,
//       id: commentId,
//       parentId,
//       commentTextBody
//     },
//     replies,
//     commentLevel = 0,
//     activeComment,
//     getReplies,
//     canRecurse,
//     commentContainsChildren,
//     onEditClick = noop,
//     onReplyClick = noop,
//     onCommentEdit = noop,
//     onCommentReply = noop,
//     onCommentCancel = noop,
//   } = props;
//   const imageUriHash = userId || 'anonymous';
//   const isReplying = activeComment?.commentType === ActiveComment.REPLY && activeComment.commentId === parentId;
//   const isEditing = activeComment?.commentType === ActiveComment.EDIT && activeComment.commentId === commentId;
//   const isReplyOrEdit = isReplying || isEditing;
//   return (
//     <React.Fragment>
//       <CommentWrapper
//         className="comment-wrapper"
//         commentLevel={commentLevel}
//         isReplyOrEdit={isReplyOrEdit}
//       >
//         <AvatarWrap className="comment-avatar">
//           <AvatarImage
//             loading="lazy"
//             alt={imageUriHash}
//             src={`https://robohash.org/${imageUriHash}?set=set2`}
//           />
//         </AvatarWrap>
//         {isReplyOrEdit &&
//           <CommentFormWrapper>
//             <CommentForm
//               hasCancelButton={true}
//               submitLabel={isReplying ? SubmitLabel.REPLY : SubmitLabel.UPDATE}
//               handleCommentCancel={onCommentCancel}
//               handleCommentSubmit={commentBody => isReplying ? 
//                 onCommentReply(commentBody, parentId) : onCommentEdit(commentBody, commentId)}
//               commentBody={isEditing ? commentTextBody : undefined}
//             />
//           </CommentFormWrapper>}
//         {!isReplying && !isEditing && <>
//           <CommentBoxWrapper className="comment-box-wrapper">
//             <CommentBox className="comment-box">
//               <StyledUserName>{(props.comment as any)?.userName || 'username'}</StyledUserName>
//               <CommentBody className="comment-text-body">
//                 {commentTextBody}
//               </CommentBody>
//             </CommentBox>
//             <CommentActions className="comment-actions">
//               <UpvoteWrapper title="Upvote Comment">{getIcon(CommentAction.UPVOTE)}</UpvoteWrapper>
//               <ReplyWrapper
//                 title="Reply to this Comment"
//                 onClick={() => onReplyClick(commentId, parentId as (string | undefined))}
//               >
//                 {getIcon(CommentAction.REPLY)}
//               </ReplyWrapper>
//               <EditWrapper
//                 title="Edit Comment"
//                 className="comment-edit"
//                 onClick={() => onEditClick(commentId)}
//               >
//                 {getIcon(CommentAction.EDIT)}
//               </EditWrapper>
//               <DeleteWrapper title="Delete Comment">{getIcon(CommentAction.DELETE)}</DeleteWrapper>
//             </CommentActions>
//           </CommentBoxWrapper>
//         </>}
//       </CommentWrapper>
//       {canRecurse && replies.length > 0 && replies.map(replyComment => (
//         <Comment
//           {...props}
//           key={replyComment.id}
//           comment={replyComment}
//           replies={getReplies(replyComment.id)}
//           commentLevel={commentLevel + 1}
//         />))}
//       {/* Added to get into one more comment section for adding the reply form */}
//       {!commentContainsChildren && canRecurse && !isEditing && (commentId === activeComment?.commentId) && (activeComment?.commentType === ActiveComment.REPLY) &&
//         <Comment
//           {...props}
//           comment={{ ...props.comment, parentId: commentId, commentTextBody: '', id: '' }}
//           commentLevel={commentLevel + 1}
//           replies={[]}
//           canRecurse={false}
//         />}
//     </React.Fragment>
//   );
// };

// export default Comment as React.FC<CommentProps>;
export {  }; // added to compile
