import React, { Component } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import theme from './theme';
import PerfectScrollbar from 'react-perfect-scrollbar'
import Waypoint from 'react-waypoint';

const LatestStyles = styled(PerfectScrollbar)`
  flex-grow: 1;
  max-width: 768px;
  margin: 0 auto;
  .loading {
    text-align: center;
    margin-top: 12px;
  }
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 14px;
  margin-top: 36px;
  .title {
    > h2 {
      font-weight: normal;
      margin-top: 25px;
      margin-bottom: 5px;
    }
    > p {
      margin-top: 5px;
    }
  }
  .select-box {
    min-width: 210px;
    label {
      display: block;
      margin-bottom: 8px;
    }
  }
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  li {
    position: relative;
    margin: 3px 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 2px;
    &:hover {
      border-color: ${theme.colors.secondary};
    }
    > a {
      display: block;
      color: inherit;
      height: 340px;
      > div {
        padding: 8px;
        position: absolute;
        bottom: 0;
        left: 0;
        background: rgba(255,255,255, 0.9);
        width: 100%;
      }
    }
    img {
      width: 240px;
      height: 340px;
    }
    p {
      margin: 5px 0;
    }
    .title {
      display: flex;
      span:first-child {
        color: ${theme.colors.primary};
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex: 1;
      }
    }
    .date {
      .material-icons {
        margin-right: 6px;
      }
    }
  }
`;

const sourceOptions = [
  {label: 'HorribleSubs - Inglés', value: 'hs'},
  {label: 'PuyaSubs - Español', value: 'py'}
]
const endpoint = "https://nyapi.fuken.xyz";

function formatDate(ms) {
  const date = new Date(ms);
  return format(date, 'DD/MM - HH:mm');
}

class Latest extends Component {
  containerRef = null
  state = {
    page: 0,
    episodes: [],
    source: sourceOptions[0],
    loading: true
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.search !== this.props.search) {
      this.fetch();
    }
  }

  async fetch() {
    const {page, loading, source} = this.state;
    const search = this.props.search;
    console.log('fetching with props ', [page, loading, source, search])
    const url = `${endpoint}/latest?page=${page}&q=${search}&source=${source.value}`;
    const res = await window.fetch(url);
    const json = await res.json();
    this.setState(state => ({
      ...state,
      loading: false,
      episodes: state.episodes.concat(json)
    }));
  }

  handleNextPage = () => {
    this.setState(state => ({
      ...state,
      page: state.page + 1,
      loading: true
    }), () => this.fetch());
  }

  handleSourceChange = (source) => {
    this.setState(state => ({
      ...state,
      source,
      loading: true,
      episodes: []
    }), () => this.fetch())
  }

  render() {
    const search = this.props.search;
    const {loading, source, episodes} = this.state;
    return (
      <LatestStyles containerRef={ref => this.containerRef = ref} className="column">
        <p style={{textAlign: 'center', margin: '1em'}}>
          Capitulos de anime en streaming desde torrents de HorribleSubs
        </p>
        <Header>
          <div className="title">
            <h2>{search ? 'Resultados de la búsqueda' : 'Ultimos Capitulos'}</h2>
            <p>Mostrando {episodes.length} resultados</p>
          </div>
          <div className="select-box">
            <label htmlFor="sort">Fuente</label>
            <Select
              isSearchable={false}
              value={source}
              options={sourceOptions}
              onChange={this.handleSourceChange}
            />
          </div>
        </Header>
        <List>
          {episodes.map((ep, i) => (
            <li key={`${ep.slug}-${ep.episodeNumber}`}>
              <Link to={`/shows/${ep.slug}`}>
                <img src={ep.posterImage.small} alt="portada del show" />
                <div>
                  <p className="title">
                    <span>{ep.showTitle}</span>
                    <span>Ep. {ep.episodeNumber}</span>
                  </p>
                  <p className="date">
                    <i className="material-icons">event</i>
                    <span>{formatDate(ep.episodeDate)}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </List>
        {loading ? null : (
          <Waypoint scrollableAncestor={this.containerRef} onEnter={this.handleNextPage}>
            <div style={{height: 10, width: 10}}></div>
          </Waypoint>
        )}
      </LatestStyles>
    );
  }
}

export default Latest;
