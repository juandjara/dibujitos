import React, { Component } from 'react'
import Select from 'react-select'
import styled from 'styled-components'
import Waypoint from 'react-waypoint'
import { sourceOptions, endpoint } from './config'
import Spinner from './Spinner'
import { getWatchedEpisodes, removeWatchedEpisode } from './lastWatchedService'
import EpisodeCard from './EpisodeCard'
import Calendar from './Calendar'

const LatestStyles = styled.div`
  flex-grow: 1;
  .column-inner {
    max-width: 1168px;
    min-width: 70vw;
    margin: 0 auto;
    padding: 0 16px;
  }

  .top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .last-watched {
      flex-grow: 1;
      margin-right: 12px;
    }

    @media (max-width: 920px) {
      display: block;
    }
  }
  
  .last-watched {
    > h3 {
      font-weight: normal;
      font-size: 24px;
      margin-top: 2rem;
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
  margin: 12px 8px;
  margin-top: 42px;

  .title {
    margin-right: 2rem;
    > h2 {
      font-weight: lighter;
      font-size: 2rem;
      margin: 4px 0;
    }
    p {
      color: #999;
    }
  }

  .select-box {
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  grid-gap: 24px 16px;

  ${props => props.horizontalScroll ? `
    padding: 4px 8px;
    overflow-x: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .episode-card {
      overflow: hidden;
      flex: 0 0 240px;
    }
  ` : ''}
`;

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
          <div className="top-row">
            {lastwatched.length > 0 && (
              <div className="last-watched">
                <h3>Ultimamente has visto</h3>
                <List horizontalScroll>
                  {lastwatched.map(ep => (
                    <EpisodeCard
                      key={`${ep.id}-${ep.epNumber}`}
                      image={ep.img}
                      link={`/show/${ep.id}?ep=${ep.epNumber}&source=${source.value}`}
                      title={ep.title}
                      number={ep.epNumber}
                      onClose={ev => this.removeWatchedEpisode(ev, ep)}
                    />
                  ))}
                </List>
              </div>
            )}
            {/* <Calendar /> */}
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
          <List>
            {episodes.map((ep, i) => (
              <EpisodeCard
                key={`${ep.slug}-${ep.episodeNumber}`}
                image={ep.posterImage && ep.posterImage.small}
                link={`/show/${ep.slug}?source=${source.value}`}
                title={ep.showTitle}
                number={ep.episodeNumber}
                date={ep.episodeDate}
              />
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
