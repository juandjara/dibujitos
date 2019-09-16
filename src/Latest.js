import React, { Component } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import theme from './theme';
import Waypoint from 'react-waypoint';
import { sourceOptions, endpoint } from './config';
import Spinner from './Spinner';
import { getWatchedEpisodes, removeWatchedEpisode } from './lastWatchedService';
import Icon from './Icon';

const LatestStyles = styled.div`
  flex-grow: 1;
  .column-inner {
    max-width: 768px;
    margin: 0 auto;
  }
  .last-watched {
    > h2 {
      font-weight: normal;
      margin-left: 6px;
      margin-bottom: .5rem;
    }
  }
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  margin: 16px 8px;

  & + p {
    margin: .5rem;
    margin-top: 2rem;
  }

  .title {
    margin-right: 2rem;
    > h2 {
      font-weight: lighter;
      font-size: 2rem;
      margin-top: 24px;
      margin-bottom: 4px;
    }
    p {
      color: #999;
    }
  }
  .select-box {
    margin-top: 1rem;
    min-width: 210px;
    label {
      display: block;
      margin-bottom: 4px;
    }
  }
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  ${props => props.horizontal ? `
    flex-wrap: nowrap;
    overflow-x: scroll;
    justify-content: flex-start;
  `:`
    flex-wrap: wrap;
    justify-content: space-evenly;
  `}
  @media (max-width: 420px) {
    display: block;
    li {
      margin: 12px auto;
      max-width: 242px;
    }
  }
`;

const EpisodeCard = styled.li`
  position: relative;
  margin: 3px 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 2px;
  &:hover {
    border: 2px solid ${theme.colors.secondary};
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
  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px;
    background: rgba(255,255,255, 0.75);
    opacity: 0.5;
    border: none;
    cursor: pointer;
    border-bottom-left-radius: 4px;
    .material-icons {
      font-size: 14px;
    }
    &:hover {
      opacity: 1;
    }
  }
`;

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
      this.setState({
        page: 0,
        episodes: []
      }, () => this.fetch())
    }
  }

  async fetch() {
    this.setState({loading: true});
    const {page, source} = this.state;
    const search = this.props.search;
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
    if (this.state.loading) {
      return;
    }
    this.setState(state => ({
      ...state,
      page: state.page + 1
    }), () => this.fetch());
  }

  handleSourceChange = (source) => {
    this.setState(state => ({
      ...state,
      source,
      page: 0,
      episodes: []
    }), () => this.fetch())
  }

  removeWatchedEpisode(ev, ep) {
    ev.preventDefault();
    removeWatchedEpisode(ep);
    // TODO: replace hacky way for to force update
    this.setState({loading: this.state.loading});
  }

  render() {
    const search = this.props.search;
    const {loading, source, episodes} = this.state;
    const lastwatched = getWatchedEpisodes();
    return (
      <LatestStyles className="column"
        containerRef={ref => this.containerRef = ref}>
        <div className="column-inner">
          <div className="last-watched">
            {lastwatched.length > 0 && (
              <h2>Ultimamente has visto</h2>
            )}
            <List horizontal>
            {lastwatched.map(ep => (
              <EpisodeCard key={`${ep.id}-${ep.epNumber}`}>
                <Link to={`/show/${ep.id}?ep=${ep.epNumber}`}>
                  <img src={ep.img} alt="portada del show" />
                  <div>
                    <p className="title">
                      <span>{ep.title}</span>
                      <span>Ep. {ep.epNumber}</span>
                    </p>
                  </div>
                  <button onClick={ev => this.removeWatchedEpisode(ev, ep)} className="close-btn">
                    <Icon icon="close" />
                  </button>
                </Link>
              </EpisodeCard>
            ))}
            </List>
          </div>
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
          <p>Capitulos de anime en streaming desde torrents de HorribleSubs</p>
          <List>
            {episodes.map((ep, i) => (
              <EpisodeCard key={`${ep.slug}-${ep.episodeNumber}`}>
                <Link to={`/show/${ep.slug}`}>
                  <img src={ep.posterImage && ep.posterImage.small} alt="portada del show" />
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
              </EpisodeCard>
            ))}
          </List>
          {loading && <Spinner />}
          <Waypoint scrollableAncestor={this.containerRef} onEnter={this.handleNextPage}>
            <div style={{height: 50, width: 10}}></div>
          </Waypoint>
        </div>
      </LatestStyles>
    );
  }
}

export default Latest;
