import styled, { css } from 'styled-components';

export interface ButtonProps {
  width?: string;
}

const Button = styled.button<ButtonProps>`
  min-width: 16px;
  width: ${({ width }) => !width ? 'fit-content' : width};
  height: 26px;
  outline: none;
  font-size: 16px;
  border: 1px solid grey;
  border-radius: 1px;
  background: rgba(255, 255, 255, .7);
  color: rgba(0, 0, 0, .7);
  transition: all .2s ease-in;
  /* cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'}; */
  cursor: pointer;
  :hover {
    border: 1px solid rgba(0, 0, 0, .8);
    box-shadow: 2px 3px 6px rgba(0, 0, 0, .6);
    transform: translateY(-0.5px);
  }
  :active {
    box-shadow: 1px 5px 7px rgba(0, 0, 0, .2);
    transform: translateY(0.5px);
  }
  
  /* ${({ disabled }) => disabled ? '' : css`
  `} */
`;

export default Button;
