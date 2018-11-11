import React from 'react';
import styled from 'styled-components';
import Icon from './Icon';
import theme from './theme';
import { withRouter, Link } from 'react-router-dom';
import Headroom from 'react-headroom';

const HeaderStyle = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 6px 16px;
  color: white;
  background-color: ${theme.colors.primaryDark};
  > a {
    display: flex;
    color: inherit;
    align-items: center;
  }
  .logo {
    height: 44px;
    margin-right: 8px;
  }
  h2 {
    padding: 6px 0;
    font-size: 30px;
    line-height: 36px;
    font-weight: 300;
    margin-left: 4px;
  }
  .search-box {
    background-color: rgba(255,255,255, 0.2);
    border-radius: 8px;
    margin: 0 auto;
    input {
      font-size: 16px;
      line-height: 26px;
      padding: 2px 8px;
      outline: none;
      border: 2px solid transparent;
      background: transparent;
      color: white;
      min-width: 200px;
    }
    .material-icons {
      opacity: 0.5;
      padding-right: 4px;
    }
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
            {/* <img alt="logo" className="logo" src="/palomitas-outline.png"></img> */}
            <h2>Dibujitos</h2>
          </Link>
          <div style={{flexGrow: 1}}></div>
          <div className="search-box">
            <input
              type="search"
              ref={node => this.inputNode = node}
              value={this.state.search}
              onChange={this.handleSearch}
              onKeyUp={this.handleKeyUp}
              placeholder="¿Que quieres ver?" />
            <Icon icon="search" />
          </div>
        </HeaderStyle>
      </Headroom>
    );
  }
}

export default withRouter(Header);
