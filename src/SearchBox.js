import styled from 'styled-components';

const SearchBox = styled.div`
  background-color: ${props => props.background || 'rgba(255,255,255, 0.2)'};
  border-radius: 8px;
  margin: 0 auto;
  input {
    font-size: 16px;
    line-height: 26px;
    padding: 2px 8px;
    outline: none;
    border: 2px solid transparent;
    background: transparent;
    color: ${props => props.color || 'white'};
    min-width: 200px;
    &::placeholder {
      color: ${props => props.placeholderColor || 'white'};
      opacity: 0.5;
    }
  }
  .material-icons {
    opacity: 0.5;
    padding-right: 4px;
  }
`;

export default SearchBox;