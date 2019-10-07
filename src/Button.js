import styled from 'styled-components';
import theme from './theme';

const Button = styled.button`
  cursor: pointer;
  padding: 6px 12px;
  margin: 4px;
  background: ${props => props.main ? theme.colors.secondary : 'white'};
  color: #191919;
  border: 1px solid ${props => props.main ? theme.colors.secondary : '#ccc'};
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px;
  &:hover, &:focus {
    border-color: ${props => props.main ? theme.colors.secondaryDark : '#191919'};
  }
  ${props => props.disabled ? `
    opacity: 0.5;
    pointer-events: none;
  ` : ''}
  ${props => props.clear ? `
    background: transparent;
    border: none;
    color: inherit;
    font-size: inherit;
    &:focus {
      background: rgba(255,255,255, 0.2);
    }
  ` : ''}
`;

export default Button;
