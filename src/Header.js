import React from 'react';
import styled from 'styled-components';
import Icon from './Icon';
import theme from './theme';
import { withRouter, Link } from 'react-router-dom';
import Headroom from 'react-headroom';
import SearchBox from './SearchBox';

const HeaderStyle = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 6px 12px;
  color: white;
  background-color: ${theme.colors.primaryDark};
  > a {
    display: flex;
    color: inherit;
    align-items: center;
  }
  .logo {
    height: 36px;
    margin-right: 6px;
  }
  h2 {
    padding: 6px 0;
    font-size: 30px;
    line-height: 36px;
    font-weight: 300;
    margin-left: 4px;
  }
`;

class Header extends React.Component {
  inputNode = null
  state = {
    search: ''
  }
  handleSearch = (ev) => {
    this.setState({search: ev.target.value})
  }
  handleKeyUp = (ev) => {
    if (ev.which === 13) {
      this.props.history.push(`/home?search=${this.state.search}`);
      if (this.inputNode) {
        this.inputNode.blur();
      }
    }
  }
  render() {
    return (
      <Headroom>
        <HeaderStyle>
          <Link to="/">
            <img alt="logo" className="logo" src="/dibujitos_icon.png"></img>
            <h2>Dibujitos</h2>
          </Link>
          <div style={{flexGrow: 1}}></div>
          <SearchBox>
            <input
              type="search"
              ref={node => this.inputNode = node}
              value={this.state.search}
              onChange={this.handleSearch}
              onKeyUp={this.handleKeyUp}
              placeholder="¿Que quieres ver?" />
            <Icon icon="search" />
          </SearchBox>
        </HeaderStyle>
      </Headroom>
    );
  }
}

export default withRouter(Header);
